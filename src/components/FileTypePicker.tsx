import React, { useState } from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';
import { FILE_TYPE_OPTIONS, type FileTypeOption } from '@/utils/constants';

interface FileTypePickerProps {
    selectedType: FileTypeOption;
    onTypeSelect: (type: FileTypeOption) => void;
}

export const FileTypePicker: React.FC<FileTypePickerProps> = ({ selectedType, onTypeSelect }) => {
    const theme = useTheme<AppTheme>();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {FILE_TYPE_OPTIONS.map((option, index) => {
                const isSelected = selectedType === option.type;
                return (
                    <Animated.View
                        key={option.type}
                        entering={FadeIn.delay(index * 50)}
                    >
                        <Pressable
                            onPress={() => onTypeSelect(option.type)}
                            style={[
                                styles.typeButton,
                                {
                                    backgroundColor: isSelected
                                        ? theme.colors.primary
                                        : theme.colors.surfaceVariant,
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={option.icon as any}
                                size={24}
                                color={isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                            />
                            <Animated.Text
                                style={[
                                    styles.typeLabel,
                                    {
                                        color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                                    },
                                ]}
                            >
                                {option.label}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
    },
    typeLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
});
