import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Text, Button, IconButton, useTheme, Portal } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import type { AppTheme } from '@/theme/colors';

interface QRDisplayModalProps {
    visible: boolean;
    onClose: () => void;
    data: string;
    title?: string;
    instruction?: string;
}

export function QRDisplayModal({ visible, onClose, data, title, instruction }: QRDisplayModalProps) {
    const theme = useTheme<AppTheme>();

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                        {title || "Scan to Receive"}
                    </Text>
                    <IconButton
                        icon="close"
                        iconColor={theme.colors.onSurface}
                        size={24}
                        onPress={onClose}
                    />
                </View>

                <View style={styles.qrContainer}>
                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={data}
                            size={200}
                            color="black"
                            backgroundColor="white"
                        />
                    </View>
                    <Text style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}>
                        {instruction || "Ask the receiver to scan this QR code to connect and receive files properly."}
                    </Text>
                </View>

                <Button mode="contained" onPress={onClose} style={styles.button}>
                    Done
                </Button>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        margin: 20,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    qrWrapper: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
    },
    instruction: {
        textAlign: 'center',
        fontSize: 14,
        paddingHorizontal: 16,
        lineHeight: 20,
    },
    button: {
        width: '100%',
    },
});
