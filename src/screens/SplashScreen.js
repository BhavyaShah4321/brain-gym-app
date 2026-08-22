/**
 * OVERLOAD SplashScreen
 * Premium luxury light-theme entrance with refined typography.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { ROUTES } from '../constants/routes';
import { triggerHaptic } from '../utils/haptics';

/* ── Premium Luxury Palette (matching Onboarding) ── */
const palette = {
  bg: '#FAF8F5',
  navy: '#1B2A4A',
  navyMuted: 'rgba(27, 42, 74, 0.08)',
  navyBorder: 'rgba(27, 42, 74, 0.15)',
  gold: '#C5A55A',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B7B',
  textMuted: '#9E9EAE',
};

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const tagAnim = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(0, 0)
      : Math.max(insets.top, 0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(tagAnim, {
        toValue: 1,
        duration: 900,
        delay: 250,
        useNativeDriver: true,
      }),
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: 600,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace(ROUTES.ONBOARDING);
    }, 2400);

    return () => clearTimeout(timer);
  }, [navigation]);

  const handleSkip = () => {
    triggerHaptic('light');
    navigation.replace(ROUTES.ONBOARDING);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleSkip}
      style={styles.container}
      accessibilityLabel="OVERLOAD Splash Screen. Tap to continue."
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Tag pill */}
        <Animated.View
          style={[
            styles.tagPill,
            { opacity: tagAnim },
          ]}
        >
          <Text style={styles.tagText}>COGNITIVE PERFORMANCE</Text>
        </Animated.View>

        {/* Brand title */}
        <Text style={styles.brandTitle}>OVERLOAD</Text>

        {/* Tagline */}
        <Animated.View style={[styles.taglineBlock, { opacity: tagAnim }]}>
          <Text style={styles.tagline}>Train the way you think.</Text>
          <View style={styles.divider} />
          <Text style={styles.subtext}>
            Adaptive neurocognitive performance platform
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Text style={styles.versionText}>CORE v1.0</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },

  /* Tag pill */
  tagPill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: palette.navyMuted,
    borderWidth: 1,
    borderColor: palette.navyBorder,
    marginBottom: 32,
  },
  tagText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: palette.navy,
    letterSpacing: 1.5,
  },

  /* Brand */
  brandTitle: {
    fontSize: 36,
    fontWeight: typography.weights.heavy,
    color: palette.textPrimary,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
  },

  /* Tagline block */
  taglineBlock: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 20,
    fontWeight: typography.weights.semibold,
    color: palette.textPrimary,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  divider: {
    width: 28,
    height: 2,
    backgroundColor: palette.gold,
    marginVertical: 18,
    borderRadius: 1,
  },
  subtext: {
    fontSize: typography.sizes.body,
    color: palette.textSecondary,
    textAlign: 'center',
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    width: '100%',
  },
  versionText: {
    fontSize: typography.sizes.micro,
    color: palette.textMuted,
    letterSpacing: 1.5,
  },
});
