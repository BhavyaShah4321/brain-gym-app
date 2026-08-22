/**
 * OVERLOAD ProfileScreen
 * Premium Luxury Light Theme — Local Player Profile & Performance Telemetry
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import { triggerHaptic } from '../utils/haptics';

/* ── Premium Luxury Palette ── */
const P = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F2ED',
  border: '#E8E4DE',

  navy: '#1B2A4A',
  navyLight: '#2C3E5A',
  navyMuted: 'rgba(27, 42, 74, 0.06)',
  navySoft: 'rgba(27, 42, 74, 0.10)',
  navyBorder: 'rgba(27, 42, 74, 0.12)',

  gold: '#C5A55A',
  goldLight: '#D4B96E',
  goldMuted: 'rgba(197, 165, 90, 0.10)',
  goldBorder: 'rgba(197, 165, 90, 0.25)',

  sage: '#6B8F71',
  sageMuted: 'rgba(107, 143, 113, 0.10)',

  rose: '#C4787A',
  roseMuted: 'rgba(196, 120, 122, 0.10)',

  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
};

const SCREEN_PAD = 24;

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userProfile, playerId } = useAuth();

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 12
      : Math.max(insets.top, 20) + 8;

  const bottomPad = Math.max(insets.bottom, 20) + 20;

  const handleSettingsPress = () => {
    navigation.navigate(ROUTES.SETTINGS);
  };

  // Extract real user values with clean fallback states
  const displayName = userProfile?.displayName || 'Operator';
  const operatorId = userProfile?.profile?.operatorId || playerId || 'OP-1001';
  const stats = userProfile?.stats || {};

  const totalDrills = stats.totalDrills || 0;
  const cognitiveIndex = totalDrills > 0 ? `${stats.cognitiveIndex || 0}` : '0';
  const bestScore = totalDrills > 0 ? `${Math.max(stats.cognitiveIndex || 0, 800)}` : '—';
  const streakDays = `${stats.currentStreak || 0} days`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} translucent />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPad, paddingHorizontal: SCREEN_PAD },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>LOCAL PLAYER</Text>
            <Text style={styles.userName}>Profile</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSettingsPress}
            style={styles.settingsBtn}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color={P.textSec} />
          </TouchableOpacity>
        </View>

        {/* ── PROFILE CARD ── */}
        <LinearGradient
          colors={['#F5F2ED', '#EDE9E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={28} color={P.navy} />
            </View>
            <View style={styles.profileTextCol}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileTier}>
                {operatorId} · Local Offline Profile
              </Text>
              <View style={styles.guestBadge}>
                <Text style={styles.guestBadgeText}>
                  Active Player
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── PERFORMANCE OVERVIEW ── */}
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatBox
              value={cognitiveIndex}
              label="Cognitive Index"
              icon="trending-up-outline"
              accent={P.navy}
              accentBg={P.navyMuted}
            />
            <StatBox
              value={`${totalDrills}`}
              label="Total Drills"
              icon="checkmark-done-outline"
              accent={P.sage}
              accentBg={P.sageMuted}
            />
          </View>
          <View style={styles.statsRow}>
            <StatBox
              value={bestScore}
              label="Best Score"
              icon="trophy-outline"
              accent={P.gold}
              accentBg={P.goldMuted}
            />
            <StatBox
              value={streakDays}
              label="Current Streak"
              icon="flame-outline"
              accent={P.rose}
              accentBg={P.roseMuted}
            />
          </View>
        </View>

        {/* ── PREFERENCES & PLATFORM ── */}
        <Text style={styles.sectionTitle}>Preferences & Platform</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSettingsPress}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: P.navyMuted }]}>
                <Ionicons name="settings-outline" size={18} color={P.navy} />
              </View>
              <Text style={styles.menuTitle}>App Preferences & Sensory</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={P.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.ONBOARDING)}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: P.sageMuted }]}>
                <Ionicons name="help-circle-outline" size={18} color={P.sage} />
              </View>
              <Text style={styles.menuTitle}>Platform Introduction</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={P.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: P.goldMuted }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={P.gold} />
              </View>
              <Text style={styles.menuTitle}>Data Storage</Text>
            </View>
            <View style={styles.dataBadge}>
              <Text style={styles.dataBadgeText}>
                Local Device
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: bottomPad }} />
      </ScrollView>
    </View>
  );
}

/* ── Inline StatBox component ── */
function StatBox({ value, label, icon, accent, accentBg }) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statIconBox, { backgroundColor: accentBg }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: P.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  userName: {
    fontSize: 30,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Profile Card ── */
  profileCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 20,
    marginBottom: 28,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: P.navyMuted,
    borderWidth: 2,
    borderColor: P.navyBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  profileTier: {
    fontSize: 13,
    color: P.textSec,
    marginBottom: 8,
  },
  guestBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: P.navyMuted,
    borderWidth: 1,
    borderColor: P.navyBorder,
  },
  guestBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },

  /* ── Section Headers ── */
  sectionTitle: {
    fontSize: 21,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
    marginBottom: 16,
  },

  /* ── Stats Grid ── */
  statsGrid: {
    gap: 12,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    minHeight: 110,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: P.textSec,
  },

  /* ── Menu Card ── */
  menuCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: typography.weights.semibold,
    color: P.text,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: P.border,
    marginLeft: 64,
  },
  dataBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: P.surfaceAlt,
    borderWidth: 1,
    borderColor: P.border,
  },
  dataBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
  },
});
