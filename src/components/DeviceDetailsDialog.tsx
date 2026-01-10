import React from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Button, Portal, Modal, Divider, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';
import type { Device } from '@/types/device';
import { setStringAsync } from 'expo-clipboard';

interface DeviceDetailsDialogProps {
    visible: boolean;
    device: Device | null;
    onDismiss: () => void;
    ipAddress?: string;
    networkSSID?: string;
}

export const DeviceDetailsDialog: React.FC<DeviceDetailsDialogProps> = ({
    visible,
    device,
    onDismiss,
    ipAddress,
    networkSSID,
}) => {
    const theme = useTheme<AppTheme>();

    if (!device) return null;

    // Generate connection key from fingerprint
    const connectionKey = device.fingerprint.slice(0, 8).toUpperCase();
    const formattedKey = `${connectionKey.slice(0, 4)}-${connectionKey.slice(4, 8)}`;

    const copyToClipboard = async (text: string, label: string) => {
        await setStringAsync(text);
        Alert.alert('Copied', `${label} copied to clipboard`, [{ text: 'OK' }]);
    };

    const getConnectionTypeIcon = () => {
        switch (device.connectionType) {
            case 'wifi-direct':
            case 'nearby':
                return 'wifi-strength-4';
            case 'bluetooth':
                return 'bluetooth';
            default:
                return 'wifi';
        }
    };

    const getConnectionTypeLabel = () => {
        switch (device.connectionType) {
            case 'wifi-direct':
            case 'nearby':
                return 'WiFi-Direct (Nearby)';
            case 'bluetooth':
                return 'Bluetooth';
            default:
                return 'WiFi';
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modal,
                    { backgroundColor: theme.colors.surface },
                ]}
            >
                <ScrollView>
                    {/* Header */}
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name="devices"
                            size={48}
                            color={theme.colors.primary}
                        />
                        <Text
                            style={[styles.deviceName, { color: theme.colors.onSurface }]}
                        >
                            {device.alias}
                        </Text>
                        <Text
                            style={[
                                styles.deviceModel,
                                { color: theme.colors.onSurfaceVariant },
                            ]}
                        >
                            {device.deviceModel || 'Unknown Model'} • {device.deviceType}
                        </Text>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Connection Information */}
                    <View style={styles.section}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: theme.colors.onSurfaceVariant },
                            ]}
                        >
                            Connection Information
                        </Text>

                        {/* Connection Key */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <MaterialCommunityIcons
                                    name="key-variant"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <View style={styles.infoText}>
                                    <Text
                                        style={[styles.infoLabel, { color: theme.colors.onSurface }]}
                                    >
                                        Connection Key
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.primary, fontWeight: 'bold' },
                                        ]}
                                    >
                                        {formattedKey}
                                    </Text>
                                </View>
                            </View>
                            <IconButton
                                icon="content-copy"
                                size={20}
                                onPress={() => copyToClipboard(formattedKey, 'Connection key')}
                            />
                        </View>

                        {/* IP Address */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <MaterialCommunityIcons
                                    name="ip-network"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <View style={styles.infoText}>
                                    <Text
                                        style={[styles.infoLabel, { color: theme.colors.onSurface }]}
                                    >
                                        IP Address
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.onSurfaceVariant },
                                        ]}
                                    >
                                        {device.ipAddress}
                                    </Text>
                                </View>
                            </View>
                            <IconButton
                                icon="content-copy"
                                size={20}
                                onPress={() => copyToClipboard(device.ipAddress, 'IP address')}
                            />
                        </View>

                        {/* Network */}
                        {networkSSID && (
                            <View style={styles.infoRow}>
                                <View style={styles.infoLeft}>
                                    <MaterialCommunityIcons
                                        name="wifi"
                                        size={24}
                                        color={theme.colors.primary}
                                    />
                                    <View style={styles.infoText}>
                                        <Text
                                            style={[
                                                styles.infoLabel,
                                                { color: theme.colors.onSurface },
                                            ]}
                                        >
                                            Network
                                        </Text>
                                        <Text
                                            style={[
                                                styles.infoValue,
                                                { color: theme.colors.onSurfaceVariant },
                                            ]}
                                        >
                                            {networkSSID}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Connection Type */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <MaterialCommunityIcons
                                    name={getConnectionTypeIcon()}
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <View style={styles.infoText}>
                                    <Text
                                        style={[styles.infoLabel, { color: theme.colors.onSurface }]}
                                    >
                                        Connection Type
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.onSurfaceVariant },
                                        ]}
                                    >
                                        {getConnectionTypeLabel()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Port */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <MaterialCommunityIcons
                                    name="ethernet"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <View style={styles.infoText}>
                                    <Text
                                        style={[styles.infoLabel, { color: theme.colors.onSurface }]}
                                    >
                                        Port
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.onSurfaceVariant },
                                        ]}
                                    >
                                        {device.port}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Device Information */}
                    <View style={styles.section}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: theme.colors.onSurfaceVariant },
                            ]}
                        >
                            Device Information
                        </Text>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <MaterialCommunityIcons
                                    name="fingerprint"
                                    size={24}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <View style={styles.infoText}>
                                    <Text
                                        style={[styles.infoLabel, { color: theme.colors.onSurface }]}
                                    >
                                        Fingerprint
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.onSurfaceVariant, fontSize: 12 },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {device.fingerprint}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <MaterialCommunityIcons
                                    name="information"
                                    size={24}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <View style={styles.infoText}>
                                    <Text
                                        style={[styles.infoLabel, { color: theme.colors.onSurface }]}
                                    >
                                        Protocol Version
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.onSurfaceVariant },
                                        ]}
                                    >
                                        {device.version}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Button
                            mode="contained"
                            onPress={onDismiss}
                            style={styles.button}
                        >
                            Close
                        </Button>
                    </View>
                </ScrollView>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 12,
        maxHeight: '80%',
    },
    header: {
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
    },
    deviceName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 12,
        textAlign: 'center',
    },
    deviceModel: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    divider: {
        marginVertical: 8,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoText: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        marginTop: 2,
    },
    actions: {
        padding: 16,
        paddingTop: 8,
    },
    button: {
        borderRadius: 8,
    },
});
