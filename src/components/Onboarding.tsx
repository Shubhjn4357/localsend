import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, Pressable} from 'react-native';
import { Text, Button } from 'react-native-paper';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppTheme } from '@/theme/colors';
import { useTheme } from 'react-native-paper';
import { LocalStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/storage';

const { width } = Dimensions.get('window');

interface OnboardingScreen {
    icon: string;
    title: string;
    description: string;
    color: string;
}

const screens: OnboardingScreen[] = [
    {
        icon: 'swap-horizontal',
        title: 'Share Files Instantly',
        description: 'Send and receive files between devices on your local network without internet.',
        color: '#6366f1',
    },
    {
        icon: 'devices',
        title: 'Auto-Discover Devices',
        description: 'Nearby devices appear automatically. Just tap and send - no setup required!',
        color: '#8b5cf6',
    },
    {
        icon: 'security',
        title: 'Secure & Private',
        description: 'All transfers happen directly between devices on your local network. No cloud, no tracking.',
        color: '#ec4899',
   },
    {
        icon: 'lightning-bolt',
        title: 'Blazing Fast',
        description: 'Transfer files at full Wi-Fi speed with support for images, videos, documents, and more.',
        color: '#f59e0b',
    },
];

interface OnboardingProps {
    onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();
    const isLast = currentIndex === screens.length - 1;

    const handleNext = () => {
        if (isLast) {
            handleComplete();
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = async () => {
        await LocalStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
        onComplete();
    };

    const currentScreen = screens[currentIndex];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Header */}
            <View style={styles.header}>
                {!isLast && (
                    <Pressable onPress={handleSkip}>
                        <Text style={[styles.skipText, { color: theme.colors.primary }]}>
                            Skip
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Content */}
            <Animated.View 
                key={currentIndex}
                entering={SlideInRight}
                exiting={SlideOutLeft}
                style={styles.content}
            >
                <View style={[styles.iconContainer, { backgroundColor: currentScreen.color + '20' }]}>
                    <MaterialCommunityIcons 
                        name={currentScreen.icon as any} 
                        size={80} 
                        color={currentScreen.color} 
                    />
                </View>

                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                    {currentScreen.title}
                </Text>

                <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                    {currentScreen.description}
                </Text>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {screens.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex
                                    ? { backgroundColor: theme.colors.primary, width: 24 }
                                    : { backgroundColor: theme.colors.surfaceVariant }
                            ]}
                        />
                    ))}
                </View>

                {/* Next Button */}
                <Button
                    mode="contained"
                    onPress={handleNext}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    {isLast ? 'Get Started' : 'Next'}
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'flex-end',
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    button: {
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 8,
    },
});
