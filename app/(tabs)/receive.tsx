import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Switch, Chip, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CurlySpinner } from '@/components/CurlySpinner';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import type { AppTheme } from '@/theme/colors';

export default function ReceiveScreen() {
    const { t } = useTranslation();
    const theme = useTheme<AppTheme>();
    const [showDeviceInfo, setShowDeviceInfo] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const deviceName = useSettingsStore((state) => state.deviceName);
    const deviceId = useSettingsStore((state) => state.deviceId);
    const quickSaveEnabled = useSettingsStore((state) => state.quickSaveEnabled);
    const setQuickSaveEnabled = useSettingsStore((state) => state.setQuickSaveEnabled);
    const serverRunning = useSettingsStore((state) => state.serverRunning);
    const setServerRunning = useSettingsStore((state) => state.setServerRunning);
    const serverPort = useSettingsStore((state) => state.serverPort);

    // Load settings on mount
    useEffect(() => {
        useSettingsStore.getState().loadSettings();
        useFavoritesStore.getState().loadFavorites();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={
                    theme.dark
                        ? ['#0F172A', '#1E293B', '#334155']
                        : ['#F8FAFC', '#E0E7FF', '#FCE7F3']
                }
                style={StyleSheet.absoluteFill}
            />

            {/* Main Content */}
            <View style={styles.content}>
                {/* Center Spinner Animation */}
                <Animated.View entering={FadeIn} style={styles.spinnerContainer}>
                    <CurlySpinner size={120} color={theme.colors.primary} />
                </Animated.View>

                {/* Device Name */}
                <Animated.View entering={FadeIn.delay(200)} style={styles.deviceInfoContainer}>
                    <Text style={[styles.deviceName, { color: theme.colors.onSurface }]}>
                        {deviceName}
                    </Text>
                    <Pressable
                        onPress={() => setShowDeviceInfo(!showDeviceInfo)}
                        style={styles.idContainer}
                    >
                        <MaterialCommunityIcons
                            name="identifier"
                            size={16}
                            color={theme.colors.onSurfaceVariant}
                        />
                        <Text style={[styles.deviceId, { color: theme.colors.onSurfaceVariant }]}>
                            {deviceId}
                        </Text>
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={16}
                            color={theme.colors.primary}
                        />
                    </Pressable>
                </Animated.View>

                {/* Device Info (when pressed) */}
                {showDeviceInfo && (
                    <Animated.View
                        entering={FadeIn}
                        style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}
                    >
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="devices" size={20} color={theme.colors.onSurfaceVariant} />
                            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                                {t('receive.deviceName')}:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                                {deviceName}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="ip-network" size={20} color={theme.colors.onSurfaceVariant} />
                            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                                {t('receive.port')}:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                                {serverPort}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name={serverRunning ? 'check-circle' : 'close-circle'}
                                size={20}
                                color={serverRunning ? theme.colors.primary : theme.colors.error}
                            />
                            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                                {t('receive.status')}:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                                {serverRunning ? t('receive.running') : t('receive.stopped')}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* QuickSave Toggle */}
                <Animated.View entering={FadeIn.delay(400)} style={styles.quickSaveContainer}>
                    <View style={[styles.quickSaveCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <View style={styles.quickSaveContent}>
                            <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.primary} />
                            <View style={styles.quickSaveText}>
                                <Text style={[styles.quickSaveTitle, { color: theme.colors.onSurface }]}>
                                    {t('receive.quickSave')}
                                </Text>
                                <Text style={[styles.quickSaveSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                                    {t('receive.quickSaveDesc')}
                                </Text>
                            </View>
                            <Switch
                                value={quickSaveEnabled}
                                onValueChange={setQuickSaveEnabled}
                                color={theme.colors.primary}
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Server Toggle */}
                <Animated.View entering={FadeIn.delay(500)} style={styles.quickSaveContainer}>
                    <View style={[styles.quickSaveCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <View style={styles.quickSaveContent}>
                            <MaterialCommunityIcons name="server" size={24} color={theme.colors.primary} />
                            <View style={styles.quickSaveText}>
                                <Text style={[styles.quickSaveTitle, { color: theme.colors.onSurface }]}>
                                    {t('settings.server')}
                                </Text>
                                <Text style={[styles.quickSaveSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                                    {serverRunning ? t('receive.running') : t('receive.stopped')}
                                </Text>
                            </View>
                            <Switch
                                value={serverRunning}
                                onValueChange={setServerRunning}
                                color={theme.colors.primary}
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Favorites Filter */}
                {quickSaveEnabled && (
                    <Animated.View entering={FadeIn} style={styles.favoritesContainer}>
                        <Chip
                            selected={showFavoritesOnly}
                            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            icon="star"
                            style={{
                                backgroundColor: showFavoritesOnly ? theme.colors.primary : theme.colors.surfaceVariant,
                            }}
                            textStyle={{
                                color: showFavoritesOnly ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                            }}
                        >
                            {showFavoritesOnly ? 'Favorites Only' : 'All Devices'}
                        </Chip>
                    </Animated.View>
                )}

                {/* Status */}
                <Animated.View entering={FadeIn.delay(600)} style={styles.statusContainer}>
                    <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('receive.waiting')}
                    </Text>
                    <Text style={[styles.statusSubtext, { color: theme.colors.outline }]}>
                        {serverRunning
                            ? t('receive.ready')
                            : t('receive.serverStopped')}
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    spinnerContainer: {
        marginBottom: 32,
    },
    deviceInfoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    deviceName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    deviceId: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    infoCard: {
        width: '100%',
        borderRadius: 16,
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
        fontWeight: '500',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    quickSaveContainer: {
        width: '100%',
        marginBottom: 16,
    },
    quickSaveCard: {
        borderRadius: 16,
        padding: 16,
    },
    quickSaveContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quickSaveText: {
        flex: 1,
    },
    quickSaveTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    quickSaveSubtitle: {
        fontSize: 12,
    },
    favoritesContainer: {
        marginBottom: 16,
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    statusSubtext: {
        fontSize: 12,
        textAlign: 'center',
    },
});
