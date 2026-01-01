import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Modal, Portal, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';
import { FILE_TYPE_OPTIONS, type FileTypeOption } from '@/utils/constants';

interface FileTypePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onTypeSelect: (type: FileTypeOption) => void;
}

export function FileTypePickerModal({ visible, onClose, onTypeSelect }: FileTypePickerModalProps) {
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();

    const handleSelect = (type: FileTypeOption) => {
        onTypeSelect(type);
        onClose();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.modalContainer}
            >
                <Animated.View
                    entering={SlideInDown}
                    style={[
                        styles.bottomSheet,
                        {
                            backgroundColor: theme.colors.surface,
                            paddingBottom: insets.bottom + 24
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                            Add to selection
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                            What do you want to add?
                        </Text>
                    </View>

                    <View style={styles.grid}>
                        {FILE_TYPE_OPTIONS.map((option, index) => (
                            <Animated.View
                                key={option.type}
                                entering={FadeIn.delay(index * 50)}
                                style={styles.gridItem}
                            >
                                <Pressable
                                    onPress={() => handleSelect(option.type)}
                                    style={[
                                        styles.button,
                                        { backgroundColor: theme.colors.primary }
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={32}
                                        color={theme.colors.onPrimary}
                                    />
                                    <Text style={[styles.label, { color: theme.colors.onPrimary }]}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>
            </Modal>
        </Portal>
    );
}

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
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridItem: {
        width: '31%',
    },
    button: {
        aspectRatio: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    label: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
