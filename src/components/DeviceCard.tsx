import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    FadeInRight,
    FadeOutLeft,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { GlassCard } from './ui/GlassCard';
import type { Device } from '../types/device';
import type { AppTheme } from '../theme/colors';

interface DeviceCardProps {
    device: Device;
    onPress: (device: Device) => void;
    onFavorite?: () => void;
    isFavorite?: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onPress, onFavorite, isFavorite = false }) => {
    const theme = useTheme<AppTheme>();
    const pulseScale = useSharedValue(1);

    // Pulse animation for online devices
    React.useEffect(() => {
        if (device.isOnline) {
            pulseScale.value = withSequence(
                withTiming(1.2, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            );
        }
    }, [device.isOnline]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const getDeviceIcon = (): string => {
        switch (device.deviceType) {
            case 'mobile':
                return 'cellphone';
            case 'desktop':
                return 'monitor';
            case 'server':
                return 'server';
            case 'web':
                return 'web';
            default:
                return 'devices';
        }
    };

    return (
        <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(200)}
            style={styles.container}
        >
            <Pressable onPress={() => onPress(device)}>
                <GlassCard>
                    <View style={styles.content}>
                        {/* Device Icon */}
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: theme.colors.primaryContainer },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={getDeviceIcon() as any}
                                size={32}
                                color={theme.colors.primary}
                            />
                        </View>

                        {/* Device Info */}
                        <View style={styles.info}>
                            <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: '500' }}>
                                {device.alias}
                            </Text>
                            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                                {device.ipAddress}
                            </Text>
                            {device.deviceModel && (
                                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                                    {device.deviceModel}
                                </Text>
                            )}
                        </View>

                        {/* Favorite Button */}
                        {onFavorite && (
                            <Pressable onPress={onFavorite} style={styles.favoriteButton}>
                                <MaterialCommunityIcons
                                    name={isFavorite ? 'star' : 'star-outline'}
                                    size={24}
                                    color={isFavorite ? theme.colors.primary : theme.colors.onSurfaceVariant}
                                />
                            </Pressable>
                        )}

                        {/* Online Status */}
                        <Animated.View style={pulseStyle}>
                            <MaterialCommunityIcons
                                name="circle"
                                size={12}
                                color={device.isOnline ? theme.colors.secondary : theme.colors.outline}
                            />
                        </Animated.View>
                    </View>
                </GlassCard>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    favoriteButton: {
        padding: 8,
        marginRight: 8,
    },
});
