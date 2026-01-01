import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface PickedFile {
    uri: string;
    name: string;
    size: number;
    mimeType: string;
}

class PickerService {
    async pickDocument(): Promise<PickedFile[]> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
                copyToCacheDirectory: false,
            });

            if (result.canceled) return [];

            return result.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.name,
                size: asset.size || 0,
                mimeType: asset.mimeType || 'application/octet-stream',
            }));
        } catch (error) {
            console.error('Error picking document:', error);
            throw error;
        }
    }

    async pickMedia(): Promise<PickedFile[]> {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Please grant media library permission to select files.');
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (result.canceled) return [];

            return result.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.fileName || `media_${Date.now()}`,
                size: asset.fileSize || 0,
                mimeType: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
            }));
        } catch (error) {
            console.error('Error picking media:', error);
            throw error;
        }
    }

    async pickFolder(): Promise<PickedFile[]> {
        if (Platform.OS === 'web') {
            throw new Error('Folder picking is not supported on web.');
        }

        // On Android, use document picker with directory mode
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
                copyToCacheDirectory: false,
            });

            if (result.canceled) return [];

            return result.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.name,
                size: asset.size || 0,
                mimeType: asset.mimeType || 'application/octet-stream',
            }));
        } catch (error) {
            console.error('Error picking folder:', error);
            throw error;
        }
    }

    async pickApp(): Promise<PickedFile[]> {
        if (Platform.OS !== 'android') {
            throw new Error('App selection is only available on Android');
        }

        try {
            // On Android, we can look for .apk files
            // To properly list installed apps and extract them, we would need a native module
            // For now, allow picking .apk files directly
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/vnd.android.package-archive',
                multiple: true,
                copyToCacheDirectory: false,
            });

            if (result.canceled) return [];

            return result.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.name,
                size: asset.size || 0,
                mimeType: 'application/vnd.android.package-archive',
            }));
        } catch (error) {
            console.error('Error picking app:', error);
            throw error;
        }
    }

    async pickInstalledApp(): Promise<PickedFile[]> {
        return this.pickApp();
    }
}

export const pickerService = new PickerService();
