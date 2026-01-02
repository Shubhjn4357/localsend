import * as FileSystem from 'expo-file-system';
import { useTransferStore } from '../stores/transferStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { Device } from '../types/device';
import type { PickedFile } from './pickerService';
import type { TransferRequest, TransferResponse, FileInfo, Transfer } from '../types/transfer';

class FileTransferService {
    /**
     * Initiate file transfer to a device
     */
    async sendFiles(device: Device, files: PickedFile[], pin?: string): Promise<string | null> {
        try {
            const sessionId = await this.prepareUpload(device, files, pin);
            if (!sessionId) {
                throw new Error('Failed to prepare upload');
            }

            // Upload each file
            for (const file of files) {
                await this.uploadFile(device, sessionId, file);
            }

            console.log(`Transfer completed: ${files.length} files sent to ${device.alias}`);
            return sessionId;
        } catch (error) {
            console.error('File transfer failed:', error);
            throw error;
        }
    }

    /**
     * Step 1: Prepare upload - send file metadata
     */
    private async prepareUpload(device: Device, files: PickedFile[], pin?: string): Promise<string | null> {
        try {
            const settings = useSettingsStore.getState();
            const transferStore = useTransferStore.getState();

            // Build request
            const fileMetadata: { [key: string]: any } = {};
            const fileInfos: FileInfo[] = [];

            for (const file of files) {
                const fileInfo: FileInfo = {
                    id: file.uri, // Use URI as ID
                    fileName: file.name,
                    size: file.size,
                    fileType: file.mimeType || 'application/octet-stream',
                    uri: file.uri,
                    mimeType: file.mimeType,
                };

                fileMetadata[fileInfo.id] = {
                    id: fileInfo.id,
                    fileName: fileInfo.fileName,
                    size: fileInfo.size,
                    fileType: fileInfo.fileType,
                    sha256: null,
                    preview: null,
                };

                fileInfos.push(fileInfo);
            }

            const request: TransferRequest = {
                info: {
                    alias: settings.deviceAlias,
                    version: '2.0',
                    deviceModel: undefined,
                    deviceType: 'mobile',
                    fingerprint: settings.deviceId,
                },
                files: fileMetadata,
            };

            // Construct URL
            let url = `${device.protocol}://${device.ipAddress}:${device.port}/api/localsend/v2/prepare-upload`;
            if (pin) {
                url += `?pin=${pin}`;
            }

            // Send request
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const result: TransferResponse = await response.json();

            // Create transfer in store
            const transfer: Transfer = {
                id: `send_${result.sessionId}`,
                sessionId: result.sessionId,
                direction: 'send',
                device: {
                    fingerprint: device.fingerprint,
                    alias: device.alias,
                },
                files: fileInfos,
                totalSize: fileInfos.reduce((sum, f) => sum + f.size, 0),
                transferredSize: 0,
                status: 'transferring',
                progress: 0,
                speed: 0,
                startTime: Date.now(),
            };

            transferStore.addTransfer(transfer);

            // Store file tokens
            this.storeFileTokens(result.sessionId, result.files);

            return result.sessionId;
        } catch (error) {
            console.error('Failed to prepare upload:', error);
            return null;
        }
    }

    /**
     * Step 2: Upload individual file
     */
    private async uploadFile(device: Device, sessionId: string, file: PickedFile): Promise<void> {
        try {
            const token = this.getFileToken(sessionId, file.uri);
            if (!token) {
                throw new Error('File token not found');
            }

            // Read file as base64
            const fileData = await FileSystem.readAsStringAsync(file.uri, {
                encoding: 'base64' as any,
            });

            // Send file
            const url = `${device.protocol}://${device.ipAddress}:${device.port}/api/localsend/v2/upload?sessionId=${sessionId}&fileId=${encodeURIComponent(file.uri)}&token=${token}`;

            const startTime = Date.now();
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: fileData,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000; // seconds
            const speed = file.size / duration; // bytes per second

            // Update transfer progress
            const transferStore = useTransferStore.getState();
            const transfer = transferStore.transfers.find(t => t.sessionId === sessionId);
            if (transfer) {
                const newTransferred = transfer.transferredSize + file.size;
                transferStore.updateProgress(transfer.id, newTransferred, speed);

                // Check if all files are transferred
                if (newTransferred >= transfer.totalSize) {
                    transferStore.updateTransfer(transfer.id, {
                        status: 'completed',
                        endTime: Date.now(),
                    });
                }
            }

            console.log(`File uploaded: ${file.name} (${file.size} bytes) in ${duration.toFixed(2)}s`);
        } catch (error) {
            console.error(`Failed to upload file ${file.name}:`, error);
            throw error;
        }
    }

    /**
     * Cancel a transfer session
     */
    async cancelTransfer(device: Device, sessionId: string): Promise<void> {
        try {
            const url = `${device.protocol}://${device.ipAddress}:${device.port}/api/localsend/v2/cancel?sessionId=${sessionId}`;

            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Update transfer store
            const transferStore = useTransferStore.getState();
            const transfer = transferStore.transfers.find(t => t.sessionId === sessionId);
            if (transfer) {
                transferStore.cancelTransfer(transfer.id);
            }

            console.log(`Transfer cancelled: ${sessionId}`);
        } catch (error) {
            console.error('Failed to cancel transfer:', error);
        }
    }

    // Token management (in-memory for now)
    private fileTokens = new Map<string, Map<string, string>>(); // sessionId -> (fileId -> token)

    private storeFileTokens(sessionId: string, tokens: { [key: string]: string }) {
        const sessionTokens = new Map<string, string>();
        for (const [fileId, token] of Object.entries(tokens)) {
            sessionTokens.set(fileId, token);
        }
        this.fileTokens.set(sessionId, sessionTokens);
    }

    private getFileToken(sessionId: string, fileId: string): string | undefined {
        return this.fileTokens.get(sessionId)?.get(fileId);
    }
}

export const fileTransferService = new FileTransferService();
