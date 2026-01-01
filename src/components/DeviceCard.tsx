import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import type { Device } from '../types/device';
import type { AppTheme } from '../theme/colors';

interface DeviceCardProps {
    device: Device;
    onPress: (device: Device) => void;
    onFavorite?: () => void;
    isFavorite?: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
    device,
    onPress,
    onFavorite,
    isFavorite = false
}) => {
    const theme = useTheme<AppTheme>();

    // Get device type icon (laptop, phone, tablet)
    const getDeviceIcon = (): string => {
        switch (device.deviceType) {
            case 'mobile':
                return 'cellphone';
            case 'desktop':
                return 'laptop';
            case 'server':
                return 'server';
            case 'web':
                return 'web';
            default:
                return 'laptop'; // Default to laptop like official app
        }
    };

    // Generate a consistent hashtag from device fingerprint
    const getHashtag = (): string => {
        // Use last 2 characters of fingerprint for hashtag number
        const fp = device.fingerprint || '00';
        const last2 = fp.slice(-2);
        // Convert to number (hex to dec)
        const num = parseInt(last2, 16) % 100;
        return `#${num.toString().padStart(2, '0')}`;
    };

    // Get OS/Platform name
    const getPlatform = (): string => {
        if (device.deviceModel) {
            if (device.deviceModel.toLowerCase().includes('windows')) return 'Windows';
            if (device.deviceModel.toLowerCase().includes('android')) return 'Android';
            if (device.deviceModel.toLowerCase().includes('ios')) return 'iOS';
            if (device.deviceModel.toLowerCase().includes('mac')) return 'macOS';
            if (device.deviceModel.toLowerCase().includes('linux')) return 'Linux';
        }
        return device.deviceType === 'mobile' ? 'Mobile' : 'Desktop';
    };

    return (
        <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(200)}
            style={styles.container}
        >
            <Pressable
                onPress={() => onPress(device)}
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
                <View style={styles.content}>
                    {/* Device Icon */}
                    <MaterialCommunityIcons
                        name={getDeviceIcon() as any}
                        size={32}
                        color={theme.colors.onSurface}
                        style={styles.deviceIcon}
                    />

                    {/* Device Info */}
                    <View style={styles.info}>
                        <Text style={[styles.deviceName, { color: theme.colors.onSurface }]}>
                            {device.alias}
                        </Text>
                        <View style={styles.tags}>
                            {/* Hashtag Tag */}
                            <View style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Text style={[styles.tagText, { color: theme.colors.onSurfaceVariant }]}>
                                    {getHashtag()}
                                </Text>
                            </View>
                            {/* OS/Platform Tag */}
                            <View style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Text style={[styles.tagText, { color: theme.colors.onSurfaceVariant }]}>
                                    {getPlatform()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Favorite Heart */}
                    {onFavorite && (
                        <Pressable onPress={onFavorite} style={styles.favoriteButton}>
                            <MaterialCommunityIcons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFavorite ? theme.colors.error : theme.colors.onSurfaceVariant}
                            />
                        </Pressable>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 6,
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    deviceIcon: {
        width: 32,
    },
    info: {
        flex: 1,
        gap: 6,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
    },
    tags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    favoriteButton: {
        padding: 4,
    },
});
