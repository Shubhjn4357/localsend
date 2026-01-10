import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Switch, Chip, useTheme, IconButton } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNetworkInfo } from '@/utils/network';
import { CurlySpinner } from '@/components/CurlySpinner';
import { QRScannerModal } from '@/components/QRScannerModal';
import { QRDisplayModal } from '@/components/QRDisplayModal';
import { TransferRequestDialog } from '@/components/TransferRequestDialog';
import { DiscoveredDeviceCard } from '@/components/DiscoveredDeviceCard';
import { ManualSendingDialog } from '@/components/ManualSendingDialog';
import { DeviceDetailsDialog } from '@/components/DeviceDetailsDialog';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { useTransferStore } from '@/stores/transferStore';
import type { AppTheme } from '@/theme/colors';
import type { Device } from '@/types/device';
import { httpServer } from '@/services/httpServer';
import { transferEvents } from '@/services/transferEvents';
import { deviceService } from '@/services/discovery/deviceService';
import { httpDiscoveryService } from '@/services/discovery/httpDiscoveryService';
import { reverseProxyService } from '@/services/network/reverseProxyService';
import type { TransferRequest } from '@/types/transfer';

export default function ReceiveScreen() {
    const { t } = useTranslation();
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();
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

        // Load IP address immediately
        getNetworkInfo().then(info => setIpAddress(info.ipAddress));
    }, []);

    // QR and Transfer request state
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showQRDisplay, setShowQRDisplay] = useState(false);
    const [qrData, setQrData] = useState('');
    const [showManualConnection, setShowManualConnection] = useState(false);

    // Device details state
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [showDeviceDetails, setShowDeviceDetails] = useState(false);

    // Transfer request state (now from store)
    const incomingRequest = useTransferStore((state) => state.incomingRequest);

    // Network state
    const [ipAddress, setIpAddress] = useState<string>('...');
    const [networkSSID, setNetworkSSID] = useState<string | null>(null);

    // Device store for showing discovered senders
    const allDevices = useDeviceStore((state) => state.devices);
    const isScanning = useDeviceStore((state) => state.isScanning);

    // Start/stop HTTP server based on serverRunning state
    useEffect(() => {
        const init = async () => {
            if (serverRunning) {
                // Start HTTP server for receiving files
                const started = await httpServer.start();
                if (started) {
                    // Start Reverse Proxy for HTTPS
                    try {
                        const { reverseProxyService } = require('@/services/network/reverseProxyService');
                        await reverseProxyService.start();
                        console.log('Secure Reverse Proxy started');
                    } catch (e) {
                        console.warn('Failed to start reverse proxy:', e);
                    }
                } else {
                    console.error('Failed to start HTTP server');
                    setServerRunning(false);
                }
            } else {
                // Stop HTTP server
                try {
                    const { reverseProxyService } = require('@/services/network/reverseProxyService');
                    reverseProxyService.stop();
                    await httpServer.stop();
                } catch (error) {
                    console.error('Error stopping server:', error);
                }
            }
        };

        init();

        // Cleanup: stop server when component unmounts
        return () => {
            if (serverRunning) {
                httpServer.stop();
            }
        };
    }, [serverRunning]);

    // Load settings and start discovery on mount
    useEffect(() => {
        useSettingsStore.getState().loadSettings();
        useFavoritesStore.getState().loadFavorites();

        // Auto-start device discovery for Receive tab
        deviceService.startDiscovery().catch((error) => {
            console.error('Failed to start auto-discovery:', error);
        });

        return () => {
            // Stop discovery when tab unmounts
            deviceService.stopDiscovery();
        };
    }, []);

    // Listen for incoming transfer requests (handled by store now)
    // Legacy event listener removed in favor of store observation



    const handleShowQR = useCallback(async () => {
        const info = await getNetworkInfo();
        const data = `localsend:${serverPort}:${deviceName}:${info.ipAddress}`;
        setQrData(data);
        setShowQRDisplay(true);
    }, [serverPort, deviceName]);

    const handleQRScan = useCallback((data: string) => {
        console.log('Scanned from Receive:', data);
        setShowQRScanner(false);
        // Parse and handle QR data
    }, []);

    const handleAcceptTransfer = useCallback(() => {
        if (incomingRequest) {
            httpServer.acceptTransfer(incomingRequest.sessionId);
        }
    }, [incomingRequest]);

    const handleRejectTransfer = useCallback(() => {
        if (incomingRequest) {
            httpServer.rejectTransfer(incomingRequest.sessionId);
        }
    }, [incomingRequest]);

    const handleRefreshDiscovery = useCallback(async () => {
        console.log('Refreshing device discovery...');
        await deviceService.stopDiscovery();
        await deviceService.startDiscovery();
    }, []);

    const handleManualConnect = useCallback(async (type: 'key' | 'hashtag' | 'ip', value: string) => {
        if (type === 'ip') {
            // Assuming showAlert is defined elsewhere or needs to be added
            // For now, using console.log as a placeholder for showAlert
            console.log(t('common.info'), `Connecting to ${value}...`);
            try {
                const device = await httpDiscoveryService.checkDevice(value);
                if (device) {
                    useDeviceStore.getState().addDevice(device);
                    console.log(`Successfully connected to device at ${value}`);
                    setShowManualConnection(false);
                } else {
                    console.error(`Could not find device at ${value}`);
                }
            } catch (e) {
                console.error('Manual connection failed:', e);
            }
        } else {
            console.log('Hashtag connection requires multicast discovery');
            // Hashtag connections use multicast, which is handled by auto-discovery
        }
    }, []);

    // Memoize filtered devices
    const discoveredDevices = useMemo(() => {
        return allDevices.filter(device => device.isOnline);
    }, [allDevices]);

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.surfaceVariant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            {/* Main Content */}
            <View style={styles.content}>

                {/* Header Actions */}
                <View style={styles.headerActions}>
                    <IconButton
                        icon="qrcode"
                        size={24}
                        iconColor={theme.colors.onSurface}
                        style={styles.scanButton}
                        onPress={handleShowQR}
                    />
                    <IconButton
                        icon="qrcode-scan"
                        size={24}
                        iconColor={theme.colors.onSurface}
                        style={styles.scanButton}
                        onPress={() => setShowQRScanner(true)}
                    />
                    <IconButton
                        icon="reload"
                        size={24}
                        iconColor={theme.colors.primary}
                        style={styles.scanButton}
                        onPress={handleRefreshDiscovery}
                        disabled={isScanning}
                    />
                </View>

                {/* Center Spinner Animation */}
                {/* <Animated.View entering={FadeIn} style={styles.spinnerContainer}>
                    <CurlySpinner size={120} color={theme.colors.primary} />
                </Animated.View> */}

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
                                {t('receive.ipAddress')}:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                                {ipAddress}
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

                        {/* Manual Connection Button */}
                        <Pressable
                            style={[styles.manualConnectButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => setShowManualConnection(true)}
                        >
                            <MaterialCommunityIcons name="ip-network-outline" size={20} color={theme.colors.onPrimary} />
                            <Text style={[styles.manualConnectText, { color: theme.colors.onPrimary }]}>
                                Manual Connection
                            </Text>
                        </Pressable>
                    </Animated.View>
                )}

                {/* Discovered Devices Section */}
                {allDevices.length > 0 && (
                    <Animated.View entering={FadeIn} style={styles.discoveredSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons
                                name="radar"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                                Available Senders ({allDevices.length})
                            </Text>
                            {isScanning && (
                                <CurlySpinner size={16} color={theme.colors.primary} />
                            )}
                        </View>

                        {allDevices.map((device) => {
                            const connectionType = device.connectionType === 'wifi-direct' ? 'nearby' : (device.connectionType || 'wifi');
                            return (
                                <DiscoveredDeviceCard
                                    key={device.fingerprint}
                                    deviceName={device.alias}
                                    deviceId={`#${device.fingerprint}`}
                                    connectionType={connectionType as 'bluetooth' | 'wifi' | 'nearby'}
                                    onTap={() => {
                                        console.log('Tapped device:', device.alias);
                                        // Show device details dialog
                                        setSelectedDevice(device);
                                        setShowDeviceDetails(true);
                                    }}
                                    theme={theme}
                                />
                            );
                        })}
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

            <QRScannerModal
                visible={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
            />

            <QRDisplayModal
                visible={showQRDisplay}
                onClose={() => setShowQRDisplay(false)}
                data={qrData}
                title="Your Device"
                instruction="Ask the sender to scan this QR code to connect to your device."
            />

            {/* Manual Connection Dialog */}
            <ManualSendingDialog
                visible={showManualConnection}
                onClose={() => setShowManualConnection(false)}
                onConnect={handleManualConnect}
            />

            {/* Transfer Request Dialog */}
            <TransferRequestDialog
                visible={!!incomingRequest}
                onAccept={handleAcceptTransfer}
                onReject={handleRejectTransfer}
                request={incomingRequest ? {
                    info: incomingRequest.sender,
                    files: incomingRequest.files.reduce((acc, file) => ({
                        ...acc,
                        [file.id]: {
                            id: file.id,
                            fileName: file.fileName,
                            size: file.size,
                            fileType: file.fileType,
                            preview: file.preview
                        }
                    }), {})
                } as any : null}
            />

            {/* Device Details Dialog */}
            <DeviceDetailsDialog
                visible={showDeviceDetails}
                device={selectedDevice}
                onDismiss={() => setShowDeviceDetails(false)}
                ipAddress={ipAddress}
                networkSSID={networkSSID || undefined}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerActions: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        flexDirection: 'row',
        gap: 8,
    },
    scanButton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        margin: 0,
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
    discoveredSection: {
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 12,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '500',
    },
    emptyStateHint: {
        fontSize: 14,
        textAlign: 'center',
    },
    manualConnectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    manualConnectText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
