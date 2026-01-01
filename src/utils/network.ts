import * as Network from 'expo-network';
import { Platform } from 'react-native';

export interface NetworkInfo {
    ipAddress: string;
    isConnected: boolean;
    networkType: string;
}

export const getNetworkInfo = async (): Promise<NetworkInfo> => {
    try {
        const ipAddress = await Network.getIpAddressAsync();
        const networkState = await Network.getNetworkStateAsync();

        return {
            ipAddress: ipAddress || '0.0.0.0',
            isConnected: networkState.isConnected || false,
            networkType: networkState.type || 'unknown',
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
