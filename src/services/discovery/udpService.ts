import { Platform } from 'react-native';
import type { Device, DeviceAnnouncement } from '../../types/device';
import { useSettingsStore } from '../../stores/settingsStore';
import { getNetworkInfo } from '../../utils/network';
import { MULTICAST_GROUP, MULTICAST_PORT, ANNOUNCEMENT_INTERVAL } from '../../utils/constants';
import * as ExpoDevice from 'expo-device';
import * as Crypto from 'expo-crypto';

// Only import UDP on native platforms
// Import dgram for UDP socket functionality (only on native platforms)
type DgramSocket = {
    bind: (port: number, callback?: () => void) => void;
    addMembership: (multicastAddress: string) => void;
    dropMembership: (multicastAddress: string) => void;
    send: (buffer: Uint8Array, offset: number, length: number, port: number, address: string, callback?: (err: any) => void) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    close: () => void;
    _sBound?: boolean;
};

type DgramModule = {
    createSocket: (options: { type: string; reuseAddr?: boolean }) => DgramSocket;
};

let dgram: DgramModule | null = null;
if (Platform.OS !== 'web') {
    dgram = require('react-native-udp');
}

class UDPService {
    private socket: DgramSocket | null = null;
    private announcementInterval: ReturnType<typeof setInterval> | null = null;
    private isRunning = false;
    private fingerprint: string = '';
    private onDeviceDiscovered?: (device: Device) => void;

    constructor() {
        this.initFingerprint();
    }

