import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, useTheme, IconButton } from 'react-native-paper';
import Animated, { SlideInDown } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';

interface PinInputDialogProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (pin: string) => void;
    deviceName: string;
}

export const PinInputDialog: React.FC<PinInputDialogProps> = ({
    visible,
    onClose,
    onSubmit,
    deviceName,
}) => {
    const theme = useTheme<AppTheme>();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        // Validate PIN (4 digits)
        if (!/^\d{4}$/.test(pin)) {
            setError('PIN must be 4 digits');
            return;
        }

        setError('');
        onSubmit(pin);
        setPin('');
        onClose();
    };

    const handleClose = () => {
        setPin('');
        setError('');
        onClose();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={handleClose}
                contentContainerStyle={styles.modalContainer}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <Animated.View
                        entering={SlideInDown}
                        style={[
                            styles.bottomSheet,
                            { backgroundColor: theme.colors.surface }
                        ]}
                    >
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                                PIN Required
                            </Text>
                            <IconButton
                                icon="close"
                                size={24}
                                iconColor={theme.colors.onSurface}
                                onPress={handleClose}
                            />
                        </View>

                        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                            {deviceName} requires a PIN to receive files
                        </Text>

                        <TextInput
                            mode="outlined"
                            label="Enter 4-digit PIN"
                            value={pin}
                            onChangeText={(text) => {
                                setPin(text.replace(/[^0-9]/g, '').slice(0, 4));
                                setError('');
                            }}
                            keyboardType="number-pad"
                            maxLength={4}
                            style={styles.input}
                            error={!!error}
                            autoFocus
                            secureTextEntry
                        />

                        {error ? (
                            <Text style={[styles.error, { color: theme.colors.error }]}>
                                {error}
                            </Text>
                        ) : null}

                        <View style={styles.footer}>
                            <Button
                                mode="outlined"
                                onPress={handleClose}
                                style={styles.button}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                disabled={pin.length !== 4}
                                style={styles.button}
                                buttonColor={theme.colors.primary}
                            >
                                Submit
                            </Button>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    bottomSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },
    input: {
        marginBottom: 8,
    },
    error: {
        fontSize: 12,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
    },
});
