import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import type { ThemeMode, ColorScheme, Language, DestinationFolder } from '../types/settings';
import { generateRandomDeviceName, generateDeviceId } from '../utils/deviceNames';
import { LocalStorage, STORAGE_KEYS } from '../utils/storage';
import i18n from '@/i18n';

interface SettingsStore {
    // General Settings
    theme: ThemeMode;
    colorScheme: ColorScheme;
    language: Language;
    animationsEnabled: boolean;

    // Receive Settings
    quickSaveEnabled: boolean;
    quickSaveForFavorites: boolean;
    requirePin: boolean;
    pin: string;
    destination: DestinationFolder;
    customDestination: string;
    downloadPath: string; // Actual filesystem path for downloads
    saveToGallery: boolean;
    autoFinish: boolean;
    saveHistory: boolean;

    // Network Settings
    deviceName: string;
    deviceId: string;
    serverRunning: boolean;
    serverPort: number;
    optimizeTransfers: boolean;      // Enable compression & streaming

    // Legacy (keeping for compatibility)
    deviceAlias: string;
    autoAccept: boolean;
    saveDirectory: string;

    // Actions
    setTheme: (theme: ThemeMode) => Promise<void>;
    setColorScheme: (colorScheme: ColorScheme) => Promise<void>;
    setLanguage: (language: Language) => Promise<void>;
    setAnimationsEnabled: (enabled: boolean) => Promise<void>;

    setQuickSaveEnabled: (enabled: boolean) => Promise<void>;
    setQuickSaveForFavorites: (enabled: boolean) => Promise<void>;
    setRequirePin: (enabled: boolean) => Promise<void>;
    setPin: (pin: string) => Promise<void>;
    setDestination: (destination: DestinationFolder) => Promise<void>;
    setCustomDestination: (path: string) => Promise<void>;
    setSaveToGallery: (enabled: boolean) => Promise<void>;
    setAutoFinish: (enabled: boolean) => Promise<void>;
    setSaveHistory: (enabled: boolean) => Promise<void>;

    setDeviceName: (name: string) => Promise<void>;
    setServerRunning: (running: boolean) => void;
    setServerPort: (port: number) => Promise<void>;
    setOptimizeTransfers: (enabled: boolean) => Promise<void>;

    // Legacy actions
    setDeviceAlias: (alias: string) => void;
    setAutoAccept: (autoAccept: boolean) => void;
    setSaveDirectory: (directory: string) => void;

    // Utility
    loadSettings: () => Promise<void>;
    resetToDefaults: () => Promise<void>;
}

const generateDefaultAlias = () => {
    const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
    const platform = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';
    return `${deviceName} (${platform})`;
};

const defaultSettings = {
    // General
    theme: 'auto' as ThemeMode,
    colorScheme: 'localsend' as ColorScheme,
    language: 'en' as Language,
    animationsEnabled: true,

    // Receive
    quickSaveEnabled: false,
    quickSaveForFavorites: false,
    requirePin: false,
    pin: '',
    destination: 'downloads' as DestinationFolder,
    customDestination: '',
    downloadPath: '', // Will be set to FileSystem.documentDirectory at runtime
    saveToGallery: true,
    autoFinish: true,
    saveHistory: true,

    // Network
    deviceName: generateRandomDeviceName(),
    deviceId: generateDeviceId(),
    serverRunning: false,
    serverPort: 53317,
    optimizeTransfers: true, // Optimization enabled by default

    // Legacy
    deviceAlias: generateDefaultAlias(),
    autoAccept: false,
    saveDirectory: '',
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    ...defaultSettings,

    setTheme: async (theme) => {
        set({ theme });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setColorScheme: async (colorScheme) => {
        set({ colorScheme });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setLanguage: async (language) => {
        set({ language });
        // Sync with i18n
        i18n.changeLanguage(language);
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setAnimationsEnabled: async (enabled) => {
        set({ animationsEnabled: enabled });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setQuickSaveEnabled: async (enabled) => {
        set({ quickSaveEnabled: enabled });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setQuickSaveForFavorites: async (enabled) => {
        set({ quickSaveForFavorites: enabled });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setRequirePin: async (enabled) => {
        set({ requirePin: enabled });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setPin: async (pin) => {
        set({ pin });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setDestination: async (destination) => {
        set({ destination });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setCustomDestination: async (path) => {
        set({ customDestination: path });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setSaveToGallery: async (enabled) => {
        set({ saveToGallery: enabled });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setAutoFinish: async (enabled) => {
        set({ autoFinish: enabled });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setSaveHistory: async (enabled) => {
        set({ saveHistory: enabled });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setDeviceName: async (name) => {
        set({ deviceName: name, deviceAlias: name });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setServerRunning: (running) => {
        set({ serverRunning: running });
    },

    setServerPort: async (port) => {
        set({ serverPort: port });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setOptimizeTransfers: async (enabled) => {
        set({ optimizeTransfers: enabled });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },

    setDeviceAlias: (alias) => set({ deviceAlias: alias, deviceName: alias }),
    setAutoAccept: (autoAccept) => set({ autoAccept }),
    setSaveDirectory: (directory) => set({ saveDirectory: directory }),

    loadSettings: async () => {
        const saved = await LocalStorage.get<Partial<SettingsStore>>(STORAGE_KEYS.SETTINGS);
        if (saved) {
            set(saved);
        }

        // Set downloadPath to default if not set        
        const FileSystem = require('expo-file-system');
        if (!get().downloadPath && FileSystem.documentDirectory) {
            set({ downloadPath: FileSystem.documentDirectory });
        }
    },

    resetToDefaults: async () => {
        set({
            ...defaultSettings,
            deviceName: generateRandomDeviceName(),
            deviceId: generateDeviceId(),
            deviceAlias: generateDefaultAlias(),
        });
        await LocalStorage.set(STORAGE_KEYS.SETTINGS, get());
    },
}));

/**
 * Generate a random 6-digit numeric device ID
 * Format: #123456 (easier for manual entry)
 */
const generateNumericDeviceId = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get or create device fingerprint (6-digit numeric ID)
 */
export const getDeviceFingerprint = async (): Promise<string> => {
    try {
        const stored = await LocalStorage.get<string>(STORAGE_KEYS.DEVICE_ID);
        if (stored && typeof stored === 'string') {
            return stored as string;
        }

        const newId = generateNumericDeviceId();
        await LocalStorage.set(STORAGE_KEYS.DEVICE_ID, newId);
        return newId;
    } catch (error) {
        console.error('Error getting device ID:', error);
        return generateNumericDeviceId();
    }
};
