import React, { useState } from 'react';
import { StyleSheet, View, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Text, TextInput, Button, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
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
        const clipboardText = await Clipboard.getString();
        if (clipboardText) {
            setText(prev => prev + clipboardText);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.backdrop} onPress={handleClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <Animated.View
                            entering={SlideInDown}
                            style={[styles.sheet, { backgroundColor: theme.colors.surface }]}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <MaterialCommunityIcons
                                    name="text-box"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                                    Send Text
                                </Text>
                                <IconButton
                                    icon="content-paste"
                                    size={20}
                                    onPress={handlePaste}
                                    iconColor={theme.colors.primary}
                                />
                                <Pressable onPress={handleClose}>
                                    <MaterialCommunityIcons
                                        name="close"
                                        size={24}
                                        color={theme.colors.onSurfaceVariant}
                                    />
                                </Pressable>
                            </View>

                            {/* Text Input */}
                            <TextInput
                                mode="outlined"
                                label="Enter text to send"
                                value={text}
                                onChangeText={setText}
                                multiline
                                numberOfLines={8}
                                style={styles.textInput}
                                placeholder="Type your message here..."
                                autoFocus
                            />

                            {/* Actions */}
                            <View style={styles.actions}>
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
                                    disabled={!text.trim()}
                                    style={styles.button}
                                >
                                    Send
                                </Button>
                            </View>
                        </Animated.View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
    },
    textInput: {
        marginBottom: 20,
        minHeight: 150,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
    },
});
