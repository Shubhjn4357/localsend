import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Linking, Modal, Platform } from 'react-native';
import { Text, Switch, useTheme, Divider, RadioButton, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StorageAccessFramework } from 'expo-file-system/legacy';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/settingsStore';
import { DeviceNameDialog } from '@/components/DeviceNameDialog';
import { PrivacyPolicyScreen } from '@/components/PrivacyPolicyScreen';
import { ThemedAlert } from '@/components/ThemedAlert';
import { CurlySpinner } from '@/components/CurlySpinner';
import * as Network from 'expo-network';
import type { AppTheme } from '@/theme/colors';
import type { ThemeMode, ColorScheme, Language, DestinationFolder } from '@/types/settings';
import { LANGUAGES, COLOR_SCHEMES, DESTINATION_FOLDERS } from '@/types/settings';
import { LOCALSEND_VERSION, APP_DEVELOPER, CHANGELOG } from '@/utils/constants';

export default function SettingsScreen() {
    const { t } = useTranslation();
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();
    const [showChangelog, setShowChangelog] = useState(false);
    const [ipAddress, setIpAddress] = useState<string>('...');
    const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
    const [expandedLanguages, setExpandedLanguages] = useState(false);
    const [expandedColorSchemes, setExpandedColorSchemes] = useState(false);
    const [expandedDestination, setExpandedDestination] = useState(false);
    const [showDeviceNameDialog, setShowDeviceNameDialog] = useState(false);
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

    // General Settings
    const themeMode = useSettingsStore((state) => state.theme);
    const colorScheme = useSettingsStore((state) => state.colorScheme);
    const language = useSettingsStore((state) => state.language);
    const animationsEnabled = useSettingsStore((state) => state.animationsEnabled);
    const setTheme = useSettingsStore((state) => state.setTheme);
    const setColorScheme = useSettingsStore((state) => state.setColorScheme);
    const setLanguage = useSettingsStore((state) => state.setLanguage);
    const setAnimationsEnabled = useSettingsStore((state) => state.setAnimationsEnabled);

    // Receive Settings
    const quickSaveEnabled = useSettingsStore((state) => state.quickSaveEnabled);
    const quickSaveForFavorites = useSettingsStore((state) => state.quickSaveForFavorites);
    const requirePin = useSettingsStore((state) => state.requirePin);
    const pin = useSettingsStore((state) => state.pin);
    const destination = useSettingsStore((state) => state.destination);
    const customDestination = useSettingsStore((state) => state.customDestination);
    const saveToGallery = useSettingsStore((state) => state.saveToGallery);
    const autoFinish = useSettingsStore((state) => state.autoFinish);
    const saveHistory = useSettingsStore((state) => state.saveHistory);
    const setQuickSaveEnabled = useSettingsStore((state) => state.setQuickSaveEnabled);
    const setQuickSaveForFavorites = useSettingsStore((state) => state.setQuickSaveForFavorites);
    const setRequirePin = useSettingsStore((state) => state.setRequirePin);
    const setDestination = useSettingsStore((state) => state.setDestination);
    const setCustomDestination = useSettingsStore((state) => state.setCustomDestination);
    const setSaveToGallery = useSettingsStore((state) => state.setSaveToGallery);
    const setAutoFinish = useSettingsStore((state) => state.setAutoFinish);
    const setSaveHistory = useSettingsStore((state) => state.setSaveHistory);
    const setPin = useSettingsStore((state) => state.setPin);

    // Network Settings
    const deviceName = useSettingsStore((state) => state.deviceName);
    const serverRunning = useSettingsStore((state) => state.serverRunning);
    const bluetoothEnabled = useSettingsStore((state) => state.bluetoothEnabled);
    const useNearbyConnections = useSettingsStore((state) => state.useNearbyConnections);
    const useNearDrop = useSettingsStore((state) => state.useNearDrop);
    const optimizeTransfers = useSettingsStore((state) => state.optimizeTransfers);
    const setDeviceName = useSettingsStore((state) => state.setDeviceName);
    const setServerRunning = useSettingsStore((state) => state.setServerRunning);
    const setBluetoothEnabled = useSettingsStore((state) => state.setBluetoothEnabled);
    const setUseNearbyConnections = useSettingsStore((state) => state.setUseNearbyConnections);
    const setUseNearDrop = useSettingsStore((state) => state.setUseNearDrop);
    const setOptimizeTransfers = useSettingsStore((state) => state.setOptimizeTransfers);

    const currentYear = new Date().getFullYear();

    const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; buttons?: any[] }>({
        visible: false,
        title: '',
        message: ''
    });

    const showAlert = (title: string, message: string, buttons?: any[]) => {
        setAlert({ visible: true, title, message, buttons });
    };

    const hideAlert = () => {
        setAlert(prev => ({ ...prev, visible: false }));
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* General Section */}
                <Animated.View entering={FadeIn}>
                    <SectionHeader icon="cog" title="General" theme={theme} />

                    <SettingItem
                        icon="palette"
                        label="Theme"
                        value={themeMode === 'auto' ? 'Auto' : themeMode === 'dark' ? 'Dark' : 'Light'}
                        theme={theme}
                        onPress={() => {
                            const modes: ThemeMode[] = ['light', 'dark', 'auto'];
                            const currentIndex = modes.indexOf(themeMode);
                            const nextMode = modes[(currentIndex + 1) % modes.length];
                            setTheme(nextMode);
                        }}
                    />

                    <SettingItem
                        icon="palette-swatch"
                        label="Color"
                        value={COLOR_SCHEMES[colorScheme]}
                        theme={theme}
                        onPress={() => setExpandedColorSchemes(!expandedColorSchemes)}
                        expandable
                    />

                    {expandedColorSchemes && (
                        <RadioGroup
                            options={Object.entries(COLOR_SCHEMES).map(([key, label]) => ({ key, label }))}
                            selected={colorScheme}
                            onSelect={(key) => setColorScheme(key as ColorScheme)}
                            theme={theme}
                        />
                    )}

                    <SettingItem
                        icon="translate"
                        label="Language"
                        value={LANGUAGES[language]}
                        theme={theme}
                        onPress={() => setExpandedLanguages(!expandedLanguages)}
                        expandable
                    />

                    {expandedLanguages && (
                        <RadioGroup
                            options={Object.entries(LANGUAGES).map(([key, label]) => ({ key, label }))}
                            selected={language}
                            onSelect={(key) => setLanguage(key as Language)}
                            theme={theme}
                        />
                    )}

                    <ToggleSettingItem
                        icon="animation"
                        label="Animations"
                        value={animationsEnabled}
                        onValueChange={setAnimationsEnabled}
                        theme={theme}
                    />
                </Animated.View>

                <Divider style={styles.sectionDivider} />

                {/* Receive Section */}
                <Animated.View entering={FadeIn.delay(100)}>
                    <SectionHeader icon="download" title="Receive" theme={theme} />

                    <ToggleSettingItem
                        icon="lightning-bolt"
                        label="QuickSave"
                        subtitle="Auto-accept and save files"
                        value={quickSaveEnabled}
                        onValueChange={setQuickSaveEnabled}
                        theme={theme}
                    />

                    <ToggleSettingItem
                        icon="star-circle"
                        label="Quick Save for 'Favourites'"
                        subtitle="Auto-accept from favorite devices"
                        value={quickSaveForFavorites}
                        onValueChange={setQuickSaveForFavorites}
                        theme={theme}
                    />

                    <ToggleSettingItem
                        icon="lock"
                        label="Require PIN"
                        subtitle="Require PIN for file transfers"
                        value={requirePin}
                        onValueChange={setRequirePin}
                        theme={theme}
                    />

                    {requirePin && (
                        <>
                            <SettingItem
                                icon="key-variant"
                                label="Custom PIN"
                                value={pin || 'Not Set'}
                                theme={theme}
                                onPress={() => {
                                    showAlert(
                                        'Set PIN',
                                        'Enter a 4-digit PIN',
                                        [
                                            {
                                                text: 'Cancel',
                                                style: 'cancel',
                                            },
                                            {
                                                text: 'Set',
                                                onPress: (inputValue: string) => {
                                                    if (inputValue && /^\d{4}$/.test(inputValue)) {
                                                        setPin(inputValue);
                                                    } else {
                                                        showAlert('Invalid PIN', 'PIN must be 4 digits');
                                                    }
                                                },
                                            },
                                        ]
                                    );
                                }}
                            />

                            <SettingItem
                                icon="shuffle-variant"
                                label="Generate Random PIN"
                                value="Tap to generate"
                                theme={theme}
                                onPress={() => {
                                    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
                                    setPin(randomPin);
                                    showAlert('PIN Generated', `Your new PIN is: ${randomPin}`);
                                }}
                            />
                        </>
                    )}

                    <SettingItem
                        icon="folder"
                        label="Destination"
                        value={destination === 'custom' && customDestination ? decodeURIComponent(customDestination.split('%3A').pop() || customDestination) : DESTINATION_FOLDERS[destination]}
                        theme={theme}
                        onPress={() => setExpandedDestination(!expandedDestination)}
                        expandable
                    />

                    {expandedDestination && (
                        <RadioGroup
                            options={Object.entries(DESTINATION_FOLDERS).map(([key, label]) => ({ key, label }))}
                            selected={destination}
                            onSelect={async (key) => {
                                if (key === 'custom') {
                                    if (Platform.OS === 'android') {
                                        try {
                                            // Safety check for StorageAccessFramework
                                            if (StorageAccessFramework && StorageAccessFramework.requestDirectoryPermissionsAsync) {
                                                const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
                                                if (permissions.granted) {
                                                    showAlert('Success', 'Folder selected: ' + permissions.directoryUri);
                                                    setCustomDestination(permissions.directoryUri);
                                                    setDestination(key as DestinationFolder);
                                                }
                                            } else {
                                                showAlert('Error', 'Storage Access Framework not available on this device');
                                            }
                                        } catch (e) {
                                            showAlert('Error', 'Failed to pick folder: ' + e);
                                        }
                                    } else {
                                        showAlert(
                                            'Custom Folder',
                                            'Custom folder selection is only supported on Android in this version.',
                                            [{ text: 'OK', onPress: hideAlert, style: 'default' }]
                                        );
                                        // Still allow setting it for now or revert? 
                                        // If web/iOS, we probably can't easily support "writing to arbitrary folder" without OS limits.
                                        // So maybe don't set it.
                                        return;
                                    }
                                } else {
                                    setDestination(key as DestinationFolder);
                                }
                            }}
                            theme={theme}
                        />
                    )}

                    <ToggleSettingItem
                        icon="image"
                        label="Save to Gallery"
                        subtitle="Save media to gallery"
                        value={saveToGallery}
                        onValueChange={setSaveToGallery}
                        theme={theme}
                    />

                    <ToggleSettingItem
                        icon="check-circle"
                        label="Auto Finish"
                        subtitle="Auto close after transfer"
                        value={autoFinish}
                        onValueChange={setAutoFinish}
                        theme={theme}
                    />

                    <ToggleSettingItem
                        icon="history"
                        label="Save to History"
                        subtitle="Keep transfer history locally"
                        value={saveHistory}
                        onValueChange={setSaveHistory}
                        theme={theme}
                    />
                </Animated.View>

                <Divider style={styles.sectionDivider} />

                {/* Network Section */}
                <Animated.View entering={FadeIn.delay(200)}>
                    <SectionHeader icon="network" title="Network" theme={theme} />

                    <SettingItem
                        icon="devices"
                        label="Device Name"
                        value={deviceName}
                        theme={theme}
                        onPress={() => setShowDeviceNameDialog(true)}
                    />

                    <ToggleSettingItem
                        icon="server"
                        label="Server"
                        subtitle={serverRunning ? 'Running' : 'Stopped'}
                        value={serverRunning}
                        onValueChange={setServerRunning}
                        theme={theme}
                    />

                    <ToggleSettingItem
                        icon="bluetooth"
                        label="Bluetooth Discovery"
                        subtitle="Use Bluetooth for finding nearby devices"
                        value={bluetoothEnabled}
                        onValueChange={setBluetoothEnabled}
                        theme={theme}
                    />

                    <ToggleSettingItem
                        icon="wifi"
                        label="Wi-Fi Direct (Android)"
                        subtitle="Faster transfers between Android devices"
                        value={useNearbyConnections}
                        onValueChange={setUseNearbyConnections}
                        theme={theme}
                        disabled={Platform.OS !== 'android'}
                    />

                    <ToggleSettingItem
                        icon="apple"
                        label="NearDrop (macOS/iOS)"
                        subtitle="Compatible with Android Quick Share"
                        value={useNearDrop}
                        onValueChange={setUseNearDrop}
                        theme={theme}
                        disabled={Platform.OS !== 'ios' && Platform.OS !== 'macos'}
                    />

                    <ToggleSettingItem
                        icon="flash"
                        label="Optimize Transfers"
                        subtitle="Compress files & stream large transfers"
                        value={optimizeTransfers}
                        onValueChange={setOptimizeTransfers}
                        theme={theme}
                    />
                </Animated.View>

                <Divider style={styles.sectionDivider} />

                {/* About Section */}
                <Animated.View entering={FadeIn.delay(300)}>
                    <SectionHeader icon="information" title="About" theme={theme} />

                    <SettingItem
                        icon="link"
                        label="Support LocalSend"
                        theme={theme}
                        onPress={() => Linking.openURL('https://localsend.org')}
                    />

                    <SettingItem
                        icon="shield-lock"
                        label="Privacy Policy"
                        theme={theme}
                        onPress={() => setShowPrivacyPolicy(true)}
                    />

                    <SettingItem
                        icon="file-document"
                        label="Changelog"
                        value={`v${LOCALSEND_VERSION}`}
                        theme={theme}
                        onPress={() => setShowChangelog(!showChangelog)}
                        expandable
                    />

                    {showChangelog && (
                        <ChangelogView changelog={CHANGELOG} theme={theme} />
                    )}
                </Animated.View>

                <Divider style={styles.sectionDivider} />

                {/* Support Section */}
                <Animated.View entering={FadeIn.delay(500)}>
                    <SectionHeader icon="heart" title="Support LocalSend" theme={theme} />

                    <SettingItem
                        icon="coffee"
                        label={t('settings.buyMeCoffee') || "Buy me a coffee"}
                        theme={theme}
                        onPress={() => {
                            const url = 'https://www.buymeacoffee.com/shubhjn';
                            Linking.openURL(url).catch(() => {
                                showAlert(t('common.error'), 'Could not open link');
                            });
                        }}
                    />
                </Animated.View>

                {/* App Info */}
                <Animated.View entering={FadeIn.delay(400)} style={styles.appInfoContainer}>
                    <MaterialCommunityIcons
                        name="share-variant"
                        size={48}
                        color={theme.colors.primary}
                    />
                    <Text style={[styles.appVersion, { color: theme.colors.onSurface }]}>
                        LocalSend v{LOCALSEND_VERSION}
                    </Text>
                    <Text style={[styles.appCopyright, { color: theme.colors.onSurfaceVariant }]}>
                        © {currentYear} {APP_DEVELOPER}
                    </Text>
                    <Text style={[styles.appTagline, { color: theme.colors.outline }]}>
                        Share files across devices
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Device Name Dialog */}
            <DeviceNameDialog
                visible={showDeviceNameDialog}
                currentName={deviceName}
                onClose={() => setShowDeviceNameDialog(false)}
                onSave={setDeviceName}
            />

            {/* Privacy Policy Modal */}
            <Modal
                visible={showPrivacyPolicy}
                animationType="slide"
                onRequestClose={() => setShowPrivacyPolicy(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.modalHeader}>
                        <IconButton
                            icon="close"
                            size={24}
                            onPress={() => setShowPrivacyPolicy(false)}
                        />
                    </View>
                    <PrivacyPolicyScreen />
                </View>
            </Modal>

            <ThemedAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                onDismiss={hideAlert}
                buttons={alert.buttons}
            />
        </View>
    );
}

