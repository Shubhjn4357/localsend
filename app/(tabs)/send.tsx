import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, Platform, Pressable, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Text, IconButton, useTheme, Chip, FAB, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DeviceCard } from '@/components/DeviceCard';
import { FileTypePicker } from '@/components/FileTypePicker';
import { DeviceSkeletonLoader } from '@/components/DeviceSkeletonLoader';
import { TextInputSheet } from '@/components/TextInputSheet';
import { ManualSendingDialog } from '@/components/ManualSendingDialog';
import { useDeviceStore } from '@/stores/deviceStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useActiveTransfersStore } from '@/stores/activeTransfersStore';
import { deviceService } from '@/services/discovery/deviceService';
import { pickerService, type PickedFile } from '@/services/pickerService';
import type { AppTheme } from '@/theme/colors';
import type { FileTypeOption } from '@/utils/constants';

export default function SendScreen() {
    const { t } = useTranslation();
    const theme = useTheme<AppTheme>();
    const [selectedFileType, setSelectedFileType] = useState<FileTypeOption>('file');
    const [selectedFiles, setSelectedFiles] = useState<PickedFile[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [showManualSending, setShowManualSending] = useState(false);

    const allDevices = useDeviceStore((state) => state.devices);
    const isScanning = useDeviceStore((state) => state.isScanning);
    const setSelectedDevice = useDeviceStore((state) => state.setSelectedDevice);

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
        if (Platform.OS === 'web') {
            console.log('Device discovery not supported on web platform');
            return;
        }
        try {
            await deviceService.startDiscovery();
        } catch (error) {
            console.error('Failed to start device discovery:', error);
        }
    }, []);

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
                    // Show text input sheet OR paste directly
                    const clipboardText = await Clipboard.getString();
                    if (clipboardText && clipboardText.trim()) {
                        // Ask user: paste or type
                        Alert.alert(
                            'Send Text',
                            'Clipboard has text. What would you like to do?',
                            [
                                {
                                    text: 'Paste',
                                    onPress: () => handleTextSubmit(clipboardText)
                                },
                                {
                                    text: 'Type New',
                                    onPress: () => setShowTextInput(true)
                                },
                                {
                                    text: 'Cancel',
                                    style: 'cancel'
                                }
                            ]
                        );
                    } else {
                        setShowTextInput(true);
                    }
                    return;
            }

            if (files.length > 0) {
                setSelectedFiles(files);
                Alert.alert(t('common.success'), `Selected ${files.length} file(s)`);
            }
        } catch (error) {
            console.error('Error picking files:', error);
            Alert.alert(t('common.error'), 'Failed to select files');
        }
    }, [t]);

    const handleTextSubmit = useCallback((text: string) => {
        // Create a virtual file for text
        const textFile: PickedFile = {
            uri: `data:text/plain;base64,${btoa(text)}`,
            name: `text_${Date.now()}.txt`,
            size: new Blob([text]).size,
            mimeType: 'text/plain',
        };
        setSelectedFiles([textFile]);
    }, []);

    const handleDevicePress = useCallback((device: any) => {
        if (selectedFiles.length === 0) {
            Alert.alert(t('send.selectFiles'), t('send.selectFilesFirst'));
            return;
        }

        setSelectedDevice(device);

        // Start transfer
        selectedFiles.forEach((file) => {
            const transferId = `${Date.now()}_${Math.random()}`;
            startTransfer({
                id: transferId,
                fileName: file.name,
                fileSize: file.size,
                status: 'sending',
                deviceName: device.alias,
                deviceId: device.fingerprint,
            });
        });

        Alert.alert(t('common.success'), `Starting transfer to ${device.alias}`);
        setSelectedFiles([]);
    }, [selectedFiles, setSelectedDevice, startTransfer, t]);

    const handleRefresh = useCallback(() => {
        deviceService.stopDiscovery().then(() => {
            startDiscovery();
        });
    }, [startDiscovery]);

    const handleManualConnect = useCallback((type: 'hashtag' | 'ip', value: string) => {
        // TODO: Implement manual device connection
        console.log(`Manual connect via ${type}:`, value);
        Alert.alert(t('common.success'), `Attempting to connect via ${type}: ${value}`);
    }, [t]);

    const renderDeviceItem = ({ item }: any) => (
        <DeviceCard
            device={item}
            onPress={handleDevicePress}
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

            {/* File Type Picker */}
            <FileTypePicker
                selectedType={selectedFileType}
                onTypeSelect={handleFileTypeSelect}
            />

            {selectedFiles.length > 0 && (
                <View style={[styles.selectedFilesContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons name="file-multiple" size={20} color={theme.colors.primary} />
                    <Text style={[styles.selectedFilesText, { color: theme.colors.primary }]}>
                        {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
                    </Text>
                    <IconButton
                        icon="close"
                        size={16}
                        onPress={() => setSelectedFiles([])}
                        iconColor={theme.colors.primary}
                    />
                </View>
            )}

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <Chip
                    selected={showFavoritesOnly}
                    onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    icon="star"
                    style={{ backgroundColor: showFavoritesOnly ? theme.colors.primary : theme.colors.surfaceVariant }}
                    textStyle={{ color: showFavoritesOnly ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}
                >
                    {t('send.favorites')} {favoriteDevices.length > 0 && `(${favoriteDevices.length})`}
                </Chip>
                <Chip
                    onPress={() => setShowManualSending(true)}
                    icon="plus-circle"
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                >
                    {t('send.manualSending')}
                </Chip>
            </View>

            {/* Devices List */}
            {isScanning && devices.length === 0 ? (
                <DeviceSkeletonLoader count={3} />
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

            {/* Refresh FAB */}
            <FAB
                icon={isScanning ? 'loading' : 'refresh'}
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={handleRefresh}
                loading={isScanning}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    selectedFilesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        gap: 8,
    },
    selectedFilesText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 8,
    },
    listContent: {
        paddingBottom: 100,
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
        right: 16,
        bottom: 16,
    },
});
