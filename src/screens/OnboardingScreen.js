/**
 * OVERLOAD OnboardingScreen
 * Premium light-theme onboarding with luxury color palette,
 * generous spacing, and clean game-grade layout.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { ROUTES } from '../constants/routes';
import { triggerHaptic } from '../utils/haptics';

/* ── Premium Luxury Palette ── */
const palette = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F0EB',
  border: '#E8E4DE',

  navy: '#1B2A4A',
  navyMuted: 'rgba(27, 42, 74, 0.08)',
  navyBorder: 'rgba(27, 42, 74, 0.15)',

  gold: '#C5A55A',
  goldLight: '#D4B96E',
  goldMuted: 'rgba(197, 165, 90, 0.10)',
  goldBorder: 'rgba(197, 165, 90, 0.25)',

  champagne: '#E8D5A3',

  sage: '#6B8F71',
  sageMuted: 'rgba(107, 143, 113, 0.10)',

  rose: '#C4787A',
  roseMuted: 'rgba(196, 120, 122, 0.10)',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B7B',
  textMuted: '#9E9EAE',
};

const SLIDES = [
  {
    id: 1,
    tag: 'COGNITIVE PERFORMANCE',
    title: 'Train your mind.',
    description:
      'Personalized cognitive drills engineered to expand working memory, attention, reaction velocity, and strategic decision making.',
    icon: 'infinite-outline',
    accent: palette.navy,
    accentMuted: palette.navyMuted,
    accentBorder: palette.navyBorder,
    glowColor: 'rgba(27, 42, 74, 0.12)',
  },
  {
    id: 2,
    tag: '8 INDEPENDENT FACULTIES',
    title: 'Challenge core systems.',
    description:
      'Targeted protocols calibrated across working memory, focus, reaction speed, mental throughput, spatial logic, and cognitive flexibility.',
    icon: 'grid-outline',
    accent: palette.gold,
    accentMuted: palette.goldMuted,
    accentBorder: palette.goldBorder,
    glowColor: 'rgba(197, 165, 90, 0.14)',
  },
  {
    id: 3,
    tag: 'ADAPTIVE TRAINING',
    title: 'Grow at your peak pace.',
    description:
      'Drills dynamically calibrate in real time based on your precision, accuracy, and neural response latency.',
    icon: 'pulse-outline',
    accent: palette.sage,
    accentMuted: palette.sageMuted,
    accentBorder: 'rgba(107, 143, 113, 0.25)',
    glowColor: 'rgba(107, 143, 113, 0.12)',
  },
];

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 0) + 20
      : Math.max(insets.top, 20) + 12;

  const bottomPad =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 0) + 20
      : Math.max(insets.bottom, 20) + 12;

  const animateTransition = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -16,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(16);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    triggerHaptic('medium');
    if (currentIndex < SLIDES.length - 1) {
      animateTransition(() => setCurrentIndex(currentIndex + 1));
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    triggerHaptic('light');
    handleComplete();
  };

  const handleComplete = () => {
    triggerHaptic('success');
    navigation.replace(ROUTES.MAIN_TABS);
  };

  const currentSlide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={styles.brandText}>OVERLOAD</Text>

        {!isLast ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            style={styles.skipBtn}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons
              name="chevron-forward"
              size={13}
              color={palette.textMuted}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      {/* ── HERO VISUAL ── */}
      <View style={styles.heroSection}>
        <View
          style={[styles.heroOuter, { backgroundColor: currentSlide.glowColor }]}
        >
          <View
            style={[
              styles.heroMid,
              { backgroundColor: `${currentSlide.accent}0A` },
            ]}
          >
            <View
              style={[
                styles.heroInner,
                {
                  backgroundColor: currentSlide.accentMuted,
                  borderColor: currentSlide.accentBorder,
                },
              ]}
            >
              <Ionicons
                name={currentSlide.icon}
                size={48}
                color={currentSlide.accent}
              />
            </View>
          </View>
        </View>
      </View>

      {/* ── CONTENT ── */}
      <Animated.View
        style={[
          styles.contentSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                index <= currentIndex && {
                  backgroundColor: currentSlide.accent,
                },
              ]}
            />
          ))}
        </View>

        {/* Tag */}
        <View
          style={[
            styles.tagBadge,
            {
              backgroundColor: currentSlide.accentMuted,
              borderColor: currentSlide.accentBorder,
            },
          ]}
        >
          <Text style={[styles.tagText, { color: currentSlide.accent }]}>
            {currentSlide.tag}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{currentSlide.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{currentSlide.description}</Text>
      </Animated.View>

      {/* ── CTA BUTTON ── */}
      <View style={[styles.bottomSection, { paddingBottom: bottomPad }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleNext}
          style={styles.ctaWrapper}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Get Started' : 'Continue'}
        >
          <LinearGradient
            colors={
              isLast
                ? [palette.gold, palette.goldLight]
                : [currentSlide.accent, `${currentSlide.accent}DD`]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>
              {isLast ? 'Get Started' : 'Continue'}
            </Text>
            <View style={styles.ctaArrow}>
              <Ionicons
                name="arrow-forward"
                size={17}
                color={isLast ? palette.navy : '#FFFFFF'}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingHorizontal: 28,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  brandText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: palette.textPrimary,
    letterSpacing: 3,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  skipText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    color: palette.textMuted,
    marginRight: 2,
  },
  skipPlaceholder: {
    width: 68,
  },

  /* ── Hero Visual ── */
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMid: {
    width: 144,
    height: 144,
    borderRadius: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Content ── */
  contentSection: {
    alignItems: 'center',
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 28,
  },
  progressSegment: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.surfaceAlt,
  },
  tagBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginBottom: 20,
  },
  tagText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: typography.weights.bold,
    color: palette.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  description: {
    fontSize: typography.sizes.bodyLarge,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 310,
  },

  /* ── CTA ── */
  bottomSection: {
    width: '100%',
    paddingTop: 24,
  },
  ctaWrapper: {
    width: '100%',
    borderRadius: radii.button,
    shadowColor: '#1B2A4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: typography.sizes.bodyLarge + 1,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginRight: 12,
  },
  ctaArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
