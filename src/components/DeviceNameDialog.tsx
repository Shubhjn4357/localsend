import React, { useState, useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, { SlideInDown } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';

interface DeviceNameDialogProps {
    visible: boolean;
    currentName: string;
    onClose: () => void;
    onSave: (name: string) => void;
}

export function DeviceNameDialog({ visible, currentName, onClose, onSave }: DeviceNameDialogProps) {
    const { t } = useTranslation();
    const theme = useTheme<AppTheme>();
    const [name, setName] = useState(currentName);

    useEffect(() => {
        setName(currentName);
    }, [currentName, visible]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name.trim());
        onClose();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: theme.colors.surface },
                ]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <Animated.View
                            entering={SlideInDown}
                            style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
                        >
                            <View style={styles.header}>
                                <MaterialCommunityIcons
                                    name="devices"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                                    Edit Device Name
                                </Text>
                            </View>

                            <TextInput
                                mode="outlined"
                                label="Device Name"
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                                autoFocus
                                maxLength={30}
                            />

                            <View style={styles.actions}>
                                <Button mode="outlined" onPress={onClose} style={styles.button}>
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleSave}
                                    disabled={!name.trim()}
                                    style={styles.button}
                                >
                                    Save
                                </Button>
                            </View>
                        </Animated.View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 24,
    },
    keyboardAvoid: {
        flex: 1,
    },
    dialog: {
        borderRadius: 24,
        padding: 24,
        maxWidth: 400,
        width: '100%',
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
    input: {
        marginBottom: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
    },
});
