import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';

interface DiscoveredDeviceCardProps {
    deviceName: string;
    deviceId: string;
    connectionType?: 'wifi';
    onTap: () => void;
    theme: AppTheme;
}

/**
 * Card showing a discovered device
 * Used in Receive tab to show available senders
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const DiscoveredDeviceCard = React.memo<DiscoveredDeviceCardProps>(({
    deviceName,
    deviceId,
    connectionType = 'wifi',
    onTap,
    theme
}) => {
    const getConnectionIcon = (): 'wifi' => 'wifi';
    const getConnectionLabel = () => 'Wi-Fi';

    return (
        <Pressable onPress={onTap} style={styles.container}>
            <View style={[styles.card, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
            }]}>
                {/* Device Icon */}
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons
                        name="cellphone"
                        size={24}
                        color={theme.colors.onPrimaryContainer}
                    />
                </View>

                {/* Device Info */}
                <View style={styles.info}>
                    <Text style={[styles.deviceName, { color: theme.colors.onSurface }]}>
                        {deviceName}
                    </Text>
                    <View style={styles.detailsRow}>
                        <MaterialCommunityIcons
                            name="pound"
                            size={12}
                            color={theme.colors.onSurfaceVariant}
                        />
                        <Text style={[styles.deviceId, { color: theme.colors.onSurfaceVariant }]}>
                            {deviceId}
                        </Text>
                    </View>
                </View>

                {/* Connection Type */}
                <View style={styles.connectionBadge}>
                    <MaterialCommunityIcons
                        name={getConnectionIcon()}
                        size={16}
                        color={theme.colors.primary}
                    />
                    <Text style={[styles.connectionText, { color: theme.colors.primary }]}>
                        {getConnectionLabel()}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
});

DiscoveredDeviceCard.displayName = 'DiscoveredDeviceCard';

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    deviceId: {
        fontSize: 12,
        fontWeight: '500',
    },
    connectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    connectionText: {
        fontSize: 11,
        fontWeight: '500',
    },
});
