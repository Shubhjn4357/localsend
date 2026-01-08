import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NearDropModule } = NativeModules;

interface NearDropDevice {
    name: string;
    type: string;
    domain: string;
}

/**
 * Service for NearDrop Protocol (macOS/iOS compatible with Android Quick Share)
 * Uses Bonjour/mDNS for discovery and HTTP for transfer
 */
export class NearDropService {
    private eventEmitter: NativeEventEmitter | null = null;
    private isMacOrIOS: boolean;

    constructor() {
        this.isMacOrIOS = Platform.OS === 'ios' || Platform.OS === 'macos';
        if (this.isMacOrIOS && NearDropModule) {
            this.eventEmitter = new NativeEventEmitter(NearDropModule);
        }
    }

    /**
     * Check if NearDrop is available on this device
     */
    isAvailable(): boolean {
        return this.isMacOrIOS && !!NearDropModule;
    }

    /**
     * Start advertising this device for NearDrop discovery
     * @param deviceName Name to advertise
     */
    async startAdvertising(deviceName: string): Promise<string> {
        if (!this.isAvailable()) {
            throw new Error('NearDrop not available on this platform');
        }
        return NearDropModule.startAdvertising(deviceName);
    }

    /**
     * Stop advertising
     */
    async stopAdvertising(): Promise<void> {
        if (!this.isAvailable()) return;
        return NearDropModule.stopAdvertising();
    }

    /**
     * Start discovering nearby NearDrop devices
     */
    async startDiscovery(): Promise<void> {
        if (!this.isAvailable()) {
            throw new Error('NearDrop not available on this platform');
        }
        return NearDropModule.startDiscovery();
    }

    /**
     * Stop discovering
     */
    async stopDiscovery(): Promise<void> {
        if (!this.isAvailable()) return;
        return NearDropModule.stopDiscovery();
    }

    /**
     * Connect to a discovered endpoint
     */
    async connect(endpoint: string): Promise<void> {
        if (!this.isAvailable()) {
            throw new Error('NearDrop not available on this platform');
        }
        return NearDropModule.connect(endpoint);
    }

    /**
     * Send a file via NearDrop
     */
    async sendFile(endpointId: string, fileUri: string, fileName: string): Promise<string> {
        if (!this.isAvailable()) {
            throw new Error('NearDrop not available on this platform');
        }
        return NearDropModule.sendFile(endpointId, fileUri, fileName);
    }

    /**
     * Listen for discovered devices
     */
    onDeviceDiscovered(callback: (device: NearDropDevice) => void) {
        if (!this.eventEmitter) return () => {};
        return this.eventEmitter.addListener('onNearDropDeviceFound', callback);
    }

    /**
     * Listen for received files
     */
    onFileReceived(callback: (data: { size: number }) => void) {
        if (!this.eventEmitter) return () => {};
        return this.eventEmitter.addListener('onNearDropFileReceived', callback);
    }
}

export const nearDropService = new NearDropService();