    private async initFingerprint() {
        try {
            // Generate unique fingerprint from device ID
            const deviceId = ExpoDevice.osBuildId || ExpoDevice.deviceName || 'unknown';
            const hash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                deviceId + Platform.OS
            );
            this.fingerprint = hash.substring(0, 16);
        } catch (error) {
            this.fingerprint = Math.random().toString(36).substring(7);
        }
    }

    async start(onDeviceDiscovered: (device: Device) => void): Promise<void> {
        if (this.isRunning || Platform.OS === 'web') {
            console.log('UDP service already running or platform not supported');
            return;
        }

        this.onDeviceDiscovered = onDeviceDiscovered;

        try {
            // Create UDP socket
            if (!dgram) {
                throw new Error('UDP not available on this platform');
            }

            this.socket = dgram.createSocket({
                type: 'udp4',
                reuseAddr: true,
            });

            // Bind to multicast port
            this.socket.bind(MULTICAST_PORT, () => {
                console.log(`UDP socket bound to port ${MULTICAST_PORT}`);

                try {
                    // Join multicast group
                    this.socket?.addMembership(MULTICAST_GROUP);
                    console.log(`Joined multicast group ${MULTICAST_GROUP}`);
                } catch (error) {
                    console.error('Failed to join multicast group:', error);
                }
            });

            // Listen for incoming messages
            this.socket.on('message', (msg: any, rinfo: any) => {
                this.handleMessage(msg, rinfo);
            });

            this.socket.on('error', (err: any) => {
                console.error('UDP socket error:', err);
            });

            this.isRunning = true;

            // Start sending announcements
            this.startAnnouncements();

        } catch (error) {
            console.error('Failed to start UDP service:', error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        if (!this.isRunning) return;

        // Stop announcements
        if (this.announcementInterval) {
            clearInterval(this.announcementInterval);
            this.announcementInterval = null;
        }

        // Close socket
        if (this.socket) {
            try {
                // Try to drop membership, but don't fail if not bound
                try {
                    this.socket.dropMembership(MULTICAST_GROUP);
                } catch (membershipError) {
                    // Socket might not have been bound, ignore
                    console.log('Could not drop membership (socket may not have been bound)');
                }
                this.socket.close();
            } catch (error) {
                console.error('Error closing socket:', error);
            }
            this.socket = null;
        }

        this.isRunning = false;
        console.log('UDP service stopped');
    }

    private startAnnouncements(): void {
        // Send initial announcement
        this.sendAnnouncement();

        // Send periodic announcements
        this.announcementInterval = setInterval(() => {
            this.sendAnnouncement();
        }, ANNOUNCEMENT_INTERVAL);
    }

    private async sendAnnouncement(): Promise<void> {
        // Check if socket is ready and bound before sending
        if (!this.socket || !this.isRunning) {
            console.log('Socket not ready for announcement');
            return;
        }

        const settings = useSettingsStore.getState();
        const networkInfo = await getNetworkInfo();

        const announcement: DeviceAnnouncement = {
            alias: settings.deviceAlias,
            version: '2.3.5b',
            deviceModel: ExpoDevice.modelName || undefined,
            deviceType: Platform.OS === 'ios' || Platform.OS === 'android' ? 'mobile' : 'web',
            fingerprint: this.fingerprint,
            port: settings.serverPort || 53317,
            protocol: 'http',
            announce: true,
        };

        const message = JSON.stringify(announcement);
        // Use TextEncoder instead of Buffer (not available on React Native web)
        const encoder = new TextEncoder();
        const buffer = encoder.encode(message);

        try {
            // Double-check socket is still available
            if (!this.socket) {
                console.log('Socket became null before send');
                return;
            }

            this.socket.send(
                buffer,
                0,
                buffer.length,
                MULTICAST_PORT,
                MULTICAST_GROUP,
                (err: any) => {
                    if (err) {
                        console.error('Failed to send announcement:', err);
                    }
                }
            );
        } catch (error) {
            console.error('Error sending announcement:', error);
        }
    }

    private handleMessage(msg: any, rinfo: any): void {
        try {
            const message = msg.toString();
            const announcement: DeviceAnnouncement = JSON.parse(message);

            // Ignore our own announcements
            if (announcement.fingerprint === this.fingerprint) {
                return;
            }

            // Validate announcement
            if (!announcement.alias || !announcement.fingerprint || !announcement.announce) {
                return;
            }

            // Create device object
            const device: Device = {
                fingerprint: announcement.fingerprint,
                alias: announcement.alias,
                deviceType: announcement.deviceType,
                deviceModel: announcement.deviceModel,
                ipAddress: rinfo.address,
                port: announcement.port,
                protocol: announcement.protocol,
                version: announcement.version,
                lastSeen: Date.now(),
                isOnline: true,
            };

            // Send HTTP POST /register response (LocalSend v2 protocol)
            if (announcement.announce) {
                this.sendRegisterResponse(device).catch(err => {
                    console.error('Failed to send register response:', err);
                });
            }

            // Notify listeners
            if (this.onDeviceDiscovered) {
                this.onDeviceDiscovered(device);
            }

        } catch (error) {
            console.error('Failed to parse UDP message:', error);
        }
    }

    private async sendRegisterResponse(device: Device): Promise<void> {
        try {
            const settings = useSettingsStore.getState();

            const response = {
                alias: settings.deviceAlias,
                version: '2.0',
                deviceModel: Platform.OS,
                deviceType: Platform.OS === 'ios' || Platform.OS === 'android' ? 'mobile' : 'desktop',
                fingerprint: this.fingerprint,
                port: settings.serverPort,
                protocol: 'http', // Use HTTP for now, HTTPS requires SSL certificate
                download: false,
            };

            // Send HTTP POST request with manual timeout (AbortSignal.timeout not available in RN)
            // Always use HTTP for register - HTTPS may not be available on the discovered device
            const url = `http://${device.ipAddress}:${device.port}/api/localsend/v2/register`;

            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            try {
                await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(response),
                    signal: controller.signal,
                });

                console.log(`Sent register response to ${device.alias}`);
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            // Silently fail - device might not have HTTP server running yet
            // This is normal during discovery - not all devices accept register responses
        }
    }

    getFingerprint(): string {
        return this.fingerprint;
    }

    isActive(): boolean {
        return this.isRunning;
    }
}

export const udpService = new UDPService();
