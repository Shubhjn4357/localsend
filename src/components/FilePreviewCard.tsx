import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';
import { isImage, isVideo, getFileTypeIcon } from '@/utils/constants';
import type { PickedFile } from '@/services/pickerService';

interface FilePreviewCardProps {
    file: PickedFile;
    onPress?: () => void;
    onRemove?: () => void;
    theme: AppTheme;
}

/**
 * Card showing file preview with actual image/video thumbnail
 * Replaces generic file icons with visual previews
 */
export const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
    file,
    onPress,
    onRemove,
    theme
}) => {
    const showImagePreview = isImage(file.name);
    const showVideoPreview = isVideo(file.name);
    const fileIcon = getFileTypeIcon(file.name);

    return (
        <Pressable 
            onPress={onPress}
            style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
        >
            {/* Preview Area */}
            <View style={[styles.preview, { backgroundColor: theme.colors.surfaceVariant }]}>
                {showImagePreview ? (
                    <Image 
                        source={{ uri: file.uri }} 
                        style={styles.imagePreview}
                        resizeMode="cover"
                    />
                ) : showVideoPreview ? (
                    <View style={styles.videoPreview}>
                        <Image 
                            source={{ uri: file.uri }} 
                            style={styles.imagePreview}
                            resizeMode="cover"
                        />
                        <View style={[styles.playIcon, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                            <MaterialCommunityIcons name="play" size={32} color="#fff" />
                        </View>
                    </View>
                ) : (
                    <MaterialCommunityIcons 
                        name={fileIcon as any} 
                        size={40} 
                        color={theme.colors.onSurfaceVariant} 
                    />
                )}
            </View>

            {/* File Info */}
            <View style={styles.info}>
                <Text 
                    style={[styles.fileName, { color: theme.colors.onSurface }]}
                    numberOfLines={1}
                >
                    {file.name}
                </Text>
                <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
                    {formatFileSize(file.size || 0)}
                </Text>
            </View>

            {/* Remove Button */}
            {onRemove && (
                <Pressable onPress={onRemove} style={styles.removeButton}>
                    <MaterialCommunityIcons 
                        name="close-circle" 
                        size={24} 
                        color={theme.colors.error} 
                    />
                </Pressable>
            )}
        </Pressable>
    );
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    preview: {
        width: 60,
        height: 60,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    videoPreview: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    playIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -20,
        marginLeft: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 12,
    },
    removeButton: {
        padding: 4,
    },
});
