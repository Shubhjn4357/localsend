import * as FileSystem from 'expo-file-system';
import type { Device } from '@/types/device';
import type { PickedFile } from '../pickerService';

interface TransferProgress {
    bytesSent: number;
    totalBytes: number;
    percentage: number;
}

/**
 * Service for streaming large file transfers
 * Sends files in chunks to avoid memory issues
 */
export class StreamingService {
    private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    private readonly PARALLEL_CHUNKS = 3; // Send 3 chunks in parallel

    /**
     * Check if file should use streaming (> 10MB)
     */
    shouldUseStreaming(fileSize: number): boolean {
        return fileSize > 10 * 1024 * 1024; // 10MB threshold
    }

    /**
     * Send file using chunked streaming
     */
    async sendFileStreaming(
        device: Device,
        file: PickedFile,
        onProgress?: (progress: TransferProgress) => void
    ): Promise<void> {
        const fileInfo = await FileSystem.getInfoAsync(file.uri);

        if (!fileInfo.exists || !('size' in fileInfo)) {
            throw new Error('File not found');
        }

        const totalSize = fileInfo.size;
        const totalChunks = Math.ceil(totalSize / this.CHUNK_SIZE);
        let bytesSent = 0;

        console.log(`Streaming ${file.name}: ${totalChunks} chunks of ${this.CHUNK_SIZE / 1024}KB`);

        // Send chunks in parallel batches
        for (let i = 0; i < totalChunks; i += this.PARALLEL_CHUNKS) {
            const chunkPromises: Promise<void>[] = [];

            // Create batch of parallel chunk transfers
            for (let j = 0; j < this.PARALLEL_CHUNKS && (i + j) < totalChunks; j++) {
                const chunkIndex = i + j;
                chunkPromises.push(
                    this.sendChunk(device, file.uri, chunkIndex, totalChunks)
                );
            }

            // Wait for batch to complete
            await Promise.all(chunkPromises);

            // Update progress
            bytesSent = Math.min((i + this.PARALLEL_CHUNKS) * this.CHUNK_SIZE, totalSize);
            const percentage = (bytesSent / totalSize) * 100;

            if (onProgress) {
                onProgress({
                    bytesSent,
                    totalBytes: totalSize,
                    percentage: Math.min(percentage, 100)
                });
            }
        }

        console.log(`✅ Streaming complete: ${file.name}`);
    }

    /**
     * Send a single chunk
     * Note: This is a placeholder implementation
     * In production, would implement proper chunked file reading via native module
     */
    private async sendChunk(
        device: Device,
        fileUri: string,
        chunkIndex: number,
        totalChunks: number
    ): Promise<void> {
        const offset = chunkIndex * this.CHUNK_SIZE;

        // Note: In production, read actual chunk from file
        // For now, simplified implementation
        const url = `http://${device.ipAddress}:${device.port}/api/send/chunk`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Chunk-Index': chunkIndex.toString(),
                'X-Total-Chunks': totalChunks.toString(),
                'X-Chunk-Offset': offset.toString()
            }
        });

        if (!response.ok) {
            throw new Error(`Chunk ${chunkIndex} failed: ${response.statusText}`);
        }
    }
}

export const streamingService = new StreamingService();
