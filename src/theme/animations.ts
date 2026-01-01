import { Easing, withSpring, withTiming } from 'react-native-reanimated';

export const AnimationConfigs = {
    spring: {
        damping: 15,
        stiffness: 150,
        mass: 0.5,
    },
    springBouncy: {
        damping: 10,
        stiffness: 100,
        mass: 0.8,
    },
    timing: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
    timingFast: {
        duration: 150,
        easing: Easing.out(Easing.cubic),
    },
    timingSlow: {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
    },
};

export const createSpringAnimation = (config = AnimationConfigs.spring) => {
    return withSpring(1, config);
};

export const createTimingAnimation = (
    toValue: number,
    config = AnimationConfigs.timing
) => {
    return withTiming(toValue, config);
};

// Preset animations
export const fadeIn = (duration = 300) =>
    withTiming(1, { duration, easing: Easing.ease });

export const fadeOut = (duration = 300) =>
    withTiming(0, { duration, easing: Easing.ease });

export const scaleIn = () =>
    withSpring(1, AnimationConfigs.spring);

export const scaleOut = () =>
    withSpring(0.95, AnimationConfigs.springBouncy);
