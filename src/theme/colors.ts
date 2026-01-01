import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { getColorScheme } from './colorSchemes';
import type { ColorScheme } from '@/types/settings';

// Glass effect colors (shared across all schemes)
const glassEffects = {
    light: {
        glassBackground: 'rgba(255, 255, 255, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.3)',
        glassShadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
        glassBackground: 'rgba(30, 41, 59, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        glassShadow: 'rgba(0, 0, 0, 0.3)',
    },
};

// Function to create theme based on color scheme and dark mode
export function createTheme(colorScheme: ColorScheme, isDark: boolean) {
    const schemeColors = getColorScheme(colorScheme, isDark);
    const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
    const navTheme = isDark ? NavigationDarkTheme : NavigationLightTheme;
    const glass = isDark ? glassEffects.dark : glassEffects.light;

    return {
        ...baseTheme,
        ...navTheme,
        dark: isDark,
        colors: {
            ...baseTheme.colors,
            ...navTheme.colors,
            ...schemeColors,
            ...glass,
        },
        fonts: baseTheme.fonts,
    };
}

// Legacy exports for backward compatibility (using localsend scheme)
export const LightTheme = createTheme('localsend', false);
export const DarkTheme = createTheme('localsend', true);

export type AppTheme = ReturnType<typeof createTheme>;
