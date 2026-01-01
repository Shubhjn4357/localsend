import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    SETTINGS: '@localsend/settings',
    HISTORY: '@localsend/history',
    FAVORITES: '@localsend/favorites',
    DEVICE_INFO: '@localsend/device_info',
} as const;

export class LocalStorage {
    static async get<T>(key: string): Promise<T | null> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    }

    static async set<T>(key: string, value: T): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    }

    static async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from storage:', error);
        }
    }

    static async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}

export { STORAGE_KEYS };
