import { StyleSheet, Platform } from 'react-native';

export const GlassMorphismStyles = StyleSheet.create({
    glassLight: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    glassDark: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    glassCard: {
        borderRadius: 16,
        padding: 16,
        overflow: 'hidden',
    },
    glassButton: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        overflow: 'hidden',
    },
});

export type BlurIntensity = 'light' | 'regular' | 'heavy';

export const BlurIntensityValues: Record<BlurIntensity, number> = {
    light: 10,
    regular: 20,
    heavy: 40,
};

// iOS-specific blur types for Liquid Glass effect
export const iOSBlurTypes = {
    light: 'systemUltraThinMaterialLight' as const,
    dark: 'systemUltraThinMaterialDark' as const,
    regular: 'systemMaterialLight' as const,
    prominent: 'prominent' as const,
};

// Android-specific blur types
export const androidBlurTypes = {
    light: 'light' as const,
    dark: 'dark' as const,
};
