import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

class FolderPickerService {
    async pickCustomFolder(): Promise<string | null> {
        if (Platform.OS === 'web') {
            throw new Error('Folder picking is not supported on web. Using default Downloads folder.');
        }

        try {
            // On mobile, use document picker to select a folder
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return null;
            }

            // Extract folder path from the selected file's URI
            const uri = result.assets[0].uri;
            const folderPath = uri.substring(0, uri.lastIndexOf('/'));

            return folderPath;
        } catch (error) {
            console.error('Error picking folder:', error);
            throw new Error('Failed to select folder');
        }
    }
}

export const folderPickerService = new FolderPickerService();
