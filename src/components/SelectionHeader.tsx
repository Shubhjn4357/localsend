import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, IconButton, useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';

interface SelectionHeaderProps {
    fileCount: number;
    totalSize: number;
    onClose: () => void;
    onEdit?: () => void;
    onAdd: () => void;
    filePreview?: React.ReactNode;
    onShowQR?: () => void;
}

export function SelectionHeader({
    fileCount,
    totalSize,
    onClose,
    onEdit,
    onAdd,
    filePreview,
    onShowQR,
}: SelectionHeaderProps) {
    const theme = useTheme<AppTheme>();

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                        Selection
                    </Text>
                    <IconButton
                        icon="close"
                        size={20}
                        iconColor={theme.colors.onSurfaceVariant}
                        onPress={onClose}
                    />
                </View>
                <View style={styles.stats}>
                    <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        Files: {fileCount}
                    </Text>
                    <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                        Size: {formatSize(totalSize)}
                    </Text>
                </View>
            </View>

            {filePreview && (
                <View style={styles.preview}>
                    {filePreview}
                </View>
            )}

            <View style={styles.actions}>
                <Button
                    mode="text"
                    onPress={onEdit}
                    style={styles.actionButton}
                    textColor={theme.colors.onSurface}
                >
                    Edit
                </Button>
                {onShowQR && (
                    <Button
                        mode="outlined"
                        onPress={onShowQR}
                        style={styles.actionButton}
                        icon="qrcode"
                        textColor={theme.colors.primary}
                    >
                        QR Code
                    </Button>
                )}
                <Button
                    mode="contained"
                    onPress={onAdd}
                    style={styles.actionButton}
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.onPrimary}
                >
                    + Add
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    stats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    statText: {
        fontSize: 14,
    },
    info: {
        marginBottom: 12,
    },
    preview: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        gap: 4,
    },
    primaryButton: {
        borderWidth: 0,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
