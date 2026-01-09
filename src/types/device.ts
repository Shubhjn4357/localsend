export interface Device {
    fingerprint: string;
    alias: string;
    deviceType: 'mobile' | 'desktop' | 'web' | 'headless' | 'server';
    deviceModel?: string;
    ipAddress: string;
    port: number;
    protocol: 'http' | 'https' | 'bluetooth';
    version: string;
    lastSeen: number;
    isOnline: boolean;

    // Optional Bluetooth/connection fields
    bluetoothAddress?: string;
    connectionType?: 'wifi' | 'bluetooth' | 'wifi-direct';

    // Nearby Connections support (Android only)
    supportsNearby?: boolean;           // Device supports Nearby Connections
    nearbyEndpointId?: string;          // Nearby endpoint ID if discovered via Nearby
    preferredProtocol?: 'nearby' | 'neardrop' | 'localsend';  // Preferred transfer protocol

    // NearDrop support (macOS/iOS)
    supportsNearDrop?: boolean;         // Device supports NearDrop protocol
    nearDropEndpoint?: string;          // NearDrop endpoint (IP:port or hostname)
}

export interface DeviceAnnouncement {
    alias: string;
    version: string;
    deviceModel?: string;
    deviceType: 'mobile' | 'desktop' | 'web' | 'headless' | 'server';
    fingerprint: string;
    port: number;
    protocol: 'http' | 'https' | 'bluetooth';
    download?: boolean;
    announce: boolean;
    supportsNearby?: boolean;  // Advertise Nearby Connections support
}
