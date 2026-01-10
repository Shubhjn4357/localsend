import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal, Portal, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';
import { normalizeConnectionKey, isValidConnectionKey } from '@/utils/connectionKey';

interface ManualSendingDialogProps {
    visible: boolean;
    onClose: () => void;
    onConnect: (type: 'key' | 'hashtag' | 'ip', value: string) => void;
}

export function ManualSendingDialog({ visible, onClose, onConnect }: ManualSendingDialogProps) {
    const theme = useTheme<AppTheme>();
    const [selectedTab, setSelectedTab] = useState<'key' | 'hashtag' | 'ip'>('key');
    const [value, setValue] = useState('');

    const handleConfirm = () => {
        if (!value.trim()) return;
        onConnect(selectedTab, value);
        setValue('');
        onClose();
    };

    const handleCancel = () => {
        setValue('');
        onClose();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={handleCancel}
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: theme.colors.surface },
                ]}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    {/* Header */}
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name="ip-network"
                            size={24}
                            color={theme.colors.onSurface}
                        />
                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                            Enter address
                        </Text>
                        <Pressable onPress={handleCancel} hitSlop={8}>
                            <MaterialCommunityIcons
                                name="close"
                                size={24}
                                color={theme.colors.onSurfaceVariant}
                            />
                        </Pressable>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <Pressable
                            style={[
                                styles.tab,
                                selectedTab === 'key' && styles.tabActive,
                                {
                                    backgroundColor: selectedTab === 'key'
                                        ? theme.colors.primaryContainer
                                        : theme.colors.surfaceVariant,
                                },
                            ]}
                            onPress={() => {
                                setSelectedTab('key');
                                setValue('');
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: selectedTab === 'key'
                                            ? theme.colors.onPrimaryContainer
                                            : theme.colors.onSurfaceVariant,
                                    },
                                ]}
                            >
                                Connection Key
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.tab,
                                selectedTab === 'ip' && styles.tabActive,
                                {
                                    backgroundColor: selectedTab === 'ip'
                                        ? theme.colors.primaryContainer
                                        : theme.colors.surfaceVariant,
                                },
                            ]}
                            onPress={() => {
                                setSelectedTab('ip');
                                setValue('');
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: selectedTab === 'ip'
                                            ? theme.colors.onPrimaryContainer
                                            : theme.colors.onSurfaceVariant,
                                    },
                                ]}
                            >
                                IP Address
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.tab,
                                selectedTab === 'hashtag' && styles.tabActive,
                                {
                                    backgroundColor: selectedTab === 'hashtag'
                                        ? theme.colors.primaryContainer
                                        : theme.colors.surfaceVariant,
                                },
                            ]}
                            onPress={() => {
                                setSelectedTab('hashtag');
                                setValue('');
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: selectedTab === 'hashtag'
                                            ? theme.colors.onPrimaryContainer
                                            : theme.colors.onSurfaceVariant,
                                    },
                                ]}
                            >
                                Hashtag
                            </Text>
                        </Pressable>
                    </View>

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        {selectedTab === 'key' ? (
                            <View>
                                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                                    Enter Connection Key
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            color: theme.colors.onSurface,
                                            borderColor: theme.colors.outline,
                                        },
                                    ]}
                                    value={value}
                                    onChangeText={(text) => {
                                        // Auto-format as user types
                                        const normalized = normalizeConnectionKey(text);
                                        setValue(normalized);
                                    }}
                                    placeholder="XXXX-YYYY"
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    maxLength={9}
                                />
                                {value && !isValidConnectionKey(value) && (
                                    <Text style={[styles.hint, { color: theme.colors.error }]}>
                                        Invalid key format. Expected: XXXX-YYYY
                                    </Text>
                                )}
                                <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                                    Enter the 8-character connection key from the receiver
                                </Text>
                            </View>
                        ) : selectedTab === 'hashtag' ? (
                            <View style={styles.hashtagInput}>
                                <Text style={[styles.hashSymbol, { color: theme.colors.onSurface }]}>
                                    #
                                </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                flex: 1,
                                                color: theme.colors.onSurface,
                                                backgroundColor: theme.colors.surfaceVariant,
                                            },
                                        ]}
                                    value={value}
                                    onChangeText={setValue}
                                    placeholder="123"
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    keyboardType="number-pad"
                                    autoFocus
                                />
                            </View>
                        ) : (
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.ipInput,
                                        {
                                            color: theme.colors.onSurface,
                                            backgroundColor: theme.colors.surfaceVariant,
                                        },
                                    ]}
                                    value={value}
                                    onChangeText={setValue}
                                    placeholder="192.168.1.100"
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    keyboardType="numeric"
                                    autoFocus
                                />
                        )}

                        {/* Helper Text */}
                        <Text style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
                            Example: 123{'\n'}IP Address: 192.0.0.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <Button
                            mode="text"
                            onPress={handleCancel}
                            textColor={theme.colors.onSurface}
                            style={styles.button}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleConfirm}
                            disabled={!value.trim()}
                            buttonColor={theme.colors.primary}
                            textColor={theme.colors.onPrimary}
                            style={styles.button}
                        >
                            Confirm
                        </Button>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        alignSelf: 'center',
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
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    tabActive: {
        // Active state handled by backgroundColor
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    hint: {
        fontSize: 12,
        marginTop: 4,
    },
    hashtagInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hashSymbol: {
        fontSize: 36,
        fontWeight: '700',
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 18,
        fontWeight: '500',
    },
    ipInput: {
        width: '100%',
    },
    helperText: {
        fontSize: 13,
        marginTop: 12,
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        minWidth: 100,
    },
});
