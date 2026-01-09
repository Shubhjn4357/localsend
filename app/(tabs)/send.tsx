import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Buffer } from 'buffer';
import { StyleSheet, View, FlatList, Platform, Pressable } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Text, IconButton, useTheme, FAB } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeviceCard } from '@/components/DeviceCard';
import { SelectionHeader } from '@/components/SelectionHeader';
import { FileTypePickerModal } from '@/components/FileTypePickerModal';
import { MinimalDeviceLoader } from '@/components/MinimalDeviceLoader';
import { TextInputSheet } from '@/components/TextInputSheet';
import { ManualSendingDialog } from '@/components/ManualSendingDialog';
import { ThemedAlert } from '@/components/ThemedAlert';
import { QRScannerModal } from '@/components/QRScannerModal';
import { QRDisplayModal } from '@/components/QRDisplayModal';
import { SelectedFilesModal } from '@/components/SelectedFilesModal';
import { PinInputDialog } from '@/components/PinInputDialog';
import { EnhancedProgressOverlay } from '@/components/EnhancedProgressOverlay';
import { FilePreviewCard } from '@/components/FilePreviewCard';
import { FilePreviewModal } from '@/components/FilePreviewModal';
import { useDeviceStore } from '@/stores/deviceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useActiveTransfersStore } from '@/stores/activeTransfersStore';
import { deviceService } from '@/services/discovery/deviceService';
import { httpDiscoveryService } from '@/services/discovery/httpDiscoveryService';
import { pickerService, type PickedFile } from '@/services/pickerService';
import { transferManager } from '@/services/transferManager';
import { shareViaSystem } from '@/services/nativeShare/systemShare';
import type { Device } from '@/types/device';
import type { AppTheme } from '@/theme/colors';
import type { FileTypeOption } from '@/utils/constants';

