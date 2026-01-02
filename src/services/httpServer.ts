import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransferStore } from '../stores/transferStore';
import type { TransferRequest, TransferResponse, FileInfo, Transfer } from '../types/transfer';
import type { Device } from '../types/device';
import { transferEvents } from './transferEvents';

// Import HTTP server module only on native platforms
let httpServerModule: any = null;
if (Platform.OS !== 'web') {
    httpServerModule = require('expo-http-server');
}

interface Session {
    sessionId: string;
    senderInfo: Device;
    files: Map<string, { fileInfo: FileInfo; token: string; received: boolean }>;
    status: 'pending' | 'accepted' | 'receiving' | 'completed' | 'cancelled';
    createdAt: number;
}

class HttpServer {
    private server: any = null;
    private isRunning = false;
    private sessions = new Map<string, Session>();
    private pendingTransfers = new Map<string, { request: TransferRequest; resolve: (accepted: boolean) => void }>();
    private port: number = 53317;

    async start(): Promise<boolean> {
        if (Platform.OS === 'web') {
            console.log('HTTP server not supported on web platform');
            return false;
        }

        if (this.isRunning) {
            console.log('HTTP server already running');
            return true;
        }

        try {
            const settings = useSettingsStore.getState();
            this.port = settings.serverPort;

            // Start HTTP server
            this.server = await httpServerModule.start(this.port, {
                '/api/localsend/v2/register': this.handleRegister.bind(this),
                '/api/localsend/v2/prepare-upload': this.handlePrepareUpload.bind(this),
                '/api/localsend/v2/upload': this.handleUpload.bind(this),
                '/api/localsend/v2/cancel': this.handleCancel.bind(this),
                '/api/localsend/v2/info': this.handleInfo.bind(this),
            });

            this.isRunning = true;
            console.log(`HTTP server started on port ${this.port}`);
            return true;
        } catch (error) {
            console.error('Failed to start HTTP server:', error);
            return false;
        }
    }

    async stop(): Promise<void> {
        if (!this.isRunning || !this.server) {
            return;
        }

        try {
            await httpServerModule.stop(this.server);
            this.server = null;
            this.isRunning = false;
            this.sessions.clear();
            console.log('HTTP server stopped');
        } catch (error) {
            console.error('Failed to stop HTTP server:', error);
        }
    }

