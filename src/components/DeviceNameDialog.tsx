import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dialog, Portal, Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
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
    const [error, setError] = useState('');

    useEffect(() => {
        setName(currentName);
        setError('');
    }, [currentName, visible]);

    const handleSave = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Device name cannot be empty');
            return;
        }
        onSave(trimmed);
        onClose();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onClose} style={{ backgroundColor: theme.colors.surface }}>
                <Dialog.Title style={{ color: theme.colors.onSurface }}>
                    {t('settings.deviceName') || "Device Name"}
                </Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        mode="outlined"
                        label="Name"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (error) setError('');
                        }}
                        error={!!error}
                        autoFocus
                        style={{ backgroundColor: theme.colors.surface }}
                    />
                    {error ? (
                        <Text style={{ color: theme.colors.error, marginTop: 4, fontSize: 12 }}>
                            {error}
                        </Text>
                    ) : null}
                    <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, fontSize: 12 }}>
                        This name will be visible to other devices on the network.
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onClose} textColor={theme.colors.onSurfaceVariant}>Cancel</Button>
                    <Button onPress={handleSave} mode="contained" style={{ marginLeft: 8 }}>
                        Save
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({});
