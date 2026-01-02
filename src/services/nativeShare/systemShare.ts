import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface ShareFile {
    uri: string;
    mimeType?: string;
    fileName?: string;
}

/**
 * Share files via native system share sheet
 * This will show Quick Share on Android and AirDrop on iOS
 */
export async function shareViaSystem(files: ShareFile[]): Promise<boolean> {
    try {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert(
                'Sharing Not Available',
                'System sharing is not supported on this device.'
            );
            return false;
        }

        if (files.length === 0) {
            Alert.alert('No Files', 'Please select files to share.');
            return false;
        }

        // Share files one by one (or batch if supported)
        for (const file of files) {
            await Sharing.shareAsync(file.uri, {
                mimeType: file.mimeType || '*/*',
                dialogTitle: file.fileName || 'Share File',
                UTI: file.mimeType, // iOS Uniform Type Identifier
            });
        }

        return true;
    } catch (error) {
        console.error('System share error:', error);
        Alert.alert(
            'Share Failed',
            error instanceof Error ? error.message : 'Failed to share files'
        );
        return false;
    }
}

/**
 * Check if system sharing is available
 */
export async function isSystemShareAvailable(): Promise<boolean> {
    try {
        return await Sharing.isAvailableAsync();
    } catch {
        return false;
    }
}

/**
 * Share a single file
 */
export async function shareSingleFile(uri: string, mimeType?: string, fileName?: string): Promise<boolean> {
    return shareViaSystem([{ uri, mimeType, fileName }]);
}
