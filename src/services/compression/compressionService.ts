import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * File types that benefit from compression
 */
const COMPRESSIBLE_EXTENSIONS = [
    'txt', 'json', 'xml', 'csv', 'log', 'md', 'html', 'css', 'js', 'ts', 'jsx', 'tsx',
    'java', 'kt', 'swift', 'py', 'rb', 'php', 'go', 'rs', 'c', 'cpp', 'h', 'hpp',
    'sql', 'yaml', 'yml', 'toml', 'ini', 'conf', 'sh', 'bat', 'ps1'
];

/**
 * File types already compressed (don't re-compress)
 */
const COMPRESSED_EXTENSIONS = [
    'zip', 'gz', 'bz2', 'xz', '7z', 'rar', 'tar',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mp3', 'mov', 'avi',
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'apk', 'ipa'
];

interface CompressionResult {
    uri: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    wasCompressed: boolean;
}

/**
 * Service for intelligent file compression
 * Only compresses files that will benefit from compression
 */
export class CompressionService {
    /**
     * Decide if a file should be compressed based on extension and size
     */
    shouldCompress(fileName: string, fileSize: number): boolean {
        // Don't compress small files (< 100KB)
        if (fileSize < 100 * 1024) {
            return false;
        }

        const extension = this.getExtension(fileName);

        // Don't compress already compressed files
        if (COMPRESSED_EXTENSIONS.includes(extension)) {
            return false;
        }

        // Compress text/code files
        if (COMPRESSIBLE_EXTENSIONS.includes(extension)) {
            return true;
        }

        // For unknown extensions, only compress if > 1MB
        return fileSize > 1024 * 1024;
    }

    /**
     * Compress a file (placeholder - would use native compression in production)
     */
    async compressFile(fileUri: string, fileName: string): Promise<CompressionResult> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            
            if (!fileInfo.exists || !('size' in fileInfo)) {
                throw new Error('File not found');
            }

            const originalSize = fileInfo.size;

            // Check if compression is beneficial
            if (!this.shouldCompress(fileName, originalSize)) {
                return {
                    uri: fileUri,
                    originalSize,
                    compressedSize: originalSize,
                    compressionRatio: 1.0,
                    wasCompressed: false
                };
            }

            // In a real implementation, we would:
            // 1. Use native compression (gzip/brotli) via a native module
            // 2. Write compressed data to temp file
            // 3. Return compressed file URI
            
            // For now, estimate compression ratio based on file type
            const extension = this.getExtension(fileName);
            const estimatedRatio = this.estimateCompressionRatio(extension);
            const compressedSize = Math.floor(originalSize * estimatedRatio);

            console.log(`Compression would reduce ${fileName} from ${this.formatSize(originalSize)} to ${this.formatSize(compressedSize)}`);

            return {
                uri: fileUri, // Would be compressed file URI
                originalSize,
                compressedSize,
                compressionRatio: estimatedRatio,
                wasCompressed: true
            };
        } catch (error) {
            console.error('Compression failed:', error);
            throw error;
        }
    }

    /**
     * Estimate compression ratio for different file types
     */
    private estimateCompressionRatio(extension: string): number {
        // Text files compress very well
        if (['txt', 'log', 'csv', 'json', 'xml', 'html'].includes(extension)) {
            return 0.3; // 70% reduction
        }

        // Code files compress well
        if (['js', 'ts', 'java', 'py', 'cpp'].includes(extension)) {
            return 0.4; // 60% reduction
        }

        // Default moderate compression
        return 0.6; // 40% reduction
    }

    /**
     * Get file extension from filename
     */
    private getExtension(fileName: string): string {
        const parts = fileName.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    }

    /**
     * Format file size for display
     */
    private formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
    }
}

export const compressionService = new CompressionService();
