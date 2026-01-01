import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';

const deviceIcons = ['laptop', 'cellphone', 'tablet', 'monitor', 'server'] as const;

export function MinimalDeviceLoader() {
    const theme = useTheme<AppTheme>();
    const [currentIcon, setCurrentIcon] = useState<typeof deviceIcons[number]>('laptop');
    const [iconIndex, setIconIndex] = useState(0);

    useEffect(() => {
        // Icon changing animation
        const iconInterval = setInterval(() => {
            setIconIndex((prev) => {
                const next = (prev + 1) % deviceIcons.length;
                setCurrentIcon(deviceIcons[next]);
                return next;
            });
        }, 1500);

        return () => {
            clearInterval(iconInterval);
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name={currentIcon}
                        size={32}
                        color={theme.colors.primary}
                    />
                </View>
                <View style={styles.contentPlaceholder}>
                    <View style={[styles.textLine, { backgroundColor: theme.colors.surface }]} />
                    <View style={[styles.textLineSmall, { backgroundColor: theme.colors.surface }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    iconContainer: {
        width: 32,
    },
    contentPlaceholder: {
        flex: 1,
        gap: 8,
    },
    textLine: {
        height: 16,
        borderRadius: 4,
        width: '60%',
    },
    textLineSmall: {
        height: 12,
        borderRadius: 4,
        width: '40%',
    },
});
