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
}

export interface DeviceAnnouncement {
    alias: string;
    version: string;
    deviceModel?: string;
    deviceType: Device['deviceType'];
    fingerprint: string;
    port: number;
    protocol: Device['protocol'];
    download?: boolean;
    announce: boolean;
}
