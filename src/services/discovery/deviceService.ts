import { Platform } from 'react-native';
import type { Device } from '../../types/device';
import { udpService } from './udpService';
import { httpDiscoveryService } from './httpDiscoveryService';
import { useDeviceStore } from '../../stores/deviceStore';
import { DEVICE_TIMEOUT } from '../../utils/constants';

class DeviceService {
    private timeoutCheckInterval: NodeJS.Timeout | null = null;

    async startDiscovery(): Promise<void> {
        const deviceStore = useDeviceStore.getState();

        // Clear existing devices
        deviceStore.clearDevices();
        deviceStore.setScanning(true);

        try {
            // Use HTTP discovery on web, UDP on native platforms
            if (Platform.OS === 'web') {
                console.log('Using HTTP discovery for web platform');
                await httpDiscoveryService.startDiscovery((device: Device) => {
                    this.handleDeviceDiscovered(device);
                });
            } else {
                console.log('Using UDP multicast discovery for native platform');
                // Start UDP service
                await udpService.start((device: Device) => {
                    this.handleDeviceDiscovered(device);
                });
            }

            // Start timeout checker
            this.startTimeoutChecker();

            console.log('Device discovery started');
        } catch (error) {
            console.error('Failed to start discovery:', error);
            deviceStore.setScanning(false);
            throw error;
        }
    }

    async stopDiscovery(): Promise<void> {
        const deviceStore = useDeviceStore.getState();

        // Stop appropriate discovery service based on platform
        if (Platform.OS === 'web') {
            await httpDiscoveryService.stopDiscovery();
        } else {
            await udpService.stop();
        }

        // Stop timeout checker
        if (this.timeoutCheckInterval) {
            clearInterval(this.timeoutCheckInterval);
            this.timeoutCheckInterval = null;
        }

        deviceStore.setScanning(false);
        console.log('Device discovery stopped');
    }

    private handleDeviceDiscovered(device: Device): void {
        const deviceStore = useDeviceStore.getState();
        deviceStore.addDevice(device);
        console.log(`Device discovered: ${device.alias} (${device.ipAddress})`);
    }

    private startTimeoutChecker(): void {
        // Check every 5 seconds
        this.timeoutCheckInterval = setInterval(() => {
            const deviceStore = useDeviceStore.getState();
            const now = Date.now();

            deviceStore.devices.forEach((device) => {
                if (now - device.lastSeen > DEVICE_TIMEOUT) {
                    // Mark device as offline
                    deviceStore.markDeviceOffline(device.fingerprint);
                    console.log(`Device timeout: ${device.alias}`);
                }
            });
        }, 5000) as unknown as NodeJS.Timeout;
    }

    getFingerprint(): string {
        return udpService.getFingerprint();
    }

    isPlatformSupported(): boolean {
        return Platform.OS !== 'web';
    }
}

export const deviceService = new DeviceService();
