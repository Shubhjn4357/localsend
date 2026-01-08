import React from 'react';
import { StyleSheet, View, Modal, Pressable, Image, Dimensions, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import type { AppTheme } from '@/theme/colors';
import { isImage, isVideo } from '@/utils/constants';
import type { PickedFile } from '@/services/pickerService';

interface FilePreviewModalProps {
    visible: boolean;
    file: PickedFile | null;
    onClose: () => void;
    theme: AppTheme;
}

const { width, height } = Dimensions.get('window');

/**
 * Full-screen modal for previewing files
 * Supports images, videos, and other file types
 */
export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    visible,
    file,
    onClose,
    theme
}) => {
    if (!file) return null;

    const showImagePreview = isImage(file.name);
    const showVideoPreview = isVideo(file.name);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}>
                {/* Header */}
                <Animated.View entering={FadeIn} style={styles.header}>
                    <Text style={[styles.fileName, { color: '#fff' }]} numberOfLines={1}>
                        {file.name}
                    </Text>
                    <IconButton
                        icon="close"
                        size={24}
                        iconColor="#fff"
                        onPress={onClose}
                    />
                </Animated.View>

                {/* Preview Content */}
                <Animated.View entering={SlideInDown} style={styles.content}>
                    {showImagePreview ? (
                        <ScrollView 
                            maximumZoomScale={5}
                            minimumZoomScale={1}
                            bouncesZoom
                            contentContainerStyle={styles.imageContainer}
                        >
                            <Image
                                source={{ uri: file.uri }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </ScrollView>
                    ) : showVideoPreview ? (
                        <View style={styles.videoContainer}>
                            <Image
                                source={{ uri: file.uri }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                            <View style={styles.videoOverlay}>
                                <MaterialCommunityIcons name="play-circle-outline" size={80} color="#fff" />
                                <Text style={styles.videoText}>Video Preview</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.unsupportedContainer}>
                            <MaterialCommunityIcons name="file-alert-outline" size={80} color="#fff" />
                            <Text style={styles.unsupportedText}>Preview not available</Text>
                            <Text style={styles.unsupportedSubtext}>{file.name}</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Footer */}
                <Animated.View entering={FadeIn.delay(200)} style={styles.footer}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="file" size={20} color="#fff" />
                        <Text style={styles.infoText}>
                            {formatFileSize(file.size || 0)}
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height * 0.6,
    },
    image: {
        width: width,
        height: height * 0.6,
    },
    videoContainer: {
        width: width,
        height: height * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 12,
    },
    unsupportedContainer: {
        alignItems: 'center',
        padding: 32,
    },
    unsupportedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    unsupportedSubtext: {
        color: '#ccc',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    footer: {
        padding: 16,
        paddingBottom: 32,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
    },
});
