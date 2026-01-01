import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal, Portal, Text, Button, SegmentedButtons, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '@/theme/colors';

interface ManualSendingDialogProps {
    visible: boolean;
    onClose: () => void;
    onConnect: (type: 'hashtag' | 'ip', value: string) => void;
}

export function ManualSendingDialog({ visible, onClose, onConnect }: ManualSendingDialogProps) {
    const { t } = useTranslation();
    const theme = useTheme<AppTheme>();
    const [selectedTab, setSelectedTab] = useState<'hashtag' | 'ip'>('hashtag');
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                            {t('send.manualSending')}
                        </Text>
                        <Pressable onPress={handleCancel} hitSlop={8}>
                            <MaterialCommunityIcons
                                name="close"
                                size={24}
                                color={theme.colors.onSurfaceVariant}
                            />
                        </Pressable>
                    </View>

                    {/* Tab Selector */}
                    <View style={styles.tabContainer}>
                        <SegmentedButtons
                            value={selectedTab}
                            onValueChange={(value) => {
                                setSelectedTab(value as 'hashtag' | 'ip');
                                setValue('');
                            }}
                            buttons={[
                                {
                                    value: 'hashtag',
                                    label: t('send.hashtag'),
                                    icon: 'pound',
                                },
                                {
                                    value: 'ip',
                                    label: t('send.ipAddress'),
                                    icon: 'ip-network',
                                },
                            ]}
                            style={{ backgroundColor: theme.colors.surfaceVariant }}
                        />
                    </View>

                    {/* Input Section */}
                    <View style={styles.inputContainer}>
                        {selectedTab === 'hashtag' ? (
                            <>
                                <View style={styles.inputWrapper}>
                                    <Text style={[styles.hashSymbol, { color: theme.colors.primary }]}>
                                        #
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: theme.colors.onSurface,
                                                backgroundColor: theme.colors.surfaceVariant,
                                            },
                                        ]}
                                        value={value}
                                        onChangeText={setValue}
                                        placeholder=""
                                        placeholderTextColor={theme.colors.onSurfaceVariant}
                                        keyboardType="number-pad"
                                        autoFocus
                                    />
                                </View>
                                <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                                    {t('send.hashtagExample')}
                                </Text>
                            </>
                        ) : (
                            <>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            color: theme.colors.onSurface,
                                            backgroundColor: theme.colors.surfaceVariant,
                                        },
                                    ]}
                                    value={value}
                                    onChangeText={setValue}
                                    placeholder={t('send.ipAddressExample')}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    keyboardType="numeric"
                                    autoFocus
                                />
                            </>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <Button
                            mode="outlined"
                            onPress={handleCancel}
                            style={styles.actionButton}
                            textColor={theme.colors.onSurface}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleConfirm}
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            disabled={!value.trim()}
                        >
                            {t('common.confirm')}
                        </Button>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 24,
    },
    keyboardAvoid: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    tabContainer: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    hashSymbol: {
        fontSize: 24,
        fontWeight: '700',
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 16,
    },
    hint: {
        fontSize: 14,
        marginTop: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
    },
});