    /**
     * POST /api/localsend/v2/register
     * Response to multicast UDP announcement
     */
    private async handleRegister(req: any): Promise<any> {
        try {
            const deviceInfo: Device = {
                fingerprint: req.body.fingerprint,
                alias: req.body.alias,
                deviceType: req.body.deviceType,
                deviceModel: req.body.deviceModel,
                ipAddress: req.connection.remoteAddress,
                port: req.body.port || 53317,
                protocol: req.body.protocol || 'http',
                version: req.body.version,
                lastSeen: Date.now(),
                isOnline: true,
            };

            console.log(`Device registered: ${deviceInfo.alias} from ${deviceInfo.ipAddress}`);

            // Return our info
            const settings = useSettingsStore.getState();
            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alias: settings.deviceAlias,
                    version: '2.0',
                    deviceModel: Platform.OS,
                    deviceType: Platform.OS === 'ios' || Platform.OS === 'android' ? 'mobile' : 'desktop',
                    fingerprint: settings.deviceId,
                    download: false, // Download API not yet implemented
                }),
            };
        } catch (error) {
            console.error('Error handling register:', error);
            return { status: 500, body: 'Internal Server Error' };
        }
    }

    /**
     * POST /api/localsend/v2/prepare-upload
     * Receive file metadata and decide whether to accept
     */
    private async handlePrepareUpload(req: any): Promise<any> {
        try {
            const settings = useSettingsStore.getState();

            // Check PIN if required
            if (settings.requirePin) {
                const pin = req.query.pin;
                if (!pin || pin !== settings.pin) {
                    return { status: 403, body: 'Invalid PIN' };
                }
            }

            const request: TransferRequest = req.body;
            const sessionId = this.generateSessionId();

            // Create session
            const session: Session = {
                sessionId,
                senderInfo: {
                    fingerprint: request.info.fingerprint,
                    alias: request.info.alias,
                    deviceType: (request.info.deviceType as any) || 'mobile',
                    deviceModel: request.info.deviceModel,
                    ipAddress: req.connection.remoteAddress,
                    port: 53317,
                    protocol: 'http',
                    version: request.info.version,
                    lastSeen: Date.now(),
                    isOnline: true,
                },
                files: new Map(),
                status: 'pending',
                createdAt: Date.now(),
            };

            // Process files and generate tokens
            const fileTokens: { [key: string]: string } = {};
            const fileInfos: FileInfo[] = [];

            for (const [fileId, fileData] of Object.entries(request.files)) {
                const token = this.generateToken();
                const fileInfo: FileInfo = {
                    id: fileId,
                    fileName: fileData.fileName,
                    size: fileData.size,
                    fileType: fileData.fileType,
                    preview: fileData.preview,
                    uri: '', // Will be set when file is received
                    mimeType: fileData.fileType,
                };

                session.files.set(fileId, {
                    fileInfo,
                    token,
                    received: false,
                });

                fileTokens[fileId] = token;
                fileInfos.push(fileInfo);
            }

            this.sessions.set(sessionId, session);

            // Auto-accept if enabled, otherwise wait for user confirmation
            if (settings.autoAccept) {
                session.status = 'accepted';
                this.addTransferToStore(sessionId, session, fileInfos);
            } else {
                // Emit event for manual acceptance
                transferEvents.emitIncomingTransfer(sessionId, request);

                // Wait for user decision (with timeout)
                const accepted = await new Promise<boolean>((resolve) => {
                    this.pendingTransfers.set(sessionId, { request, resolve });

                    // Auto-reject after 2 minutes if no response
                    setTimeout(() => {
                        if (this.pendingTransfers.has(sessionId)) {
                            this.pendingTransfers.delete(sessionId);
                            resolve(false);
                        }
                    }, 120000);
                });

                if (accepted) {
                    session.status = 'accepted';
                    this.addTransferToStore(sessionId, session, fileInfos);
                } else {
                    this.sessions.delete(sessionId);
                    return { status: 403, body: 'Transfer rejected by user' };
                }
            }

            // Return session ID and file tokens
            const response: TransferResponse = {
                sessionId,
                files: fileTokens,
            };

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
            };
        } catch (error) {
            console.error('Error handling prepare-upload:', error);
            return { status: 500, body: 'Internal Server Error' };
        }
    }

    /**
     * POST /api/localsend/v2/upload
     * Receive file data
     */
    private async handleUpload(req: any): Promise<any> {
        try {
            const { sessionId, fileId, token } = req.query;

            if (!sessionId || !fileId || !token) {
                return { status: 400, body: 'Missing parameters' };
            }

            const session = this.sessions.get(sessionId);
            if (!session) {
                return { status: 404, body: 'Session not found' };
            }

            if (session.status !== 'accepted' && session.status !== 'receiving') {
                return { status: 403, body: 'Session not accepted' };
            }

            const fileData = session.files.get(fileId);
            if (!fileData) {
                return { status: 404, body: 'File not found' };
            }

            if (fileData.token !== token) {
                return { status: 403, body: 'Invalid token' };
            }

            // Update session status
            session.status = 'receiving';

            // Save file to filesystem
            const settings = useSettingsStore.getState();
            const downloadDir = settings.downloadPath || '';

            if (!downloadDir) {
                return { status: 500, body: 'Download directory not configured' };
            }
            const filePath = `${downloadDir}/${fileData.fileInfo.fileName}`;

            // Write binary data (req.body is already base64)
            await FileSystem.writeAsStringAsync(filePath, req.body, {
                encoding: 'base64' as any,
            });

            // Mark file as received
            fileData.received = true;
            fileData.fileInfo.uri = filePath;

            console.log(`File received: ${fileData.fileInfo.fileName} -> ${filePath}`);

            // Update transfer store
            const transferStore = useTransferStore.getState();
            const transfer = transferStore.transfers.find(t => t.sessionId === sessionId);
            if (transfer) {
                transferStore.updateProgress(
                    transfer.id,
                    transfer.transferredSize + fileData.fileInfo.size,
                    0
                );
            }

            // Check if all files are received
            const allReceived = Array.from(session.files.values()).every(f => f.received);
            if (allReceived) {
                session.status = 'completed';
                if (transfer) {
                    transferStore.updateTransfer(transfer.id, { status: 'completed' });
                }
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: '',
            };
        } catch (error) {
            console.error('Error handling upload:', error);
            return { status: 500, body: 'Internal Server Error' };
        }
    }

    /**
     * POST /api/localsend/v2/cancel
     * Cancel a session
     */
    private async handleCancel(req: any): Promise<any> {
        try {
            const { sessionId } = req.query;

            if (!sessionId) {
                return { status: 400, body: 'Missing sessionId' };
            }

            const session = this.sessions.get(sessionId);
            if (session) {
                session.status = 'cancelled';

                // Update transfer store
                const transferStore = useTransferStore.getState();
                const transfer = transferStore.transfers.find(t => t.sessionId === sessionId);
                if (transfer) {
                    transferStore.cancelTransfer(transfer.id);
                }
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: '',
            };
        } catch (error) {
            console.error('Error handling cancel:', error);
            return { status: 500, body: 'Internal Server Error' };
        }
    }

    /**
     * GET /api/localsend/v2/info
     * Return device info (for debugging)
     */
    private async handleInfo(req: any): Promise<any> {
        try {
            const settings = useSettingsStore.getState();

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alias: settings.deviceAlias,
                    version: '2.0',
                    deviceModel: Platform.OS,
                    deviceType: Platform.OS === 'ios' || Platform.OS === 'android' ? 'mobile' : 'desktop',
                    fingerprint: settings.deviceId,
                    download: false,
                }),
            };
        } catch (error) {
            console.error('Error handling info:', error);
            return { status: 500, body: 'Internal Server Error' };
        }
    }

    private addTransferToStore(sessionId: string, session: Session, files: FileInfo[]) {
        const transferStore = useTransferStore.getState();

        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        const transfer: Transfer = {
            id: `recv_${sessionId}`,
            sessionId,
            direction: 'receive',
            device: {
                fingerprint: session.senderInfo.fingerprint,
                alias: session.senderInfo.alias,
            },
            files,
            totalSize,
            transferredSize: 0,
            status: 'accepted',
            progress: 0,
            speed: 0,
            startTime: Date.now(),
        };

        transferStore.addTransfer(transfer);
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    private generateToken(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    getPort(): number {
        return this.port;
    }

    isServerRunning(): boolean {
        return this.isRunning;
    }

    acceptTransfer(sessionId: string) {
        const pending = this.pendingTransfers.get(sessionId);
        if (pending) {
            pending.resolve(true);
            this.pendingTransfers.delete(sessionId);
            transferEvents.emitTransferAccepted(sessionId);
        }
    }

    rejectTransfer(sessionId: string) {
        const pending = this.pendingTransfers.get(sessionId);
        if (pending) {
            pending.resolve(false);
            this.pendingTransfers.delete(sessionId);
            transferEvents.emitTransferRejected(sessionId);
        }
    }
}

export const httpServer = new HttpServer();
