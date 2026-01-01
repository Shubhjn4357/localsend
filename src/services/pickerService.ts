import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

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
                Alert.alert('Permission Required', 'Please grant media library permission to select files.');
                return [];
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
            Alert.alert('Not Supported', 'Folder picking is not supported on web.');
            return [];
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
            Alert.alert('Not Supported', 'App selection is only available on Android');
            return [];
        }

        // For now, show an info message. Full implementation would require native module
        Alert.alert(
            'App Picker',
            'Select an installed app to share its APK file. This feature requires additional setup.',
            [{ text: 'OK' }]
        );

        return [];
    }

    async pickInstalledApp(): Promise<PickedFile[]> {
        if (Platform.OS !== 'android') {
            Alert.alert('Not Supported', 'App selection is only available on Android');
            return [];
        }

        try {
            // This would require a native module to get installed apps
            // For now, we'll use document picker as fallback to select APK files
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/vnd.android.package-archive',
                multiple: false,
            });

            if (result.canceled) {
                return [];
            }

            return result.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.name,
                size: asset.size || 0,
                mimeType: asset.mimeType || 'application/vnd.android.package-archive',
            }));
        } catch (error) {
            console.error('Error picking app:', error);
            throw error;
        }
    }
}

export const pickerService = new PickerService();
