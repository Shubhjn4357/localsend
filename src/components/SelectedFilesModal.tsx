import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, IconButton, useTheme, Button, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';
import type { PickedFile } from '@/services/pickerService';

interface SelectedFilesModalProps {
    visible: boolean;
    onClose: () => void;
    files: PickedFile[];
    onRemove: (file: PickedFile) => void;
    onRemoveAll: () => void;
}

export function SelectedFilesModal({ visible, onClose, files, onRemove, onRemoveAll }: SelectedFilesModalProps) {
    const theme = useTheme<AppTheme>();

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.background }]}
            >
                <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        iconColor={theme.colors.onSurface}
                        onPress={onClose}
                    />
                    <Text style={[styles.title, { color: theme.colors.onSurface }]}>Selection</Text>
                    <View style={{ width: 48 }} />
                </View>

                <View style={styles.statsContainer}>
                    <View>
                        <Text style={[styles.statsText, { color: theme.colors.onSurfaceVariant }]}>
                            Files: {files.length}
                        </Text>
                        <Text style={[styles.statsText, { color: theme.colors.onSurfaceVariant }]}>
                            Size: {formatSize(totalSize)}
                        </Text>
                    </View>
                    <Button
                        mode="contained"
                        onPress={onRemoveAll}
                        buttonColor={theme.colors.primary}
                        textColor={theme.colors.onPrimary}
                        style={styles.deleteAllButton}
                    >
                        Delete all
                    </Button>
                </View>

                <ScrollView contentContainerStyle={styles.listContent}>
                    {files.map((file, index) => (
                        <View
                            key={`${index}-${file.name}`}
                            style={[styles.fileItem, { backgroundColor: theme.colors.surfaceVariant }]}
                        >
                            <View style={styles.fileIcon}>
                                <MaterialCommunityIcons
                                    name={file.mimeType.startsWith('image/') ? 'image' : 'file'}
                                    size={32}
                                    color={theme.colors.primary}
                                />
                            </View>
                            <View style={styles.fileInfo}>
                                <Text
                                    style={[styles.fileName, { color: theme.colors.onSurfaceVariant }]}
                                    numberOfLines={1}
                                    ellipsizeMode="middle"
                                >
                                    {file.name}
                                </Text>
                                <Text style={[styles.fileSize, { color: theme.colors.outline }]}>
                                    {formatSize(file.size)}
                                </Text>
                            </View>
                            <IconButton
                                icon="delete"
                                size={20}
                                iconColor={theme.colors.onSurfaceVariant}
                                onPress={() => onRemove(file)}
                            />
                        </View>
                    ))}
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        margin: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    statsText: {
        fontSize: 14,
        marginBottom: 2,
    },
    deleteAllButton: {
        borderRadius: 20,
    },
    listContent: {
        padding: 16,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 12,
        gap: 12,
    },
    fileIcon: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    fileName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 12,
    },
});
