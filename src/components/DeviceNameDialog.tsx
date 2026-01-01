import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';

interface DeviceNameDialogProps {
    visible: boolean;
    currentName: string;
    onClose: () => void;
    onSave: (name: string) => void;
}

export const DeviceNameDialog: React.FC<DeviceNameDialogProps> = ({
    visible,
    currentName,
    onClose,
    onSave
}) => {
    const theme = useTheme<AppTheme>();
    const [name, setName] = useState(currentName);

    // Sync name with currentName when dialog opens
    useEffect(() => {
        if (visible) {
            setName(currentName);
        }
    }, [visible, currentName]);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
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
            </Pressable>
        </Modal>
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
        width: '100%',
        paddingHorizontal: 24,
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
