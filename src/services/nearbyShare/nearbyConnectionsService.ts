import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NearbyConnectionsModule } = NativeModules;

interface NearbyDevice {
    endpointId: string;
    name: string;
}

interface ConnectionResult {
    endpointId: string;
    success: boolean;
    error?: string;
}

interface PayloadTransferUpdate {
    endpointId: string;
    payloadId: string;
    status: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';
    bytesTransferred: number;
    totalBytes: number;
}

/**
 * Service for Google Nearby Connections API
 * Enables Wi-Fi Direct transfers between Android devices
 */
export class NearbyConnectionsService {
    private eventEmitter: NativeEventEmitter | null = null;
    private isAndroid: boolean;

    constructor() {
        this.isAndroid = Platform.OS === 'android';
        if (this.isAndroid && NearbyConnectionsModule) {
            this.eventEmitter = new NativeEventEmitter(NearbyConnectionsModule);
        }
    }

    /**
     * Check if Nearby Connections is available on this device
     */
    isAvailable(): boolean {
        return this.isAndroid && !!NearbyConnectionsModule;
    }

    /**
     * Start advertising this device for discovery
     * @param deviceName Name to advertise
     * @returns Promise resolving to local endpoint ID
     */
    async startAdvertising(deviceName: string): Promise<string> {
        if (!this.isAvailable()) {
            throw new Error('Nearby Connections not available on this platform');
        }
        return NearbyConnectionsModule.startAdvertising(deviceName);
    }

    /**
     * Stop advertising
     */
    async stopAdvertising(): Promise<void> {
        if (!this.isAvailable()) return;
        return NearbyConnectionsModule.stopAdvertising();
    }

    /**
     * Start discovering nearby devices
     */
    async startDiscovery(): Promise<void> {
        if (!this.isAvailable()) {
            throw new Error('Nearby Connections not available on this platform');
        }
        return NearbyConnectionsModule.startDiscovery();
    }

    /**
     * Stop discovering
     */
    async stopDiscovery(): Promise<void> {
        if (!this.isAvailable()) return;
        return NearbyConnectionsModule.stopDiscovery();
    }

    /**
     * Request connection to a discovered endpoint
     */
    async requestConnection(endpointId: string, deviceName: string): Promise<void> {
        if (!this.isAvailable()) {
            throw new Error('Nearby Connections not available on this platform');
        }
        return NearbyConnectionsModule.requestConnection(endpointId, deviceName);
    }

    /**
     * Accept an incoming connection
     */
    async acceptConnection(endpointId: string): Promise<void> {
        if (!this.isAvailable()) return;
        return NearbyConnectionsModule.acceptConnection(endpointId);
    }

    /**
     * Reject an incoming connection
     */
    async rejectConnection(endpointId: string): Promise<void> {
        if (!this.isAvailable()) return;
        return NearbyConnectionsModule.rejectConnection(endpointId);
    }

    /**
     * Send a file payload to connected endpoint
     */
    async sendFile(endpointId: string, fileUri: string, fileName: string): Promise<string> {
        if (!this.isAvailable()) {
            throw new Error('Nearby Connections not available on this platform');
        }
        return NearbyConnectionsModule.sendPayload(endpointId, fileUri, fileName);
    }

    /**
     * Disconnect from endpoint
     */
    async disconnect(endpointId: string): Promise<void> {
        if (!this.isAvailable()) return;
        return NearbyConnectionsModule.disconnect(endpointId);
    }

    /**
     * Listen for discovered devices
     */
    onDeviceDiscovered(callback: (device: NearbyDevice) => void) {
        if (!this.eventEmitter) return () => {};
        return this.eventEmitter.addListener('onEndpointDiscovered', callback);
    }

    /**
     * Listen for lost devices
     */
    onDeviceLost(callback: (endpointId: string) => void) {
        if (!this.eventEmitter) return () => {};
        return this.eventEmitter.addListener('onEndpointLost', callback);
    }

    /**
     * Listen for connection results
     */
    onConnectionResult(callback: (result: ConnectionResult) => void) {
        if (!this.eventEmitter) return () => {};
        return this.eventEmitter.addListener('onConnectionResult', callback);
    }

    /**
     * Listen for connection requests
     */
    onConnectionInitiated(callback: (data: { endpointId: string; name: string }) => void) {
        if (!this.eventEmitter) return () => {};
        return this.eventEmitter.addListener('onConnectionInitiated', callback);
    }

    /**
     * Listen for payload transfer updates
     */
    onPayloadTransferUpdate(callback: (update: PayloadTransferUpdate) => void) {
        if (!this.eventEmitter) return () => {};
        return this.eventEmitter.addListener('onPayloadTransferUpdate', callback);
    }
}

export const nearbyConnectionsService = new NearbyConnectionsService();
