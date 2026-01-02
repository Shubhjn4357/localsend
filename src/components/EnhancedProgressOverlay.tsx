import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Portal, Modal, Text, IconButton, ProgressBar, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppTheme } from '@/theme/colors';
import { useTransferStore } from '@/stores/transferStore';

interface EnhancedProgressOverlayProps {
    visible: boolean;
    onClose: () => void;
}

export const EnhancedProgressOverlay: React.FC<EnhancedProgressOverlayProps> = ({
    visible,
    onClose,
}) => {
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();
    const transfers = useTransferStore((state) => state.transfers);
    const cancelTransfer = useTransferStore((state) => state.cancelTransfer);

    // Get active transfers (transferring or pending)
    const activeTransfers = transfers.filter(
        t => t.status === 'transferring' || t.status === 'pending' || t.status === 'accepted'
    );

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    const formatSpeed = (bytesPerSecond: number): string => {
        if (bytesPerSecond === 0) return '0 B/s';
        const k = 1024;
        const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
        const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
        return `${(bytesPerSecond / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    const formatTime = (seconds: number): string => {
        if (seconds === 0 || !isFinite(seconds)) return '--';
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const calculateETA = (totalSize: number, transferredSize: number, speed: number): number => {
        if (speed === 0) return 0;
        const remaining = totalSize - transferredSize;
        return remaining / speed;
    };

    const handleCancelTransfer = (transferId: string) => {
        cancelTransfer(transferId);
    };

    if (!visible || activeTransfers.length === 0) return null;

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.modalContainer}
            >
                <Animated.View
                    entering={SlideInUp}
                    style={[
                        styles.overlay,
                        {
                            backgroundColor: theme.colors.surface,
                            paddingBottom: insets.bottom + 16,
                        }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <MaterialCommunityIcons
                                name="transfer"
                                size={24}
                                color={theme.colors.primary}
                            />
                            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                                Active Transfers ({activeTransfers.length})
                            </Text>
                        </View>
                        <IconButton
                            icon="close"
                            size={24}
                            iconColor={theme.colors.onSurface}
                            onPress={onClose}
                        />
                    </View>

                    {/* Transfer List */}
                    <ScrollView style={styles.transferList} contentContainerStyle={styles.transferListContent}>
                        {activeTransfers.map((transfer) => {
                            const progress = transfer.totalSize > 0
                                ? transfer.transferredSize / transfer.totalSize
                                : 0;
                            const eta = calculateETA(transfer.totalSize, transfer.transferredSize, transfer.speed);

                            return (
                                <Animated.View
                                    key={transfer.id}
                                    entering={FadeIn}
                                    style={[
                                        styles.transferCard,
                                        { backgroundColor: theme.colors.surfaceVariant }
                                    ]}
                                >
                                    {/* Transfer Header */}
                                    <View style={styles.transferHeader}>
                                        <View style={styles.transferInfo}>
                                            <MaterialCommunityIcons
                                                name={transfer.direction === 'send' ? 'upload' : 'download'}
                                                size={20}
                                                color={theme.colors.primary}
                                            />
                                            <Text style={[styles.deviceName, { color: theme.colors.onSurface }]}>
                                                {transfer.direction === 'send' ? 'To: ' : 'From: '}
                                                {transfer.device.alias}
                                            </Text>
                                        </View>
                                        <IconButton
                                            icon="close-circle"
                                            size={20}
                                            iconColor={theme.colors.error}
                                            onPress={() => handleCancelTransfer(transfer.id)}
                                        />
                                    </View>

                                    {/* Overall Progress */}
                                    <View style={styles.progressSection}>
                                        <View style={styles.progressInfo}>
                                            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                                                {formatSize(transfer.transferredSize)} / {formatSize(transfer.totalSize)}
                                            </Text>
                                            <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
                                                {Math.round(progress * 100)}%
                                            </Text>
                                        </View>
                                        <ProgressBar
                                            progress={progress}
                                            color={theme.colors.primary}
                                            style={styles.progressBar}
                                        />
                                    </View>

                                    {/* Speed and ETA */}
                                    <View style={styles.statsRow}>
                                        <View style={styles.stat}>
                                            <MaterialCommunityIcons
                                                name="speedometer"
                                                size={16}
                                                color={theme.colors.onSurfaceVariant}
                                            />
                                            <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                                                {formatSpeed(transfer.speed)}
                                            </Text>
                                        </View>
                                        <View style={styles.stat}>
                                            <MaterialCommunityIcons
                                                name="clock-outline"
                                                size={16}
                                                color={theme.colors.onSurfaceVariant}
                                            />
                                            <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                                                {formatTime(eta)} remaining
                                            </Text>
                                        </View>
                                    </View>

                                    {/* File List */}
                                    {transfer.files.length > 0 && (
                                        <View style={styles.fileList}>
                                            <Text style={[styles.fileListTitle, { color: theme.colors.onSurfaceVariant }]}>
                                                Files ({transfer.files.length}):
                                            </Text>
                                            {transfer.files.slice(0, 3).map((file) => (
                                                <View key={file.id} style={styles.fileItem}>
                                                    <MaterialCommunityIcons
                                                        name={
                                                            file.fileType?.startsWith('image/') ? 'image' :
                                                                file.fileType?.startsWith('video/') ? 'video' :
                                                                    file.fileType?.startsWith('audio/') ? 'music' :
                                                                        'file'
                                                        }
                                                        size={16}
                                                        color={theme.colors.onSurfaceVariant}
                                                    />
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
                                            ))}
                                            {transfer.files.length > 3 && (
                                                <Text style={[styles.moreFiles, { color: theme.colors.onSurfaceVariant }]}>
                                                    +{transfer.files.length - 3} more
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </Animated.View>
                            );
                        })}
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <Button
                            mode="outlined"
                            onPress={onClose}
                            style={styles.button}
                        >
                            Minimize
                        </Button>
                    </View>
                </Animated.View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        maxHeight: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    transferList: {
        flex: 1,
    },
    transferListContent: {
        padding: 16,
        gap: 16,
    },
    transferCard: {
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    transferHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    transferInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    progressSection: {
        gap: 8,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 14,
    },
    progressPercent: {
        fontSize: 16,
        fontWeight: '700',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
    },
    fileList: {
        gap: 8,
        marginTop: 4,
    },
    fileListTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fileName: {
        fontSize: 13,
        flex: 1,
    },
    fileSize: {
        fontSize: 12,
    },
    moreFiles: {
        fontSize: 12,
        fontStyle: 'italic',
        marginLeft: 24,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    button: {
        borderRadius: 12,
    },
});
