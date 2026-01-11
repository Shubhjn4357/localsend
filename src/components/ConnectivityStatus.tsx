import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, List, Button, useTheme } from 'react-native-paper';
import SystemSettings from '../../modules/system-settings/src';

/**
 * WiFi Connectivity Status Component
 * Shows WiFi status for LocalSend discovery
 */
export const ConnectivityStatus: React.FC = () => {
    const theme = useTheme();
    const [wifiEnabled, setWifiEnabled] = useState<boolean | null>(null);

    const checkStatus = async () => {
        try {
            // Check if native module is available
            if (!SystemSettings) {
                console.log('SystemSettings module not available - requires rebuild');
                return;
            }

            const wifi = await SystemSettings.isWiFiEnabled();
            setWifiEnabled(wifi);
        } catch (error) {
            console.error('Failed to check WiFi status:', error);
        }
    };

    useEffect(() => {
        checkStatus();
        // Re-check every 5 seconds
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // Don't render if module not available
    if (!SystemSettings) {
        return null;
    }

    return (
        <Card style={styles.card}>
            <Card.Title title="Network Status" />
            <Card.Content>
                {/* WiFi Status */}
                <List.Item
                    title="WiFi"
                    description={
                        wifiEnabled === null
                            ? 'Checking...'
                            : wifiEnabled
                                ? 'Connected - Ready for file transfer'
                                : 'Disabled - Required for LocalSend'
                    }
                    left={(props) => (
                        <List.Icon
                            {...props}
                            icon={wifiEnabled ? 'wifi' : 'wifi-off'}
                            color={wifiEnabled ? theme.colors.primary : theme.colors.error}
                        />
                    )}
                    right={() =>
                        !wifiEnabled && wifiEnabled !== null ? (
                            <Button
                                mode="contained"
                                compact
                                onPress={() => SystemSettings.openWiFiSettings()}
                            >
                                Enable
                            </Button>
                        ) : null
                    }
                />
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
    },
});
