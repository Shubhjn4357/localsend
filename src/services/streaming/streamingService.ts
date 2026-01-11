import * as FileSystem from 'expo-file-system';
import type { Device } from '@/types/device';
import type { PickedFile } from '../pickerService';
import { useSettingsStore } from '@/stores/settingsStore';

interface TransferProgress {
    bytesSent: number;
    totalBytes: number;
    percentage: number;
    speed: number;
}

interface ChunkSession {
    sessionId: string;
    fileId: string;
    token: string;
}

/**
 * Service for streaming large file transfers
 * Sends files in chunks to avoid memory issues with large files
 * Uses the LocalSend v2 upload endpoint with Range headers for chunked transfer
 */
export class StreamingService {
    private readonly CHUNK_SIZE = 512 * 1024; // 512KB chunks (optimal for mobile)
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 1000; // 1 second

    /**
     * Check if file should use streaming (>5MB)
     * Streaming is more memory-efficient for large files
     */
    shouldUseStreaming(fileSize: number): boolean {
        const settings = useSettingsStore.getState();
        if (!settings.optimizeTransfers) {
            return false;
        }
        // Use streaming for files larger than 5MB
        return fileSize > 5 * 1024 * 1024;
    }

    /**
     * Send file using chunked streaming
     * Reads file in chunks to avoid loading entire file into memory
     */
    async sendFileStreaming(
        device: Device,
        file: PickedFile,
        session?: ChunkSession,
        onProgress?: (progress: TransferProgress) => void
    ): Promise<void> {
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(file.uri);

        if (!fileInfo.exists) {
            throw new Error('File not found');
        }

        const totalSize = file.size;
        const totalChunks = Math.ceil(totalSize / this.CHUNK_SIZE);
        let bytesSent = 0;
        const startTime = Date.now();

        console.log(`📦 Streaming ${file.name}: ${totalChunks} chunks of ${this.CHUNK_SIZE / 1024}KB`);

        // If no session provided, prepare upload first
        let uploadSession: ChunkSession | null = session || null;
        if (!uploadSession) {
            uploadSession = await this.prepareStreamingUpload(device, file);
            if (!uploadSession) {
                throw new Error('Failed to prepare streaming upload');
            }
        }

        // Send chunks sequentially (more reliable than parallel for large files)
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const offset = chunkIndex * this.CHUNK_SIZE;
            const chunkSize = Math.min(this.CHUNK_SIZE, totalSize - offset);

            // Retry logic for each chunk
            let retries = 0;
            let success = false;

            while (!success && retries < this.MAX_RETRIES) {
                try {
                    await this.sendChunk(
                        device,
                        file,
                        uploadSession,
                        offset,
                        chunkSize,
                        totalSize
                    );
                    success = true;
                } catch (error) {
                    retries++;
                    console.warn(`Chunk ${chunkIndex} failed (attempt ${retries}):`, error);

                    if (retries >= this.MAX_RETRIES) {
                        throw new Error(`Failed to send chunk ${chunkIndex} after ${this.MAX_RETRIES} attempts`);
                    }

                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * retries));
                }
            }

            // Update progress
            bytesSent += chunkSize;
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const speed = elapsedSeconds > 0 ? bytesSent / elapsedSeconds : 0;
            const percentage = (bytesSent / totalSize) * 100;

            if (onProgress) {
                onProgress({
                    bytesSent,
                    totalBytes: totalSize,
                    percentage: Math.min(percentage, 100),
                    speed
                });
            }

            // Log progress every 10%
            if (chunkIndex % Math.max(1, Math.floor(totalChunks / 10)) === 0) {
                console.log(`📊 Progress: ${percentage.toFixed(1)}% (${(speed / 1024 / 1024).toFixed(2)} MB/s)`);
            }
        }

        console.log(`✅ Streaming complete: ${file.name} (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    }

    /**
     * Prepare streaming upload - get session and token from receiver
     */
    private async prepareStreamingUpload(
        device: Device,
        file: PickedFile
    ): Promise<ChunkSession | null> {
        try {
            const settings = useSettingsStore.getState();

            const request = {
                info: {
                    alias: settings.deviceAlias,
                    version: '2.0',
                    deviceType: 'mobile',
                    fingerprint: settings.deviceId,
                },
                files: {
                    [file.uri]: {
                        id: file.uri,
                        fileName: file.name,
                        size: file.size,
                        fileType: file.mimeType || 'application/octet-stream',
                        sha256: null,
                        preview: null,
                    }
                }
            };

            const url = `http://${device.ipAddress}:${device.port}/api/localsend/v2/prepare-upload`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                console.error('Prepare upload failed:', response.status);
                return null;
            }

            const result = await response.json();

            return {
                sessionId: result.sessionId,
                fileId: file.uri,
                token: result.files[file.uri]
            };
        } catch (error) {
            console.error('Failed to prepare streaming upload:', error);
            return null;
        }
    }

    /**
     * Send a single chunk using Range header for partial upload
     * Reads only the required chunk from file to minimize memory usage
     */
    private async sendChunk(
        device: Device,
        file: PickedFile,
        session: ChunkSession,
        offset: number,
        chunkSize: number,
        totalSize: number
    ): Promise<void> {
        // Read only the chunk we need (base64 encoded)
        const chunkData = await FileSystem.readAsStringAsync(file.uri, {
            encoding: 'base64' as any,
            position: offset,
            length: chunkSize,
        });

        // Build upload URL with session info
        const url = `http://${device.ipAddress}:${device.port}/api/localsend/v2/upload?sessionId=${session.sessionId}&fileId=${encodeURIComponent(session.fileId)}&token=${session.token}`;

        // Use Range header to indicate this is a partial upload
        const headers: Record<string, string> = {
            'Content-Type': 'application/octet-stream',
        };

        // Only add Range header if not starting from beginning
        if (offset > 0) {
            headers['Range'] = `bytes=${offset}-${offset + chunkSize - 1}/${totalSize}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: chunkData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Chunk upload failed: HTTP ${response.status} - ${errorText}`);
        }
    }

    /**
     * Calculate optimal chunk size based on network conditions
     * Smaller chunks for slower networks, larger for faster
     */
    getOptimalChunkSize(estimatedSpeedBps: number): number {
        if (estimatedSpeedBps < 1024 * 1024) {
            // < 1 MB/s - use 256KB chunks
            return 256 * 1024;
        } else if (estimatedSpeedBps < 10 * 1024 * 1024) {
            // 1-10 MB/s - use 512KB chunks
            return 512 * 1024;
        } else {
            // > 10 MB/s - use 1MB chunks
            return 1024 * 1024;
        }
    }
}

export const streamingService = new StreamingService();