// Helper Components
const SectionHeader: React.FC<{ icon: string; title: string; theme: AppTheme }> = ({ icon, title, theme }) => (
    <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title}</Text>
    </View>
);

const SettingItem: React.FC<{
    icon: string;
    label: string;
    value?: string;
    theme: AppTheme;
    onPress?: () => void;
    expandable?: boolean;
}> = ({ icon, label, value, theme, onPress, expandable }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
        <MaterialCommunityIcons name={icon as any} size={24} color={theme.colors.onSurfaceVariant} />
        <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>{label}</Text>
        {value && <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>{value}</Text>}
        {expandable && (
            <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />
        )}
    </Pressable>
);

const ToggleSettingItem: React.FC<{
    icon: string;
    label: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    theme: AppTheme;
    disabled?: boolean;
}> = ({ icon, label, subtitle, value, onValueChange, theme, disabled }) => (
    <View style={styles.settingItem}>
        <MaterialCommunityIcons name={icon as any} size={24} color={theme.colors.onSurfaceVariant} />
        <View style={styles.settingTextContainer}>
            <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>{label}</Text>
            {subtitle && <Text style={[styles.settingSubtitle, { color: theme.colors.outline }]}>{subtitle}</Text>}
        </View>
        <Switch value={value} onValueChange={onValueChange} color={theme.colors.primary} disabled={disabled} />
    </View>
);

