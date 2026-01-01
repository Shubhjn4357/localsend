import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, ProgressBar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';

interface TransferProgressProps {
    fileName: string;
    progress: number; // 0-1
    bytesTransferred: number;
    totalBytes: number;
    status: 'sending' | 'receiving' | 'completed' | 'failed';
    estimatedTimeRemaining?: number; // in seconds
}

export const LiveTransferProgress: React.FC<TransferProgressProps> = ({
    fileName,
    progress,
    bytesTransferred,
    totalBytes,
    status,
    estimatedTimeRemaining,
}) => {
    const theme = useTheme<AppTheme>();

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'sending':
                return 'upload';
            case 'receiving':
                return 'download';
            case 'completed':
                return 'check-circle';
            case 'failed':
                return 'alert-circle';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'completed':
                return theme.colors.primary;
            case 'failed':
                return theme.colors.error;
            default:
                return theme.colors.secondary;
        }
    };

    const percentage = Math.round(progress * 100);
    const isActive = status === 'sending' || status === 'receiving';

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}
        >
            {/* Header */}
            <View style={styles.header}>
                <MaterialCommunityIcons
                    name={getStatusIcon() as any}
                    size={24}
                    color={getStatusColor()}
                />
                <View style={styles.headerText}>
                    <Text
                        style={[styles.fileName, { color: theme.colors.onSurface }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {fileName}
                    </Text>
                    <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                </View>
                <Text style={[styles.percentage, { color: theme.colors.primary }]}>
                    {percentage}%
                </Text>
            </View>

            {/* Progress Bar */}
            <ProgressBar
                progress={progress}
                color={getStatusColor()}
                style={styles.progressBar}
            />

            {/* Details */}
            <View style={styles.details}>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons
                        name="file-download-outline"
                        size={16}
                        color={theme.colors.onSurfaceVariant}
                    />
                    <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                        {formatBytes(bytesTransferred)} / {formatBytes(totalBytes)}
                    </Text>
                </View>

                {isActive && estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                            name="clock-outline"
                            size={16}
                            color={theme.colors.onSurfaceVariant}
                        />
                        <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                            {formatTime(estimatedTimeRemaining)} remaining
                        </Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    headerText: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    statusText: {
        fontSize: 12,
        textTransform: 'capitalize',
    },
    percentage: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 12,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
    },
});
