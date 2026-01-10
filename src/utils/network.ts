import NetInfo from '@react-native-community/netinfo';
import WifiManager from 'react-native-wifi-reborn';
import { Platform } from 'react-native';

export interface NetworkInfo {
    ipAddress: string;
    isConnected: boolean;
    networkType: string;
}

export const getNetworkInfo = async (): Promise<NetworkInfo> => {
    try {
        const state = await NetInfo.fetch();
        let ipAddress = '0.0.0.0';

        if (Platform.OS !== 'web') {
            try {
                ipAddress = await WifiManager.getIP();
            } catch (e) {
                // Fallback or ignore if not on WiFi
                if (state.details && 'ipAddress' in state.details) {
                    ipAddress = (state.details as any).ipAddress || '0.0.0.0';
                }
            }
        }

        return {
            ipAddress,
            isConnected: state.isConnected || false,
            networkType: state.type || 'unknown',
        };
    } catch (error) {
        console.error('Failed to get network info:', error);
        return {
            ipAddress: '0.0.0.0',
            isConnected: false,
            networkType: 'unknown',
        };
    }
};

export const isLocalNetworkAvailable = async (): Promise<boolean> => {
    const info = await getNetworkInfo();
    return info.isConnected && info.ipAddress !== '0.0.0.0';
};

export const validatePort = (port: number): boolean => {
    return port >= 1024 && port <= 65535;
};

export const isPrivateIP = (ip: string): boolean => {
    const parts = ip.split('.').map(Number);

    if (parts.length !== 4) return false;

    // 10.0.0.0 - 10.255.255.255
    if (parts[0] === 10) return true;

    // 172.16.0.0 - 172.31.255.255
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

    // 192.168.0.0 - 192.168.255.255
    if (parts[0] === 192 && parts[1] === 168) return true;

    return false;
};

export const getPlatformSupport = () => {
    return {
        udpMulticast: Platform.OS !== 'web',
        httpServer: Platform.OS !== 'web',
        backgroundServer: Platform.OS === 'android',
        fileSystem: true,
    };
};
