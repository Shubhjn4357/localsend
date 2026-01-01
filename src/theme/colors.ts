import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Liquid glass color palette
export const LiquidGlassColors = {
    light: {
        primary: '#6366F1', // Indigo
        primaryContainer: '#E0E7FF',
        secondary: '#EC4899', // Pink
        secondaryContainer: '#FCE7F3',
        tertiary: '#8B5CF6', // Purple
        tertiaryContainer: '#EDE9FE',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceVariant: '#F1F5F9',
        onPrimary: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onBackground: '#1E293B',
        onSurface: '#1E293B',
        outline: '#CBD5E1',
        error: '#EF4444',
        // Glass effect colors
        glassBackground: 'rgba(255, 255, 255, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.3)',
        glassShadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
        primary: '#818CF8', // Light Indigo
        primaryContainer: '#4338CA',
        secondary: '#F472B6', // Light Pink
        secondaryContainer: '#BE185D',
        tertiary: '#A78BFA', // Light Purple
        tertiaryContainer: '#6D28D9',
        background: '#0F172A',
        surface: '#1E293B',
        surfaceVariant: '#334155',
        onPrimary: '#1E1B4B',
        onSecondary: '#831843',
        onBackground: '#F1F5F9',
        onSurface: '#F1F5F9',
        outline: '#475569',
        error: '#F87171',
        // Glass effect colors
        glassBackground: 'rgba(30, 41, 59, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        glassShadow: 'rgba(0, 0, 0, 0.3)',
    },
};

export const LightTheme = {
    ...MD3LightTheme,
    ...NavigationLightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...NavigationLightTheme.colors,
        ...LiquidGlassColors.light,
    },
    // Ensure MD3 fonts are preserved
    fonts: MD3LightTheme.fonts,
};

export const DarkTheme = {
    ...MD3DarkTheme,
    ...NavigationDarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...NavigationDarkTheme.colors,
        ...LiquidGlassColors.dark,
    },
    // Ensure MD3 fonts are preserved
    fonts: MD3DarkTheme.fonts,
};

export type AppTheme = typeof LightTheme;
