import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { nearbyConnectionsService } from './nearbyShare/nearbyConnectionsService';
import { nearDropService } from './nearbyShare/nearDropService';
import { fileTransferService } from './fileTransferService';
import { compressionService } from './compression/compressionService';
import { streamingService } from './streaming/streamingService';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Device } from '@/types/device';
import type { PickedFile } from './pickerService';

/**
 * Transfer Manager - Smart Protocol Selection & Optimization
 * Automatically chooses the best transfer method and optimizes files
 */
export class TransferManager {
    /**
     * Send files using the optimal protocol with optimization
     */
    async sendFiles(device: Device, files: PickedFile[], pin?: string): Promise<void> {
        // Step 1: Optimize files (compression if beneficial)
        const optimizedFiles = await this.optimizeFiles(files);

        // Step 2: Determine best protocol
        if (this.shouldUseNearbyConnections(device)) {
            console.log('🚀 Using Nearby Connections (Wi-Fi Direct)');
            await this.sendViaNearby(device, optimizedFiles);
        } else if (this.shouldUseNearDrop(device)) {
            console.log('🍎 Using NearDrop (macOS/iOS)');
            await this.sendViaNearDrop(device, optimizedFiles);
        } else {
            console.log('📡 Using LocalSend (HTTP)');
            await this.sendViaLocalSend(device, optimizedFiles, pin);
        }
    }

    /**
     * Determine if Nearby Connections should be used
     */
    private shouldUseNearbyConnections(device: Device): boolean {
        // Check 1: Platform must be Android
        if (Platform.OS !== 'android') {
            return false;
        }

        // Check 2: Target device must be Android
        if (device.deviceModel?.toLowerCase().includes('android') === false &&
            device.deviceType !== 'mobile') {
            return false;
        }

        // Check 3: Device must support Nearby
        if (!device.supportsNearby) {
            return false;
        }

        // Check 4: Must have Nearby endpoint ID
        if (!device.nearbyEndpointId) {
            return false;
        }

        // Check 5: Nearby Connections must be available
        if (!nearbyConnectionsService.isAvailable()) {
            return false;
        }

        // Check 6: User preference (settings)
        const settings = useSettingsStore.getState();
        if (settings.useNearbyConnections === false) {
            return false;
        }

        return true;
    }

    /**
     * Determine if NearDrop should be used
     */
    private shouldUseNearDrop(device: Device): boolean {
        // Check 1: Platform must be macOS or iOS
        if (Platform.OS !== 'ios' && Platform.OS !== 'macos') {
            return false;
        }

        // Check 2: Device must support NearDrop
        if (!device.supportsNearDrop) {
            return false;
        }

        // Check 3: Must have NearDrop endpoint
        if (!device.nearDropEndpoint) {
            return false;
        }

        // Check 4: NearDrop must be available
        if (!nearDropService.isAvailable()) {
            return false;
        }

        // Check 5: User preference (settings)
        const settings = useSettingsStore.getState();
        if (settings.useNearDrop === false) {
            return false;
        }

        return true;
    }

    /**
     * Send files via Nearby Connections (Wi-Fi Direct)
     */
    private async sendViaNearby(device: Device, files: PickedFile[]): Promise<void> {
        try {
            if (!device.nearbyEndpointId) {
                throw new Error('No Nearby endpoint ID');
            }

            // Request connection
            const deviceName = useSettingsStore.getState().deviceName;
            await nearbyConnectionsService.requestConnection(
                device.nearbyEndpointId,
                deviceName
            );

            // Wait for connection to be established
            // (Connection acceptance is handled via events in the UI)

            // Send files one by one
            for (const file of files) {
                await nearbyConnectionsService.sendFile(
                    device.nearbyEndpointId,
                    file.uri,
                    file.name
                );
            }

            console.log('✅ Nearby transfer complete');
        } catch (error) {
            console.error('Nearby transfer failed:', error);

            // Fallback to LocalSend
            console.log('⚠️ Falling back to LocalSend');
            await fileTransferService.sendFiles(device, files);
        }
    }

    /**
     * Send files via NearDrop (macOS/iOS)
     */
    private async sendViaNearDrop(device: Device, files: PickedFile[]): Promise<void> {
        try {
            if (!device.nearDropEndpoint) {
                throw new Error('No NearDrop endpoint');
            }

            // Connect to endpoint
            await nearDropService.connect(device.nearDropEndpoint);

            // Send files one by one
            for (const file of files) {
                await nearDropService.sendFile(
                    device.nearDropEndpoint,
                    file.uri,
                    file.name
                );
            }

            console.log('✅ NearDrop transfer complete');
        } catch (error) {
            console.error('NearDrop transfer failed:', error);

            // Fallback to LocalSend
            console.log('⚠️ Falling back to LocalSend');
            await fileTransferService.sendFiles(device, files);
        }
    }

    /**
     * Check if this device can use Nearby Connections
     */
    canUseNearby(): boolean {
        return Platform.OS === 'android' && nearbyConnectionsService.isAvailable();
    }

    /**
     * Check if this device can use NearDrop
     */
    canUseNearDrop(): boolean {
        return (Platform.OS === 'ios' || Platform.OS === 'macos') && nearDropService.isAvailable();
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
                // Get file info
                const fileInfo = await FileSystem.getInfoAsync(file.uri);

                if (!fileInfo.exists || !('size' in fileInfo)) {
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
}

export const transferManager = new TransferManager();
