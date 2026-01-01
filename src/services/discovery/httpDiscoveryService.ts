import { Platform } from 'react-native';
import type { Device } from '../../types/device';
import { useSettingsStore } from '../../stores/settingsStore';

/**
 * HTTP Discovery Service for Web Platform
 * Since web browsers don't support UDP multicast, we use HTTP discovery
 * by scanning local network IP addresses and sending POST requests
 */
class HttpDiscoveryService {
    private isScanning = false;
    private discoveredDevices = new Map<string, Device>();
    private onDeviceDiscovered?: (device: Device) => void;

    /**
     * Get local network IP range to scan
     * Returns common local network ranges
     */
    private getLocalNetworkRanges(): string[] {
        // Common local network ranges
        return [
            '192.168.1', // Most common home router range
            '192.168.0',
            '10.0.0',
            '172.16.0',
        ];
    }

    /**
     * Send HTTP register request to a potential device
     */
    async checkDevice(ipAddress: string, port: number = 53317): Promise<Device | null> {
        const settings = useSettingsStore.getState();
        const timeout = 1000; // 1 second timeout per device

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(`http://${ipAddress}:${port}/api/localsend/v2/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alias: settings.deviceAlias,
                    version: '2.3.5b',
                    deviceModel: 'Web Browser',
                    deviceType: 'web',
                    fingerprint: settings.deviceId,
                    port: settings.serverPort,
                    protocol: 'http', // Web typically uses HTTP
                    download: false,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();

                // Don't discover ourselves
                if (data.fingerprint === settings.deviceId) {
                    return null;
                }

                const device: Device = {
                    fingerprint: data.fingerprint,
                    alias: data.alias,
                    deviceType: data.deviceType,
                    deviceModel: data.deviceModel,
                    ipAddress: ipAddress,
                    port: data.port || 53317,
                    protocol: data.protocol || 'http',
                    version: data.version,
                    lastSeen: Date.now(),
                    isOnline: true,
                };

                return device;
            }
        } catch (error) {
            // Device not found or not responding, this is normal
            return null;
        }

        return null;
    }

    /**
     * Scan local network for devices using HTTP discovery
     */
    async startDiscovery(onDeviceDiscovered: (device: Device) => void): Promise<void> {
        if (Platform.OS !== 'web') {
            console.warn('HTTP discovery should only be used on web platform');
            return;
        }

        if (this.isScanning) {
            console.log('HTTP discovery already running');
            return;
        }

        this.isScanning = true;
        this.onDeviceDiscovered = onDeviceDiscovered;
        this.discoveredDevices.clear();

        console.log('Starting HTTP discovery for web platform...');

        const networkRanges = this.getLocalNetworkRanges();
        const promises: Promise<void>[] = [];

        // Scan each network range
        for (const range of networkRanges) {
            // Scan .1 to .254 (skip .0 and .255)
            for (let i = 1; i <= 254; i++) {
                const ipAddress = `${range}.${i}`;

                // Add scan promise
                const scanPromise = this.checkDevice(ipAddress).then((device) => {
                    if (device && !this.discoveredDevices.has(device.fingerprint)) {
                        this.discoveredDevices.set(device.fingerprint, device);
                        if (this.onDeviceDiscovered) {
                            this.onDeviceDiscovered(device);
                            console.log(`Found device via HTTP: ${device.alias} at ${ipAddress}`);
                        }
                    }
                });

                promises.push(scanPromise);

                // Batch requests to avoid overwhelming the browser
                if (promises.length >= 20) {
                    await Promise.allSettled(promises.splice(0, 20));
                }
            }
        }

        // Wait for remaining scans
        await Promise.allSettled(promises);

        console.log(`HTTP discovery complete. Found ${this.discoveredDevices.size} devices.`);
        this.isScanning = false;
    }

    async stopDiscovery(): Promise<void> {
        this.isScanning = false;
        this.discoveredDevices.clear();
        console.log('HTTP discovery stopped');
    }

    isActive(): boolean {
        return this.isScanning;
    }
}

export const httpDiscoveryService = new HttpDiscoveryService();
