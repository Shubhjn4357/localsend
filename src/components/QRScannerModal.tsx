import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, IconButton, useTheme, Button, Portal, Modal } from 'react-native-paper';
// Safe import for Expo Camera
let CameraView: any = null;
let useCameraPermissions: any = () => [{ granted: false, status: 'undetermined' }, async () => ({ granted: false })];

try {
    const ExpoCamera = require('expo-camera');
    CameraView = ExpoCamera.CameraView;
    useCameraPermissions = ExpoCamera.useCameraPermissions;
} catch (e) {
    console.warn('Expo Camera not available:', e);
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';

interface QRScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

export function QRScannerModal({ visible, onClose, onScan }: QRScannerModalProps) {
    const theme = useTheme<AppTheme>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible) {
            setScanned(false);
            if (!permission?.granted) {
                requestPermission();
            }
        }
    }, [visible, permission]);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        onScan(data);
        onClose();
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <Portal>
                <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.permissionContainer, { backgroundColor: theme.colors.surface }]}>
                    <Text style={{ color: theme.colors.onSurface, marginBottom: 20 }}>
                        We need your permission to show the camera
                    </Text>
                    <Button onPress={requestPermission} mode="contained">
                        Grant Permission
                    </Button>
                    <Button onPress={onClose} style={{ marginTop: 10 }}>
                        Cancel
                    </Button>
                </Modal>
            </Portal>
        );
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.modalContent}
            >
                <View style={styles.container}>
                    {CameraView ? (
                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                        />
                    ) : (
                        <View style={[styles.container, { backgroundColor: 'black' }]}>
                            <Text style={{ color: 'white' }}>Camera module not available</Text>
                        </View>
                    )}

                    <View style={styles.overlay}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Scan QR Code</Text>
                            <IconButton
                                icon="close"
                                iconColor="#fff"
                                size={28}
                                onPress={onClose}
                                style={styles.closeButton}
                            />
                        </View>

                        <View style={styles.scanAreaBorder}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>

                        <Text style={styles.instruction}>
                            Align QR code within the frame
                        </Text>
                    </View>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        margin: 0,
        backgroundColor: 'black',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionContainer: {
        margin: 20,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        top: -10,
    },
    scanAreaBorder: {
        width: 280,
        height: 280,
        borderWidth: 0,
        borderColor: 'transparent',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    instruction: {
        color: 'white',
        fontSize: 16,
        marginTop: 40,
        textAlign: 'center',
        opacity: 0.8,
    },
});
