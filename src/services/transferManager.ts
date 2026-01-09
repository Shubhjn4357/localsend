import { Platform } from 'react-native';
import { File } from 'expo-file-system';
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
    async sendFiles(device: Device, files: PickedFile[]): Promise<void> {
        try {
            // Optimize files if enabled
            const optimizedFiles = await this.optimizeFiles(files);

            // Choose transfer method based on device capabilities and platform
            if (this.shouldUseNearbyConnections(device)) {
                console.log('📡 Using Nearby Connections (WiFi-Direct)');
                await this.sendViaNearby(device, optimizedFiles);
            } else if (this.shouldUseNearDrop(device)) {
                console.log('📡 Using NearDrop (AirDrop-like)');
                await this.sendViaNearDrop(device, optimizedFiles);
            } else if (Platform.OS === 'web') {
                // HTTP only allowed for web platform
                console.log('📡 Using LocalSend (HTTP) - Web Platform');
                await this.sendViaLocalSend(device, optimizedFiles);
            } else {
                // Mobile devices must use Nearby/Bluetooth - no HTTP fallback
                throw new Error(
                    `Cannot transfer to ${device.alias}: ` +
                    `Device doesn't support Nearby Connections or Bluetooth. ` +
                    `Both devices must have WiFi-Direct/Bluetooth enabled.`
                );
            }
        } catch (error) {
            console.error('Transfer error:', error);
            throw error;
        }
    }

    /**
     * Determine if Nearby Connections should be used
     */
    private shouldUseNearbyConnections(device: Device): boolean {
        // Check 1: Platform must be Android
        if (Platform.OS !== 'android') {
            console.log('📱 Not using Nearby: sender not Android');
            return false;
        }

        // Check 2: Device must support Nearby
        if (!device.supportsNearby) {
            console.log('📱 Not using Nearby: device doesn\'t support it');
            return false;
        }

        // Check 3: Nearby Connections must be available
        if (!nearbyConnectionsService.isAvailable()) {
            console.log('📱 Not using Nearby: service not available');
            return false;
        }

        // Check 4: User preference (settings)
        const settings = useSettingsStore.getState();
        if (settings.useNearbyConnections === false) {
            console.log('📱 Not using Nearby: disabled in settings');
            return false;
        }

        console.log('🚀 Using Nearby Connections (WiFi-Direct)!');
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
            console.log(`📡 Initiating Nearby Connections to ${device.alias}...`);

            // Use real Nearby endpoint if we have it, otherwise try IP as fallback
            const endpointId = device.nearbyEndpointId || device.ipAddress;

            if (!device.nearbyEndpointId) {
                console.log(`⚠️ No Nearby endpoint ID found, using IP address: ${endpointId}`);
                console.log('This may fail - ensure Nearby discovery is running on both devices');
            } else {
                console.log(`✅ Using Nearby endpoint: ${endpointId}`);
            }

            console.log(`🔌 Requesting connection to ${device.alias}...`);

            const deviceName = useSettingsStore.getState().deviceName;
            await nearbyConnectionsService.requestConnection(
                endpointId,
                deviceName
            );

            console.log(`📤 Sending ${files.length} files via Nearby Connections...`);

            // Send each file
            for (const file of files) {
                console.log(`  Sending: ${file.name}`);
                await nearbyConnectionsService.sendFile(endpointId, file.uri, file.name);
            }

            console.log(`✅ Nearby transfer complete!`);
        } catch (error) {
            console.error('❌ Nearby transfer failed:', error);
            throw error;
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
}

export const transferManager = new TransferManager();
