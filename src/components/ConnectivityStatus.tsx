import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, List, Button, useTheme } from 'react-native-paper';
import SystemSettings from '../../modules/system-settings/src';

export const ConnectivityStatus: React.FC = () => {
    const theme = useTheme();
    const [wifiEnabled, setWifiEnabled] = useState<boolean | null>(null);
    const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean | null>(null);

    const checkStatus = async () => {
        try {
            // Check if native module is available
            if (!SystemSettings) {
                console.log('SystemSettings module not available - requires rebuild');
                return;
            }

            const [wifi, bluetooth] = await Promise.all([
                SystemSettings.isWiFiEnabled(),
                SystemSettings.isBluetoothEnabled(),
            ]);
            setWifiEnabled(wifi);
            setBluetoothEnabled(bluetooth);
        } catch (error) {
            console.error('Failed to check connectivity status:', error);
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
            <Card.Title title="Connectivity" />
            <Card.Content>
                {/* WiFi Status */}
                <List.Item
                    title="WiFi"
                    description={
                        wifiEnabled === null
                            ? 'Checking...'
                            : wifiEnabled
                                ? 'Enabled'
                                : 'Disabled - Required for discovery'
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

                {/* Bluetooth Status */}
                <List.Item
                    title="Bluetooth"
                    description={
                        bluetoothEnabled === null
                            ? 'Checking...'
                            : bluetoothEnabled
                                ? 'Enabled'
                                : 'Disabled - Optional for discovery'
                    }
                    left={(props) => (
                        <List.Icon
                            {...props}
                            icon={bluetoothEnabled ? 'bluetooth' : 'bluetooth-off'}
                            color={bluetoothEnabled ? theme.colors.primary : theme.colors.onSurfaceDisabled}
                        />
                    )}
                    right={() =>
                        !bluetoothEnabled && bluetoothEnabled !== null ? (
                            <Button
                                mode="outlined"
                                compact
                                onPress={() => SystemSettings.openBluetoothSettings()}
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
