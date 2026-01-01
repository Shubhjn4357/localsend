import React, { useEffect, useMemo } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { Slot, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '@/theme/colors';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import '@/i18n'; // Initialize i18n
import i18n from '@/i18n';

// Keep splash screen visible while we prepare
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = React.useState(false);
    const colorScheme = useColorScheme();
    const themePreference = useSettingsStore((state) => state.theme);

    // Memoize theme to prevent unnecessary re-renders
    const theme = useMemo(() => {
        if (themePreference === 'auto') {
            return colorScheme === 'dark' ? DarkTheme : LightTheme;
        }
        return themePreference === 'dark' ? DarkTheme : LightTheme;
    }, [themePreference, colorScheme]);

    useEffect(() => {
        async function prepare() {
            try {
                // Load all persisted data
                await Promise.all([
                    useSettingsStore.getState().loadSettings(),
                    useHistoryStore.getState().loadHistory(),
                    useFavoritesStore.getState().loadFavorites(),
                ]);

                // Sync language with i18n
                const language = useSettingsStore.getState().language;
                if (language) {
                    i18n.changeLanguage(language);
                }

                // Small delay to ensure everything is loaded
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <PaperProvider theme={theme}>
                    <GestureHandlerRootView style={styles.container}>
                        <StatusBar
                            barStyle={theme.dark === true ? 'light-content' : 'dark-content'}
                            backgroundColor={theme.colors.background}
                        />
                        <Slot />
                    </GestureHandlerRootView>
                </PaperProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
