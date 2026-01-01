import React from 'react';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';
import { GlassCard } from './ui/GlassCard';
import type { FileInfo } from '../types/transfer';
import type { AppTheme } from '../theme/colors';
import { getFileIcon, formatFileSize } from '../utils/file';

interface FileCardProps {
    file: FileInfo;
    onRemove: (fileId: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onRemove }) => {
    const theme = useTheme<AppTheme>();
    const fileIcon = getFileIcon(file.fileName);

    return (
        <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutRight.duration(200)}
            style={styles.container}
        >
            <GlassCard>
                <View style={styles.content}>
                    {/* File Preview/Icon */}
                    <View
                        style={[
                            styles.previewContainer,
                            { backgroundColor: theme.colors.surfaceVariant },
                        ]}
                    >
                        {file.preview ? (
                            <Image source={{ uri: file.preview }} style={styles.preview} />
                        ) : (
                            <MaterialCommunityIcons
                                name={fileIcon as any}
                                size={32}
                                color={theme.colors.primary}
                            />
                        )}
                    </View>

                    {/* File Info */}
                    <View style={styles.info}>
                        <Text
                            numberOfLines={1}
                            style={{ color: theme.colors.onSurface, fontSize: 14 }}
                        >
                            {file.fileName}
                        </Text>
                        <Text
                            style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
                        >
                            {formatFileSize(file.size)}
                        </Text>
                    </View>

                    {/* Remove Button */}
                    <IconButton
                        icon="close-circle"
                        size={24}
                        iconColor={theme.colors.error}
                        onPress={() => onRemove(file.id)}
                    />
                </View>
            </GlassCard>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    previewContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
    },
});
