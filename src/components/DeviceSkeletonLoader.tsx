import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SKELETON_HEIGHT = 80;

export const DeviceSkeletonLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Animated.View
                    key={index}
                    entering={FadeIn.delay(index * 100)}
                    exiting={FadeOut}
                    style={styles.container}
                >
                    <LinearGradient
                        colors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    >
                        <View style={styles.content}>
                            <View style={styles.avatar} />
                            <View style={styles.textContainer}>
                                <View style={styles.title} />
                                <View style={styles.subtitle} />
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        height: SKELETON_HEIGHT,
    },
    gradient: {
        flex: 1,
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#D0D0D0',
    },
    textContainer: {
        marginLeft: 16,
        flex: 1,
    },
    title: {
        height: 18,
        width: '60%',
        backgroundColor: '#D0D0D0',
        borderRadius: 4,
        marginBottom: 8,
    },
    subtitle: {
        height: 14,
        width: '40%',
        backgroundColor: '#D0D0D0',
        borderRadius: 4,
    },
});
