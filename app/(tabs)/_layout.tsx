import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActiveTransfersOverlay } from '@/components/ActiveTransfersOverlay';
import type { AppTheme } from '@/theme/colors';

export default function TabsLayout() {
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                    tabBarStyle: {
                        backgroundColor: theme.dark ? 'rgba(41, 37, 36, 0.8)' : 'rgba(254, 252, 232, 0.8)',
                        borderTopWidth: 0,
                        elevation: 0,
                        height: 60 + insets.bottom,
                        paddingBottom: insets.bottom,
                        paddingTop: 8
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },
                    headerStyle: {
                        backgroundColor: theme.colors.surface,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    headerTintColor: theme.colors.onSurface,
                    headerTitleStyle: {
                        fontSize: 20,
                        fontWeight: 'bold',
                    },
                }}
            >
                <Tabs.Screen
                    name="receive"
                    options={{
                        title: 'Receive',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="download" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="send"
                    options={{
                        title: 'Send',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="send" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: 'Settings',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="cog" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>

            {/* Active Transfers Overlay */}
            <ActiveTransfersOverlay />
        </>
    );
}
