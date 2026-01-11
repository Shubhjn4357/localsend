import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { fileTransferService } from './fileTransferService';
import { compressionService } from './compression/compressionService';
import { streamingService } from './streaming/streamingService';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Device } from '@/types/device';
import type { PickedFile } from './pickerService';

/**
 * Transfer Manager - Smart Protocol Selection & Optimization
 * Uses LocalSend protocol for all transfers with optional file optimization
 */
export class TransferManager {
    /**
     * Send files using LocalSend protocol with optional optimization
     */
    async sendFiles(device: Device, files: PickedFile[], pin?: string): Promise<void> {
        try {
            // Optimize files if enabled
            const optimizedFiles = await this.optimizeFiles(files);

            console.log(`📡 Using LocalSend Protocol (HTTPS)`);
            await this.sendViaLocalSend(device, optimizedFiles, pin);
        } catch (error) {
            console.error('Transfer error:', error);
            throw error;
        }
    }

    /**
     * Optimize files before transfer (compression, etc.)
     */
    private async optimizeFiles(files: PickedFile[]): Promise<PickedFile[]> {
        const settings = useSettingsStore.getState();

        if (!settings.optimizeTransfers) {
            return files; // No optimization if disabled
        }

        return Promise.all(files.map(async (file) => {
            try {
                // Get file info using new File API (expo-file-system SDK 54+)
                const fileObj = new File(file.uri);
                const fileInfo = await fileObj.info();

                if (!fileInfo.exists || !fileInfo.size) {
                    return file;
                }

                // Check if compression would help
                if (compressionService.shouldCompress(file.name, fileInfo.size)) {
                    const result = await compressionService.compressFile(file.uri, file.name);

                    console.log(`Optimized ${file.name}: ${result.compressionRatio.toFixed(2)}x smaller`);

                    return {
                        ...file,
                        uri: result.uri,
                        size: result.compressedSize
                    };
                }

                return file;
            } catch (error) {
                console.error('Optimization failed for', file.name, error);
                return file; // Return original on error
            }
        }));
    }

    /**
     * Send via LocalSend with streaming for large files
     */
    private async sendViaLocalSend(device: Device, files: PickedFile[], pin?: string): Promise<void> {
        const settings = useSettingsStore.getState();

        // Send files with streaming if enabled
        for (const file of files) {
            if (settings.optimizeTransfers && streamingService.shouldUseStreaming(file.size)) {
                console.log(`📦 Streaming large file: ${file.name}`);
                await streamingService.sendFileStreaming(device, file);
            } else {
                // Use regular transfer
                await fileTransferService.sendFiles(device, [file], pin);
            }
        }
    }

    /**
     * Check if LocalSend is available (always true for native, uses HTTP fallback for web)
     */
    isAvailable(): boolean {
        return true; // LocalSend protocol is always available
    }
}

export const transferManager = new TransferManager();
