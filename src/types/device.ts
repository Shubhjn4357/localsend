/**
 * Device types for LocalSend protocol
 */
export interface Device {
    fingerprint: string;
    alias: string;
    deviceType: 'mobile' | 'desktop' | 'web' | 'headless' | 'server';
    deviceModel?: string;
    ipAddress: string;
    port: number;
    protocol: 'http' | 'https';
    version: string;
    lastSeen: number;
    isOnline: boolean;
}

export interface DeviceAnnouncement {
    alias: string;
    version: string;
    deviceModel?: string;
    deviceType: 'mobile' | 'desktop' | 'web' | 'headless' | 'server';
    fingerprint: string;
    port: number;
    protocol: 'http' | 'https';
    download?: boolean;
    announce: boolean;
}
