import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, ProgressBar, useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GlassCard } from './ui/GlassCard';
import type { AppTheme } from '../theme/colors';
import { formatFileSize, formatTransferSpeed } from '../utils/file';

interface TransferProgressProps {
    fileName: string;
    progress: number;
    transferredSize: number;
    totalSize: number;
    speed: number;
}

export const TransferProgress: React.FC<TransferProgressProps> = ({
    fileName,
    progress,
    transferredSize,
    totalSize,
    speed,
}) => {
    const theme = useTheme<AppTheme>();

    return (
        <Animated.View entering={FadeIn} style={styles.container}>
            <GlassCard>
                <View style={styles.content}>
                    <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: '500' }}>
                        {fileName}
                    </Text>

                    <View style={styles.progressContainer}>
                        <ProgressBar
                            progress={progress / 100}
                            color={theme.colors.primary}
                            style={styles.progressBar}
                        />
                        <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, fontSize: 12 }}>
                            {Math.round(progress)}% • {formatFileSize(transferredSize)} / {formatFileSize(totalSize)}
                        </Text>
                        {speed > 0 && (
                            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                                {formatTransferSpeed(speed)}
                            </Text>
                        )}
                    </View>
                </View>
            </GlassCard>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    content: {
        padding: 16,
    },
    progressContainer: {
        marginTop: 12,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
});
