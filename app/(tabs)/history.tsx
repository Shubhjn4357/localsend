import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, Button, IconButton, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '@/stores/historyStore';
import type { AppTheme } from '@/theme/colors';
import { Platform } from 'react-native';

export default function HistoryScreen() {
    const { t } = useTranslation();
    const theme = useTheme<AppTheme>();
    const history = useHistoryStore((state) => state.history);
    const clearHistory = useHistoryStore((state) => state.clearHistory);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date: string): string => {
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    };

    const handleOpenFolder = async () => {
        if (Platform.OS === 'web') {
            alert('Open folder feature is not available on web');
            return;
        }

        // On Android/iOS, we show where files are stored
        alert('Files are saved in your device\'s Downloads folder');
    };

    const handleClearHistory = () => {
        if (history.length === 0) return;

        // Should show a confirmation dialog
        clearHistory();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={
                    theme.dark
                        ? ['#0F172A', '#1E293B', '#334155']
                        : ['#F8FAFC', '#E0E7FF', '#FCE7F3']
                }
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
                    {t('history.title')}
                </Text>
            </View>

            {/* Action Buttons */}
            {history.length > 0 && (
                <View style={styles.actionsContainer}>
                    <Button
                        mode="contained-tonal"
                        onPress={handleOpenFolder}
                        icon="folder-open"
                        style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
                        textColor={theme.colors.onPrimaryContainer}
                    >
                        {t('history.openFolder')}
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={handleClearHistory}
                        icon="delete"
                        style={styles.actionButton}
                        textColor={theme.colors.error}
                    >
                        {t('history.deleteHistory')}
                    </Button>
                </View>
            )}

            {/* History List */}
            {history.length === 0 ? (
                <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                        name="history"
                        size={80}
                        color={theme.colors.outline}
                    />
                    <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
                        {t('history.empty')}
                    </Text>
                </Animated.View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {history
                        .filter((item) => item !== null)
                        .map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeIn.delay(index * 50)}
                                style={[
                                    styles.historyItem,
                                    {
                                        backgroundColor: theme.colors.surface,
                                        borderColor: theme.colors.outline + '30',
                                    },
                                ]}
                            >
                                <View style={styles.historyItemHeader}>
                                    <MaterialCommunityIcons
                                        name={item.direction === 'sent' ? 'upload' : 'download'}
                                        size={24}
                                        color={item.direction === 'sent' ? theme.colors.primary : theme.colors.secondary}
                                    />
                                    <View style={styles.historyItemInfo}>
                                        <Text style={[styles.historyItemTitle, { color: theme.colors.onSurface }]}>
                                            {item.files.length > 1
                                                ? `${item.files.length} files`
                                                : item.files[0]?.name || 'Unknown file'}
                                        </Text>
                                        <Text style={[styles.historyItemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                                            {item.deviceName} • {formatFileSize(item.totalSize)}
                                        </Text>
                                        <Text style={[styles.historyItemDate, { color: theme.colors.outline }]}>
                                            {formatDate(new Date(item.timestamp).toISOString())}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name={item.status === 'completed' ? 'check-circle' : 'alert-circle'}
                                        size={24}
                                        color={
                                            item.status === 'completed'
                                                ? theme.colors.primary
                                                : theme.colors.error
                                        }
                                    />
                                </View>
                            </Animated.View>
                        ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingTop: 48,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    historyItem: {
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    historyItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    historyItemInfo: {
        flex: 1,
    },
    historyItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    historyItemSubtitle: {
        fontSize: 14,
        marginBottom: 2,
    },
    historyItemDate: {
        fontSize: 12,
    },
});
