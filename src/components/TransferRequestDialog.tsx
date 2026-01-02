import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';
import type { TransferRequest } from '@/types/transfer';

interface TransferRequestDialogProps {
    visible: boolean;
    onAccept: () => void;
    onReject: () => void;
    request: TransferRequest | null;
}

export const TransferRequestDialog: React.FC<TransferRequestDialogProps> = ({
    visible,
    onAccept,
    onReject,
    request,
}) => {
    const theme = useTheme<AppTheme>();

    if (!request) return null;

    const fileCount = Object.keys(request.files).length;
    const totalSize = Object.values(request.files).reduce((sum, file) => sum + file.size, 0);

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onReject}
                contentContainerStyle={styles.modalContainer}
            >
                <Animated.View
                    entering={SlideInDown}
                    style={[
                        styles.bottomSheet,
                        { backgroundColor: theme.colors.surface }
                    ]}
                >
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name="file-download"
                            size={32}
                            color={theme.colors.primary}
                        />
                        <IconButton
                            icon="close"
                            size={24}
                            iconColor={theme.colors.onSurface}
                            onPress={onReject}
                            style={styles.closeButton}
                        />
                    </View>

                    <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                        Incoming Transfer
                    </Text>

                    <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                        {request.info.alias} wants to send you {fileCount} file{fileCount !== 1 ? 's' : ''}
                    </Text>

                    <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="devices"
                                size={20}
                                color={theme.colors.onSurfaceVariant}
                            />
                            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                                From:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                                {request.info.alias}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="file-multiple"
                                size={20}
                                color={theme.colors.onSurfaceVariant}
                            />
                            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                                Files:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                                {fileCount}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="database"
                                size={20}
                                color={theme.colors.onSurfaceVariant}
                            />
                            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                                Size:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                                {formatSize(totalSize)}
                            </Text>
                        </View>
                    </View>

                    <ScrollView style={styles.fileList} contentContainerStyle={styles.fileListContent}>
                        {Object.values(request.files).map((file) => (
                            <View
                                key={file.id}
                                style={[styles.fileItem, { backgroundColor: theme.colors.background }]}
                            >
                                <MaterialCommunityIcons
                                    name={file.fileType.startsWith('image/') ? 'image' : 'file'}
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <View style={styles.fileInfo}>
                                    <Text
                                        style={[styles.fileName, { color: theme.colors.onSurface }]}
                                        numberOfLines={1}
                                    >
                                        {file.fileName}
                                    </Text>
                                    <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
                                        {formatSize(file.size)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            mode="outlined"
                            onPress={onReject}
                            style={styles.button}
                            icon="close"
                        >
                            Reject
                        </Button>
                        <Button
                            mode="contained"
                            onPress={onAccept}
                            style={styles.button}
                            buttonColor={theme.colors.primary}
                            icon="check"
                        >
                            Accept
                        </Button>
                    </View>
                </Animated.View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    bottomSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        width: '100%',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    closeButton: {
        marginLeft: 'auto',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    fileList: {
        maxHeight: 200,
        marginBottom: 16,
    },
    fileListContent: {
        gap: 8,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    fileSize: {
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
    },
});