export default function SendScreen() {
    const { t } = useTranslation();
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();
    const [selectedFileType, setSelectedFileType] = useState<FileTypeOption>('file');
    const [selectedFiles, setSelectedFiles] = useState<PickedFile[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [showManualSending, setShowManualSending] = useState(false);
    const [showFileTypePicker, setShowFileTypePicker] = useState(false);
    const [showProgressOverlay, setShowProgressOverlay] = useState(false);
    const [previewFile, setPreviewFile] = useState<PickedFile | null>(null);

    const allDevices = useDeviceStore((state) => state.devices);
    const isScanning = useDeviceStore((state) => state.isScanning);
    const setSelectedDevice = useDeviceStore((state) => state.setSelectedDevice);
    const [selectedDevice, setLocalSelectedDevice] = useState<Device | null>(null);

    const favorites = useFavoritesStore((state) => state.favorites);
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    const isFavorite = useFavoritesStore((state) => state.isFavorite);

    const startTransfer = useActiveTransfersStore((state) => state.startTransfer);

    // Filter devices
    const devices = useMemo(() => {
        const online = allDevices.filter((d) => d.isOnline);
        if (showFavoritesOnly) {
            return online.filter((d) => favorites.includes(d.fingerprint));
        }
        return online;
    }, [allDevices, showFavoritesOnly, favorites]);

    const favoriteDevices = useMemo(() => {
        return allDevices.filter((d) => d.isOnline && favorites.includes(d.fingerprint));
    }, [allDevices, favorites]);

    const startDiscovery = useCallback(async () => {
        try {
            console.log('Starting device discovery...');
            await deviceService.startDiscovery();
        } catch (error) {
            console.error('Failed to start device discovery:', error);
            console.error('Failed to start device discovery:', error);
            // We'll use a local state for alerts soon, for now just log
            console.log('Discovery failed');
        }
    }, [t]);

    useEffect(() => {
        startDiscovery();
        return () => {
            deviceService.stopDiscovery();
        };
    }, [startDiscovery]);

    // Handle file type selection and open picker
    const handleFileTypeSelect = useCallback(async (type: FileTypeOption) => {
        setSelectedFileType(type);

        try {
            let files: PickedFile[] = [];

            switch (type) {
                case 'file':
                    files = await pickerService.pickDocument();
                    break;
                case 'media':
                    files = await pickerService.pickMedia();
                    break;
                case 'folder':
                    files = await pickerService.pickFolder();
                    break;
                case 'app':
                    files = await pickerService.pickApp();
                    break;
                case 'text':
                    setShowTextInput(true);
                    return;
            }

            if (files.length > 0) {
                setSelectedFiles(files);
                showAlert(t('common.success'), `Selected ${files.length} file(s)`);
            }
        } catch (error) {
            console.error('Error picking files:', error);
            showAlert(t('common.error'), 'Failed to select files');
        }
    }, [t]);

    const handleTextSubmit = useCallback((text: string) => {
        // Create a virtual file for text
        // Ensure btoa is available or fallback/handle error
        let base64Content = '';
        try {
            if (typeof btoa === 'function') {
                base64Content = btoa(text);
            } else {
                // Buffer fallback for React Native if needed, or simple custom implementation for basic ASCII
                base64Content = Buffer.from(text).toString('base64');
            }
        } catch (e) {
            console.error('Failed to encode text to base64', e);
            // Fallback for extremely basic cases if Buffer/btoa fail?
            // Realistically, modern RN has usage of Buffer or btoa via polyfill.
            // If we are crashing, it might be due to missing globals.
            // We'll rely on global.Buffer if btoa fails.
        }

        const size = new Blob([text]).size; // Modern RN supports Blob
        const textFile: PickedFile = {
            uri: `data:text/plain;base64,${base64Content}`,
            name: `text_${Date.now()}.txt`,
            size: size,
            mimeType: 'text/plain',
        };
        setSelectedFiles([textFile]);
    }, []);

    const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; buttons?: any[] }>({
        visible: false,
        title: '',
        message: ''
    });

    const showAlert = (title: string, message: string, buttons?: any[]) => {
        setAlert({ visible: true, title, message, buttons });
    };

    const hideAlert = () => {
        setAlert(prev => ({ ...prev, visible: false }));
    };

    // Perform the actual file transfer after PIN verification
    const performFileTransfer = useCallback(async (device: Device, pin?: string) => {
        try {
            setShowProgressOverlay(true);

            // Use TransferManager for smart protocol selection
            // Send files
            await transferManager.sendFiles(device, selectedFiles);

            showAlert(t('common.success'), t('send.transferComplete'));
        } catch (error) {
            console.error('Transfer error:', error);
            showAlert(t('common.error'), error instanceof Error ? error.message : t('send.transferFailed'));
        } finally {
            setShowProgressOverlay(false);
        }
    }, [selectedFiles, t]);

    const handleSendFiles = useCallback((device: Device) => {
        if (selectedFiles.length === 0) {
            showAlert(t('send.selectFiles'), t('send.selectFilesFirst'));
            return;
        }

        setLocalSelectedDevice(device);

        // Check if PIN is required in settings
        const requirePin = useSettingsStore.getState().requirePin;

        if (requirePin) {
        // Show PIN dialog
            setShowPinDialog(true);
        } else {
            // Send directly without PIN
            performFileTransfer(device, undefined);
        }
    }, [selectedFiles, t, performFileTransfer]);

    // PIN dialog state and handlers
    const [showPinDialog, setShowPinDialog] = useState(false);

    const handlePinSubmit = useCallback(async (pin: string) => {
        if (!selectedDevice) return;
        await performFileTransfer(selectedDevice, pin);
        setShowPinDialog(false);
    }, [selectedDevice, performFileTransfer]);

    const handlePinClose = useCallback(() => {
        setShowPinDialog(false);
        setSelectedDevice(null);
    }, []);

    const handleRefresh = useCallback(() => {
        deviceService.stopDiscovery().then(() => {
            startDiscovery();
        });
    }, [startDiscovery]);

    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showQRDisplay, setShowQRDisplay] = useState(false);
    const [qrData, setQrData] = useState('');

    // Generate QR data (e.g., device info or IP)
    useEffect(() => {
        const settings = useSettingsStore.getState();
        // Format: localsend:ip:port:alias
        setQrData(`localsend:${settings.serverPort}:${settings.deviceAlias}`);
    }, []);

    const [showSelectedFilesModal, setShowSelectedFilesModal] = useState(false);

    const handleManualConnect = useCallback(async (type: 'hashtag' | 'ip', value: string) => {
        if (type === 'ip') {
            showAlert(t('common.info'), `Connecting to ${value}...`);
            try {
                const device = await httpDiscoveryService.checkDevice(value);
                if (device) {
                    useDeviceStore.getState().addDevice(device);
                    handleSendFiles(device);
                    // Close manual sending dialog
                    setShowManualSending(false);
                } else {
                    showAlert(t('common.error'), `Could not find device at ${value}`);
                }
            } catch (e) {
                console.error(e);
                showAlert(t('common.error'), `Connection failed: ${e}`);
            }
        } else {
            showAlert(t('common.info'), 'Hashtag connection requires multicast which might not be reliable manually. Please try IP.');
        }
    }, [t, handleSendFiles, setShowManualSending]);

    const handleEditSelection = () => setShowSelectedFilesModal(true);

    const handleRemoveFile = (fileToRemove: PickedFile) => {
        setSelectedFiles(prev => prev.filter(f => f.uri !== fileToRemove.uri));
        if (selectedFiles.length <= 1) {
            setShowSelectedFilesModal(false);
        }
    };

    const handleRemoveAll = () => {
        setSelectedFiles([]);
        setShowSelectedFilesModal(false);
    };

    const handleQRScan = useCallback((data: string) => {
        // Handle scanned data (e.g., connect to IP or start transfer)
        console.log('Scanned QR code:', data);
        handleManualConnect('ip', data); // Assuming QR code contains IP for now
    }, [handleManualConnect]);

    const renderDeviceItem = ({ item }: any) => (
        <DeviceCard
            device={item}
            onPress={() => handleSendFiles(item)}
            onFavorite={() => toggleFavorite(item.fingerprint)}
            isFavorite={isFavorite(item.fingerprint)}
        />
    );

    const renderEmpty = () => (
        <Animated.View entering={FadeIn} style={styles.emptyContainer}>
            <MaterialCommunityIcons
                name="devices"
                size={80}
                color={theme.colors.outline}
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
                {isScanning ? t('send.scanning') : t('send.noDevices')}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                {Platform.OS === 'web'
                    ? t('send.webNotSupported')
                    : t('send.networkHint')}
            </Text>
        </Animated.View>
    );

    const handleShowFileTypePicker = () => setShowFileTypePicker(true);
    const handleShowQR = () => {
        setShowQRDisplay(true);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
            {selectedFiles.length > 0 ? (
                <SelectionHeader
                    fileCount={selectedFiles.length}
                    totalSize={selectedFiles.reduce((acc, file) => acc + file.size, 0)}
                    onClose={() => setSelectedFiles([])}
                    onEdit={handleEditSelection}
                    onAdd={handleShowFileTypePicker}
                    filePreview={
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {selectedFiles.slice(0, 3).map((file, i) => (
                                <View
                                    key={i}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        backgroundColor: theme.colors.surfaceVariant,
                                        borderRadius: 8,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="file"
                                        size={24}
                                        color={theme.colors.onSurfaceVariant}
                                    />
                                </View>
                            ))}
                        </View>
                    }
                    onShowQR={handleShowQR}
                />
            ) : (
                /* Nearby Devices Section with Icon Actions */
                <View style={[styles.devicesHeader, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.devicesTitle, { color: theme.colors.onSurface }]}>
                        Nearby devices
                    </Text>
                    <View style={styles.iconActions}>
                        <IconButton
                            icon="refresh"
                            size={24}
                            iconColor={theme.colors.onSurface}
                            onPress={handleRefresh}
                        />
                        <IconButton
                            icon="qrcode-scan"
                            size={24}
                            iconColor={theme.colors.onSurface}
                            onPress={() => setShowQRScanner(true)}
                        />
                            <IconButton
                                icon={showFavoritesOnly ? 'heart' : 'heart-outline'}
                                size={24}
                                iconColor={theme.colors.onSurface}
                                onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            />
                            <IconButton
                                icon="cog"
                                size={24}
                                iconColor={theme.colors.onSurface}
                                onPress={() => router.push('/settings')}
                            />
                        </View>
                    </View>
            )}

            {/* Manual Sending Button (if no favorites filter) */}
            {
                !showFavoritesOnly && (
                    <Pressable
                        style={[styles.manualButton, { backgroundColor: theme.colors.surfaceVariant }]}
                        onPress={() => setShowManualSending(true)}
                >
                        <Text style={[styles.manualButtonText, { color: theme.colors.onSurface }]}>
                            Manual Sending
                        </Text>
                    </Pressable>
                )
            }

            {/* Devices List */}
            {isScanning && devices.length === 0 ? (
                <MinimalDeviceLoader />
            ) : (
                <FlatList
                    data={devices}
                    renderItem={renderDeviceItem}
                    keyExtractor={(item) => item.fingerprint}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={
                        devices.length === 0 ? styles.emptyListContent : styles.listContent
                    }
                />
            )}

            {/* Troubleshoot Link */}
            <Pressable
                style={styles.troubleshoot}
                onPress={() => showAlert('Troubleshoot', 'Troubleshooting help issues')}
            >
                <Text style={[styles.troubleshootText, { color: theme.colors.outline }]}>
                    Troubleshoot
                </Text>
            </Pressable>

            {/* Add Files FAB */}
            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color={theme.colors.onPrimary}
                onPress={() => setShowFileTypePicker(true)}
                label={selectedFiles.length === 0 ? "Add" : undefined}
            />

            {/* File Type Picker Modal */}
            <FileTypePickerModal
                visible={showFileTypePicker}
                onClose={() => setShowFileTypePicker(false)}
                onTypeSelect={handleFileTypeSelect}
            />

            {/* Text Input Sheet */}
            <TextInputSheet
                visible={showTextInput}
                onClose={() => setShowTextInput(false)}
                onSubmit={handleTextSubmit}
            />

            {/* Manual Sending Dialog */}
            <ManualSendingDialog
                visible={showManualSending}
                onClose={() => setShowManualSending(false)}
                onConnect={handleManualConnect}
            />

            <ThemedAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                onDismiss={hideAlert}
                buttons={alert.buttons}
            />

            <QRScannerModal
                visible={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
            />

            <QRDisplayModal
                visible={showQRDisplay}
                onClose={() => setShowQRDisplay(false)}
                data={qrData}
            />

            <SelectedFilesModal
                visible={showSelectedFilesModal}
                onClose={() => setShowSelectedFilesModal(false)}
                files={selectedFiles}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAll}
            />

            {/* PIN Input Dialog */}
            <PinInputDialog
                visible={showPinDialog}
                onClose={handlePinClose}
                onSubmit={handlePinSubmit}
                deviceName={selectedDevice?.alias || ''}
            />

            {/* Enhanced Progress Overlay */}
            <EnhancedProgressOverlay
                visible={showProgressOverlay}
                onClose={() => setShowProgressOverlay(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    devicesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    devicesTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    iconActions: {
        flexDirection: 'row',
        gap: 4,
    },
    manualButton: {
        marginHorizontal: 16,
        marginVertical: 8,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    manualButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    troubleshoot: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    troubleshootText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 140,
    },
    emptyListContent: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: '600',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
    selectedFilesContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    selectedFilesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
});
