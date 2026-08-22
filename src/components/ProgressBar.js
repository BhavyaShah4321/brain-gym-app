/**
 * OVERLOAD ProgressBar
 * Premium luxury progress indicator with warm palette
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/* ── Luxury Palette ── */
const P = {
  gold: '#C5A55A',
  goldLight: '#D4B96E',
  surfaceAlt: '#F5F2ED',
};

export default function ProgressBar({
  progress = 0,
  color = P.gold,
  gradientColors,
  trackColor = P.surfaceAlt,
  height = 6,
  animated = true,
  style,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: clamped,
        duration: 350,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(clamped);
    }
  }, [progress, animated]);

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthInterpolated,
            borderRadius: height / 2,
            backgroundColor: gradientColors ? 'transparent' : color,
          },
        ]}
      >
        {gradientColors ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
  gradientFill: {
    width: '100%',
    height: '100%',
  },
});
