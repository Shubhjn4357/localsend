import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';

interface CurlySpinnerProps {
    size?: number;
    color?: string;
}

export const CurlySpinner: React.FC<CurlySpinnerProps> = ({ size = 80, color = '#6366f1' }) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 2000,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    return (
        <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <G>
                    {/* Curly swirl design */}
                    <Path
                        d="M50 10 C65 10, 75 20, 75 35 C75 45, 70 50, 60 50 C55 50, 52 48, 50 45"
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <Path
                        d="M50 90 C35 90, 25 80, 25 65 C25 55, 30 50, 40 50 C45 50, 48 52, 50 55"
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <Path
                        d="M10 50 C10 35, 20 25, 35 25 C45 25, 50 30, 50 40 C50 45, 48 48, 45 50"
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <Path
                        d="M90 50 C90 65, 80 75, 65 75 C55 75, 50 70, 50 60 C50 55, 52 52, 55 50"
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    {/* Inner curls */}
                    <Path
                        d="M50 30 C58 30, 62 34, 62 42 C62 46, 60 48, 56 48"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                    <Path
                        d="M50 70 C42 70, 38 66, 38 58 C38 54, 40 52, 44 52"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                    <Path
                        d="M30 50 C30 42, 34 38, 42 38 C46 38, 48 40, 48 44"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                    <Path
                        d="M70 50 C70 58, 66 62, 58 62 C54 62, 52 60, 52 56"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                    {/* Center dot */}
                    <Path
                        d="M50 50 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"
                        fill={color}
                        opacity="0.8"
                    />
                </G>
            </Svg>
        </Animated.View>
    );
};
