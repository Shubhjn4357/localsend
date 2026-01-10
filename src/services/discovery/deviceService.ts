import { Platform } from 'react-native';
import type { Device } from '../../types/device';
import { udpService } from './udpService';
import { httpDiscoveryService } from './httpDiscoveryService';
import { bluetoothService } from './bluetoothService';
import { nearbyConnectionsService } from '../nearbyShare/nearbyConnectionsService';
import { useDeviceStore } from '../../stores/deviceStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { DEVICE_TIMEOUT } from '../../utils/constants';

class DeviceService {
    private timeoutCheckInterval: NodeJS.Timeout | null = null;
    private nearbyEndpointMap = new Map<string, string>(); // fingerprint -> nearbyEndpointId

    async startDiscovery(): Promise<void> {
        const deviceStore = useDeviceStore.getState();
        const settings = useSettingsStore.getState();

        // Clear existing devices
        deviceStore.clearDevices();
        deviceStore.setScanning(true);

        try {
            // Use HTTP discovery on web, UDP + Bluetooth + Nearby on native platforms
            if (Platform.OS === 'web') {
                console.log('Using HTTP discovery for web platform');
                await httpDiscoveryService.startDiscovery((device: Device) => {
                    this.handleDeviceDiscovered(device);
                });
            } else {
                console.log('Starting multi-protocol discovery:');

                // 1. UDP multicast discovery (primary method)
                console.log('  - UDP multicast discovery');
                await udpService.start((device: Device) => {
                    this.handleDeviceDiscovered(device);
                });

                // 2. Bluetooth discovery (if enabled)
                if (settings.bluetoothEnabled) {
                    console.log('  - Bluetooth BLE discovery');
                    await bluetoothService.startDiscovery().catch(err => {
                        console.log('Bluetooth discovery not available:', err.message);
                    });
                }

                // 3. Nearby Connections discovery (for Android)
                if (Platform.OS === 'android' && nearbyConnectionsService.isAvailable()) {
                    console.log('  - Nearby Connections WiFi-Direct discovery');
                    try {
                        // Stop any existing sessions first
                        await nearbyConnectionsService.stopAdvertising().catch(() => { });
                        await nearbyConnectionsService.stopDiscovery().catch(() => { });

                        console.log('  - Stopped existing Nearby sessions');

                        // IMPORTANT: Register listener BEFORE starting discovery
                        nearbyConnectionsService.onDeviceDiscovered((nearbyDevice) => {
                            console.log(`🔗 Nearby endpoint discovered: ${nearbyDevice.name} (${nearbyDevice.endpointId})`);
                            // Map endpoint to device - will be matched by name/alias later
                            this.nearbyEndpointMap.set(nearbyDevice.name, nearbyDevice.endpointId);

                            // Also try to match with already discovered devices
                            const deviceStore = useDeviceStore.getState();
                            const existingDevice = deviceStore.devices.find(d => d.alias === nearbyDevice.name);
                            if (existingDevice) {
                                console.log(`  ✅ Matched existing device: ${nearbyDevice.name}`);
                                deviceStore.updateDevice(existingDevice.fingerprint, {
                                    nearbyEndpointId: nearbyDevice.endpointId
                                });
                            }
                        });

                        // Now start advertising and discovery
                        const deviceName = settings.deviceAlias || settings.deviceName;
                        console.log(`  - Starting Nearby advertising as: ${deviceName}`);
                        await nearbyConnectionsService.startAdvertising(deviceName);

                        console.log('  - Starting Nearby discovery...');
                        await nearbyConnectionsService.startDiscovery();

                        console.log('  ✅ Nearby Connections active and listening');
                    } catch (err: any) {
                        console.log('  ❌ Nearby Connections failed:', err.message);
                    }
                }

                console.log('  - All discovery methods active');
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
            // Stop all native discovery services
            await udpService.stop();
            await bluetoothService.stopDiscovery().catch(err => {
                console.log('Bluetooth already stopped or not running');
            });

            // Stop Nearby Connections
            if (Platform.OS === 'android' && nearbyConnectionsService.isAvailable()) {
                await nearbyConnectionsService.stopAdvertising().catch(() => { });
                await nearbyConnectionsService.stopDiscovery().catch(() => { });
            }
        }

        // Stop timeout checker
        if (this.timeoutCheckInterval) {
            clearInterval(this.timeoutCheckInterval);
            this.timeoutCheckInterval = null;
        }

        // Clear endpoint map
        this.nearbyEndpointMap.clear();

        deviceStore.setScanning(false);
        console.log('Device discovery stopped');
    }

    private handleDeviceDiscovered(device: Device): void {
        const deviceStore = useDeviceStore.getState();

        // Check if we have a Nearby endpoint for this device (match by alias)
        const nearbyEndpointId = this.nearbyEndpointMap.get(device.alias);
        if (nearbyEndpointId) {
            console.log(`✅ Matched Nearby endpoint for ${device.alias}: ${nearbyEndpointId}`);
            device.nearbyEndpointId = nearbyEndpointId;
        }

        deviceStore.addDevice(device);
        console.log(`Device discovered: ${device.alias} (${device.ipAddress})${nearbyEndpointId ? ' [Nearby Ready]' : ''}`);
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
