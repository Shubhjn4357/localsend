import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { TextInput, Button, useTheme, IconButton, Modal, Portal, Text } from 'react-native-paper';
import Animated, { SlideInDown } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';

interface TextInputSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
}

export const TextInputSheet: React.FC<TextInputSheetProps> = ({ visible, onClose, onSubmit }) => {
    const theme = useTheme<AppTheme>();
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(text);
            setText('');
            onClose();
        }
    };

    const handleClose = () => {
        setText('');
        onClose();
    };

    const handlePaste = async () => {
        try {
            const clipboardText = await Clipboard.getString();
            if (clipboardText) {
                setText(prev => prev + clipboardText);
            }
        } catch (e) {
            console.error('Failed to paste:', e);
        }
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
                            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Send Text</Text>
                            <IconButton
                                icon="close"
                                size={24}
                                iconColor={theme.colors.onSurface}
                                onPress={handleClose}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                mode="outlined"
                                label="Message"
                                value={text}
                                onChangeText={setText}
                                multiline
                                numberOfLines={5}
                                style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
                                placeholder="Type your message here..."
                                activeOutlineColor={theme.colors.primary}
                                textColor={theme.colors.onSurface}
                                autoFocus
                            />
                            <IconButton
                                icon="content-paste"
                                size={20}
                                onPress={handlePaste}
                                style={styles.pasteButton}
                                iconColor={theme.colors.primary}
                            />
                        </View>

                        <View style={styles.footer}>
                            <Button
                                mode="outlined"
                                onPress={handleClose}
                                style={styles.button}
                                textColor={theme.colors.onSurfaceVariant}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                disabled={!text.trim()}
                                style={styles.button}
                                buttonColor={theme.colors.primary}
                                textColor={theme.colors.onPrimary}
                            >
                                Send
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
    inputContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    textInput: {
        minHeight: 120,
    },
    pasteButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    button: {
        flex: 1,
    },
});
