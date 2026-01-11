export const LOCALSEND_VERSION = '4.6.1';
export const PROTOCOL_VERSION = 'v2';
export const APP_DEVELOPER = 'Shubh Jain';

// Network constants
export const MULTICAST_GROUP = '224.0.0.167';
export const MULTICAST_PORT = 53317;
export const HTTP_PORT_RANGE_START = 53317;
export const HTTP_PORT_RANGE_END = 53427;

// Discovery constants
export const ANNOUNCEMENT_INTERVAL = 5000; // 5 seconds
export const DEVICE_TIMEOUT = 30000; // 30 seconds

// Transfer constants
export const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
export const MAX_FILES_PER_TRANSFER = 100;
export const TRANSFER_TIMEOUT = 60000; // 60 seconds

// File categories
export const FILE_CATEGORIES = {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif'],
    VIDEO: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'],
    DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'],
    ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    AUDIO: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'],
    APK: ['apk'],
} as const;

// File type options for Send tab
export type FileTypeOption = 'file' | 'media' | 'text' | 'folder' | 'app';

export const FILE_TYPE_OPTIONS: Array<{
    type: FileTypeOption;
    label: string;
    icon: string;
}> = [
        { type: 'file', label: 'File', icon: 'file-document' },
        { type: 'media', label: 'Media', icon: 'image-multiple' },
        { type: 'text', label: 'Text', icon: 'text-box' },
        { type: 'folder', label: 'Folder', icon: 'folder' },
        { type: 'app', label: 'App', icon: 'application' },
    ];

// Changelog
export const CHANGELOG = [
    {
        version: '4.6.1',
        date: '2026-01-08',
        changes: [
            'First-time user onboarding screen',
            'File preview with actual image thumbnails',
            'Video thumbnail support',
            'Tap to preview files in full screen',
            'Changelog display in settings',
            'Numeric device IDs (#123456)',
            'Auto-discovery with device cards',
            'Performance optimizations (React.memo, useCallback)',
            'CI/CD pipelines for automated builds',
        ],
    },
    {
        version: '3.1.0',
        date: '2026-01-02',
        changes: [
            'Enhanced progress overlay with real-time speed/ETA',
            'Transfer request dialog (manual accept/reject)',
            'PIN authentication for secure transfers',
            'Native system share support',
            'Complete type-safety (0 TypeScript errors)',
        ],
    },
    {
        version: '2.3.5b',
        date: '2026-01-01',
        changes: [
            'Complete mobile redesign with bottom tab navigation',
            'Added comprehensive settings panel',
            'Implemented history system with local storage',
            'Added favorites for frequently used devices',
            'Fun random device names (like "Fresh Broccoli"!)',
            'Premium animations and curly spinner design',
            'Enhanced send tab with file type selection',
            'Multi-language support (8 languages)',
            'Dark mode improvements',
            'Type-safe implementation throughout',
        ],
    },
    {
        version: '2.3.0',
        date: '2025-12-15',
        changes: [
            'Initial LocalSend implementation',
            'Device discovery via UDP multicast',
            'File transfer functionality',
            'Material Design 3 theme',
            'Cross-platform support (Android, iOS, Web)',
        ],
    },
];

// File type detection utilities
export const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImage = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return FILE_CATEGORIES.IMAGE.includes(ext as any);
};

export const isVideo = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return FILE_CATEGORIES.VIDEO.includes(ext as any);
};

export const isAudio = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return FILE_CATEGORIES.AUDIO.includes(ext as any)

        ;
};

export const isDocument = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return FILE_CATEGORIES.DOCUMENT.includes(ext as any);
};

export const getFileTypeIcon = (filename: string): string => {
    if (isImage(filename)) return 'file-image';
    if (isVideo(filename)) return 'file-video';
    if (isAudio(filename)) return 'file-music';
    if (isDocument(filename)) return 'file-document';
    if (getFileExtension(filename) === 'apk') return 'android';
    return 'file';
};
