import { FILE_CATEGORIES } from './constants';

export const getMimeType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const mimeMap: Record<string, string> = {
        // Images
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        bmp: 'image/bmp',
        svg: 'image/svg+xml',
        heic: 'image/heic',
        heif: 'image/heif',

        // Videos
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        avi: 'video/x-msvideo',
        mkv: 'video/x-matroska',
        webm: 'video/webm',
        flv: 'video/x-flv',
        wmv: 'video/x-ms-wmv',

        // Documents
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        rtf: 'application/rtf',

        // Archives
        zip: 'application/zip',
        rar: 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        tar: 'application/x-tar',
        gz: 'application/gzip',
        bz2: 'application/x-bzip2',

        // Audio
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        flac: 'audio/flac',
        aac: 'audio/aac',
        m4a: 'audio/m4a',
        ogg: 'audio/ogg',

        // APK
        apk: 'application/vnd.android.package-archive',
    };

    return mimeMap[extension] || 'application/octet-stream';
};

export const getFileCategory = (fileName: string): keyof typeof FILE_CATEGORIES | 'OTHER' => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
        if ((extensions as readonly string[]).includes(extension)) {
            return category as keyof typeof FILE_CATEGORIES;
        }
    }

    return 'OTHER';
};

export const getFileIcon = (fileName: string): string => {
    const category = getFileCategory(fileName);

    const iconMap: Record<string, string> = {
        IMAGE: 'image',
        VIDEO: 'video',
        DOCUMENT: 'file-document',
        ARCHIVE: 'folder-zip',
        AUDIO: 'music',
        APK: 'android',
        OTHER: 'file',
    };

    return iconMap[category] || 'file';
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export const formatTransferSpeed = (bytesPerSecond: number): string => {
    return `${formatFileSize(bytesPerSecond)}/s`;
};
