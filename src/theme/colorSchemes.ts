import type { ColorScheme } from '@/types/settings';

// Color palette definitions for each scheme
export const ColorSchemes = {
    // System - Material You dynamic colors (will use device wallpaper on Android)
    system: {
        light: {
            primary: '#6750A4',
            primaryContainer: '#EADDFF',
            secondary: '#625B71',
            secondaryContainer: '#E8DEF8',
            tertiary: '#7D5260',
            tertiaryContainer: '#FFD8E4',
            background: '#FFFBFE',
            surface: '#FFFBFE',
            surfaceVariant: '#E7E0EC',
            onPrimary: '#FFFFFF',
            onSecondary: '#FFFFFF',
            onBackground: '#1C1B1F',
            onSurface: '#1C1B1F',
            outline: '#79747E',
            error: '#B3261E',
        },
        dark: {
            primary: '#D0BCFF',
            primaryContainer: '#4F378B',
            secondary: '#CCC2DC',
            secondaryContainer: '#4A4458',
            tertiary: '#EFB8C8',
            tertiaryContainer: '#633B48',
            background: '#1C1B1F',
            surface: '#1C1B1F',
            surfaceVariant: '#49454F',
            onPrimary: '#381E72',
            onSecondary: '#332D41',
            onBackground: '#E6E1E5',
            onSurface: '#E6E1E5',
            outline: '#938F99',
            error: '#F2B8B5',
        },
    },

    // LocalSend - Warm amber/coffee theme
    localsend: {
        light: {
            primary: '#D97706', // Amber 600
            primaryContainer: '#FEF3C7', // Amber 100
            secondary: '#92400E', // Amber 800
            secondaryContainer: '#FDE68A', // Amber 200
            tertiary: '#B45309', // Amber 700
            tertiaryContainer: '#FCD34D', // Amber 300
            background: '#FFFBEB', // Amber 50
            surface: '#FEFCE8', // Yellow 50
            surfaceVariant: '#FEF3C7', // Amber 100
            onPrimary: '#FFFFFF',
            onSecondary: '#FFFFFF',
            onBackground: '#78350F', // Amber 900
            onSurface: '#78350F',
            outline: '#A16207', // Amber 700
            error: '#DC2626',
        },
        dark: {
            primary: '#FCD34D', // Amber 300
            primaryContainer: '#92400E', // Amber 800
            secondary: '#FDE68A', // Amber 200
            secondaryContainer: '#78350F', // Amber 900
            tertiary: '#FEF3C7', // Amber 100
            tertiaryContainer: '#B45309', // Amber 700
            background: '#1C1917', // Stone 900
            surface: '#292524', // Stone 800
            surfaceVariant: '#44403C', // Stone 700
            onPrimary: '#451A03', // Amber 950
            onSecondary: '#451A03',
            onBackground: '#FEF3C7',
            onSurface: '#FEF3C7',
            outline: '#A8A29E', // Stone 400
            error: '#FCA5A5',
        },
    },

    // OLED - Pure black for OLED screens
    oled: {
        light: {
            // Same as system light theme
            primary: '#6750A4',
            primaryContainer: '#EADDFF',
            secondary: '#625B71',
            secondaryContainer: '#E8DEF8',
            tertiary: '#7D5260',
            tertiaryContainer: '#FFD8E4',
            background: '#FFFBFE',
            surface: '#FFFBFE',
            surfaceVariant: '#E7E0EC',
            onPrimary: '#FFFFFF',
            onSecondary: '#FFFFFF',
            onBackground: '#1C1B1F',
            onSurface: '#1C1B1F',
            outline: '#79747E',
            error: '#B3261E',
        },
        dark: {
            // Pure black backgrounds
            primary: '#D0BCFF',
            primaryContainer: '#4F378B',
            secondary: '#CCC2DC',
            secondaryContainer: '#4A4458',
            tertiary: '#EFB8C8',
            tertiaryContainer: '#633B48',
            background: '#000000',
            surface: '#000000',
            surfaceVariant: '#1C1B1F',
            onPrimary: '#381E72',
            onSecondary: '#332D41',
            onBackground: '#E6E1E5',
            onSurface: '#E6E1E5',
            outline: '#938F99',
            error: '#F2B8B5',
        },
    },

    // Yaru - Ubuntu's color scheme
    yaru: {
        light: {
            primary: '#E95420',
            primaryContainer: '#FFE0D6',
            secondary: '#77216F',
            secondaryContainer: '#F4D9F1',
            tertiary: '#5E2750',
            tertiaryContainer: '#F0D9EB',
            background: '#FFFFFF',
            surface: '#FFFFFF',
            surfaceVariant: '#F0F0F0',
            onPrimary: '#FFFFFF',
            onSecondary: '#FFFFFF',
            onBackground: '#2C2C2C',
            onSurface: '#2C2C2C',
            outline: '#757575',
            error: '#C7162B',
        },
        dark: {
            primary: '#FF7953',
            primaryContainer: '#C43D17',
            secondary: '#C087BA',
            secondaryContainer: '#5E1856',
            tertiary: '#B97CA4',
            tertiaryContainer: '#4A1E3C',
            background: '#2C2C2C',
            surface: '#2C2C2C',
            surfaceVariant: '#3D3D3D',
            onPrimary: '#5A1D0C',
            onSecondary: '#3D1238',
            onBackground: '#E6E6E6',
            onSurface: '#E6E6E6',
            outline: '#8F8F8F',
            error: '#FF6B6B',
        },
    },
};

// Helper function to get colors for a specific scheme and mode
export function getColorScheme(scheme: ColorScheme, isDark: boolean) {
    return isDark ? ColorSchemes[scheme].dark : ColorSchemes[scheme].light;
}
