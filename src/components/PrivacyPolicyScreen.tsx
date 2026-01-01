import React from 'react';
import { StyleSheet, ScrollView, View, Linking } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme/colors';

export const PrivacyPolicyScreen: React.FC = () => {
    const theme = useTheme<AppTheme>();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <MaterialCommunityIcons name="shield-lock" size={48} color={theme.colors.primary} />

                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                    Privacy Policy
                </Text>

                <Text style={[styles.lastUpdated, { color: theme.colors.onSurfaceVariant }]}>
                    Last updated: January 2026
                </Text>

                <Divider style={styles.divider} />

                <Section
                    icon="information"
                    title="What is LocalSend?"
                    content="LocalSend is a free, open-source app that allows you to securely share files and messages with nearby devices over your local network without needing an internet connection."
                    theme={theme}
                />

                <Section
                    icon="shield-check"
                    title="Data Collection"
                    content="LocalSend does NOT collect, store, or transmit any personal data to external servers. All file transfers happen directly between devices on your local network."
                    theme={theme}
                />

                <Section
                    icon="network-off"
                    title="No Internet Required"
                    content="Your files never leave your local network. LocalSend works entirely offline and does not send any data to the internet."
                    theme={theme}
                />

                <Section
                    icon="eye-off"
                    title="No Tracking"
                    content="We do not use any analytics, tracking, or telemetry. Your privacy is completely protected."
                    theme={theme}
                />

                <Section
                    icon="lock"
                    title="Local Storage"
                    content="App settings and transfer history are stored locally on your device only. This data is never shared or uploaded anywhere."
                    theme={theme}
                />

                <Section
                    icon="wifi"
                    title="Network Permissions"
                    content="LocalSend requires network permissions to discover devices on your local Wi-Fi network and facilitate file transfers."
                    theme={theme}
                />

                <Section
                    icon="folder"
                    title="Storage Permissions"
                    content="Storage permissions are needed to save received files and access files you want to send."
                    theme={theme}
                />

                <Section
                    icon="open-source-initiative"
                    title="Open Source"
                    content="LocalSend is open-source software. You can review the source code to verify our privacy claims."
                    theme={theme}
                />

                <Divider style={styles.divider} />

                <Text style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
                    For more information, visit localsend.org
                </Text>

                <Text style={[styles.footer, { color: theme.colors.outline }]}>
                    © 2026 Shubh Jain
                </Text>
            </View>
        </ScrollView>
    );
};

const Section: React.FC<{ icon: string; title: string; content: string; theme: AppTheme }> = ({
    icon,
    title,
    content,
    theme,
}) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        </View>
        <Text style={[styles.sectionContent, { color: theme.colors.onSurfaceVariant }]}>
            {content}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 14,
        marginBottom: 24,
    },
    divider: {
        width: '100%',
        marginVertical: 24,
    },
    section: {
        width: '100%',
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    sectionContent: {
        fontSize: 14,
        lineHeight: 20,
        paddingLeft: 28,
    },
    footer: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
});
