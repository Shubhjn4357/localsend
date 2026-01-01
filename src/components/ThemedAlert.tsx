import React from 'react';
import { StyleSheet, View, Modal, Pressable } from 'react-native';
import { Text, Button, useTheme, Portal } from 'react-native-paper';
import type { AppTheme } from '@/theme/colors';

interface ThemedAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onDismiss: () => void;
    buttons?: {
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }[];
}

export function ThemedAlert({ visible, title, message, onDismiss, buttons }: ThemedAlertProps) {
    const theme = useTheme<AppTheme>();

    const defaultButtons = [
        {
            text: 'OK',
            onPress: onDismiss,
            style: 'default',
        },
    ];

    const alertButtons = buttons && buttons.length > 0 ? buttons : defaultButtons;

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                transparent
                animationType="fade"
                onRequestClose={onDismiss}
            >
                <Pressable style={styles.backdrop} onPress={onDismiss}>
                    <Pressable style={[styles.container, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                            {title}
                        </Text>
                        <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
                            {message}
                        </Text>
                        <View style={styles.buttonContainer}>
                            {alertButtons.map((btn, index) => (
                                <Button
                                    key={index}
                                    mode={btn.style === 'default' ? 'contained' : 'text'}
                                    onPress={() => {
                                        btn.onPress();
                                        if (btn.style === 'cancel') onDismiss();
                                    }}
                                    textColor={
                                        btn.style === 'default'
                                            ? theme.colors.onPrimary
                                            : btn.style === 'destructive'
                                            ? theme.colors.error
                                            : theme.colors.primary
                                    }
                                    buttonColor={
                                        btn.style === 'default' ? theme.colors.primary : undefined
                                    }
                                    style={styles.button}
                                >
                                    {btn.text}
                                </Button>
                            ))}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 24,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        flexWrap: 'wrap',
    },
    button: {
        minWidth: 80,
    },
});
