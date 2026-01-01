import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LiveTransferProgress } from './LiveTransferProgress';
import { useActiveTransfersStore } from '@/stores/activeTransfersStore';
import type { AppTheme } from '@/theme/colors';

export const ActiveTransfersOverlay: React.FC = () => {
    const theme = useTheme<AppTheme>();
    const transfers = useActiveTransfersStore((state) => state.transfers);
    const clearCompleted = useActiveTransfersStore((state) => state.clearCompleted);

    const activeTransfers = transfers.filter(
        (t) => t.status === 'sending' || t.status === 'receiving'
    );
    const hasCompleted = transfers.some(
        (t) => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled'
    );

    if (transfers.length === 0) return null;

    return (
        <Animated.View entering={FadeIn} style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons
                        name="swap-horizontal"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
                        Transfers
                    </Text>
                    {activeTransfers.length > 0 && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>
                                {activeTransfers.length}
                            </Text>
                        </View>
                    )}
                </View>
                {hasCompleted && (
                    <IconButton
                        icon="delete-sweep"
                        size={20}
                        onPress={clearCompleted}
                        iconColor={theme.colors.onSurfaceVariant}
                    />
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {transfers.map((transfer) => (
                    <LiveTransferProgress
                        key={transfer.id}
                        fileName={transfer.fileName}
                        progress={transfer.progress}
                        bytesTransferred={transfer.bytesTransferred}
                        totalBytes={transfer.fileSize}
                        status={transfer.status as any}
                        estimatedTimeRemaining={transfer.estimatedTimeRemaining}
                    />
                ))}
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 80, // Above tab bar
        left: 0,
        right: 0,
        maxHeight: 300,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        minWidth: 24,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollView: {
        maxHeight: 250,
    },
    scrollContent: {
        paddingBottom: 8,
    },
});
