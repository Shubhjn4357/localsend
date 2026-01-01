export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'hi';
export type DestinationFolder = 'downloads' | 'documents' | 'custom';

export interface GeneralSettings {
    theme: ThemeMode;
    language: Language;
    animationsEnabled: boolean;
}

export interface ReceiveSettings {
    quickSaveEnabled: boolean;
    requirePin: boolean;
    pin?: string;
    destination: DestinationFolder;
    customDestination?: string;
    saveToGallery: boolean;
    autoFinish: boolean;
    saveHistory: boolean;
}

export interface NetworkSettings {
    deviceName: string;
    deviceId: string;
    serverRunning: boolean;
    serverPort: number;
}

export interface AppSettings extends GeneralSettings, ReceiveSettings, NetworkSettings {
    // Combined settings interface
}

export const LANGUAGES: Record<Language, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    pt: 'Português',
    zh: '中文',
    ja: '日本語',
    hi: 'हिन्दी',
};

export const DESTINATION_FOLDERS: Record<DestinationFolder, string> = {
    downloads: 'Downloads',
    documents: 'Documents',
    custom: 'Custom',
};