const RadioGroup: React.FC<{
    options: Array<{ key: string; label: string }>;
    selected: string;
    onSelect: (key: string) => void;
    theme: AppTheme;
}> = ({ options, selected, onSelect, theme }) => (
    <View style={styles.radioGroup}>
        {options.map((option) => (
            <Pressable
                key={option.key}
                style={styles.radioItem}
                onPress={() => onSelect(option.key)}
            >
                <RadioButton.Android
                    value={option.key}
                    status={selected === option.key ? 'checked' : 'unchecked'}
                    onPress={() => onSelect(option.key)}
                    color={theme.colors.primary}
                />
                <Text style={[styles.radioLabel, { color: theme.colors.onSurface }]}>{option.label}</Text>
            </Pressable>
        ))}
    </View>
);

const ChangelogView: React.FC<{ changelog: typeof CHANGELOG; theme: AppTheme }> = ({ changelog, theme }) => (
    <View style={styles.changelogContainer}>
        {changelog.map((version, index) => (
            <View key={version.version} style={styles.changelogVersion}>
                <View style={styles.versionHeader}>
                    <Text style={[styles.versionNumber, { color: theme.colors.primary }]}>
                        v{version.version}
                    </Text>
                    <Text style={[styles.versionDate, { color: theme.colors.onSurfaceVariant }]}>
                        {version.date}
                    </Text>
                </View>
                {version.changes.map((change, idx) => (
                    <View key={idx} style={styles.changeItem}>
                        <MaterialCommunityIcons name="circle-small" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text style={[styles.changeText, { color: theme.colors.onSurface }]}>{change}</Text>
                    </View>
                ))}
                {index < changelog.length - 1 && <Divider style={styles.changelogDivider} />}
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionDivider: {
        marginVertical: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginBottom: 4,
        borderRadius: 12,
    },
    settingItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    settingValue: {
        fontSize: 14,
        marginLeft: 'auto',
        marginRight: 8,
    },
    radioGroup: {
        paddingLeft: 64,
        paddingRight: 24,
        paddingBottom: 8,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    radioText: {
        fontSize: 14,
        marginLeft: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    changelogContent: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    changeItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 8,
    },
    changeText: {
        fontSize: 14,
        flex: 1,
    },
    radioLabel: {
        fontSize: 14,
        marginLeft: 8,
    },
    changelogContainer: {
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    changelogVersion: {
        paddingVertical: 12,
    },
    versionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    versionNumber: {
        fontSize: 16,
        fontWeight: '700',
    },
    versionDate: {
        fontSize: 12,
    },
    changelogDivider: {
        marginTop: 12,
    },
    appInfoContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
    },
    appVersion: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
    },
    appCopyright: {
        fontSize: 14,
        marginTop: 4,
    },
    appTagline: {
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 8,
        paddingTop: 8,
    },
});
