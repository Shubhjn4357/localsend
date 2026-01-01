import React from 'react';
import { StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';
import type { AppTheme } from '../../theme/colors';
import { GlassMorphismStyles } from '../../theme/glassMorphism';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = 20,
    onPress,
}) => {
    const theme = useTheme<AppTheme>();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(0.98);
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = withSpring(1);
        }
    };

    const glassStyle = theme.dark
        ? GlassMorphismStyles.glassDark
        : GlassMorphismStyles.glassLight;

    return (
        <Animated.View
            style={[styles.container, animatedStyle, style]}
            onTouchStart={handlePressIn}
            onTouchEnd={handlePressOut}
            onPress={onPress}
        >
            <BlurView
                intensity={intensity}
                tint={theme.dark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[glassStyle, GlassMorphismStyles.glassCard, styles.content]}>
                {children}
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 16,
    },
    content: {
        backgroundColor: 'transparent',
    },
});
