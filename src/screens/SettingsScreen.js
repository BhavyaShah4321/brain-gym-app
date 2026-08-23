/**
 * OVERLOAD SettingsScreen
 * Premium Luxury Light Theme — matching Home/Training/Progress/Profile aesthetic
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { triggerHaptic } from '../utils/haptics';
import { usePlayer } from '../context';

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
  goldMuted: 'rgba(197, 165, 90, 0.10)',

  sage: '#6B8F71',
  sageMuted: 'rgba(107, 143, 113, 0.10)',

  rose: '#C4787A',

  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
};

const SCREEN_PAD = 24;

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { playerProfile, updateSettings } = usePlayer();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (playerProfile?.settings) {
      setHapticsEnabled(playerProfile.settings.haptics !== false);
      setSoundEnabled(playerProfile.settings.sound !== false);
    }
  }, [playerProfile?.settings]);

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 12
      : Math.max(insets.top, 20) + 8;

  const bottomPad = Math.max(insets.bottom, 20) + 20;

  const toggleHaptics = (val) => {
    setHapticsEnabled(val);
    if (val) triggerHaptic('medium');
    updateSettings({ haptics: val });
  };

  const toggleSound = (val) => {
    triggerHaptic('light');
    setSoundEnabled(val);
    updateSettings({ sound: val });
  };

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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={P.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle}>PREFERENCES</Text>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* ── SENSORY & FEEDBACK ── */}
        <Text style={styles.sectionLabel}>SENSORY & FEEDBACK</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: P.navyMuted }]}>
                <Ionicons name="finger-print-outline" size={18} color={P.navy} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingSubtext}>
                  Tactile micro-impulses on response inputs
                </Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={toggleHaptics}
              trackColor={{ false: P.surfaceAlt, true: P.navy }}
              thumbColor={P.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: P.sageMuted }]}>
                <Ionicons name="volume-high-outline" size={18} color={P.sage} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Acoustic Cues</Text>
                <Text style={styles.settingSubtext}>
                  Auditory verification tones for task cycles
                </Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: P.surfaceAlt, true: P.navy }}
              thumbColor={P.surface}
            />
          </View>
        </View>

        {/* ── APPEARANCE ── */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: P.goldMuted }]}>
                <Ionicons name="color-palette-outline" size={18} color={P.gold} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Theme Mode</Text>
                <Text style={styles.settingSubtext}>
                  Clean editorial light theme
                </Text>
              </View>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>Light</Text>
            </View>
          </View>
        </View>

        {/* ── TRAINING ENGINE ── */}
        <Text style={styles.sectionLabel}>TRAINING ENGINE</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: P.navyMuted }]}>
                <Ionicons name="options-outline" size={18} color={P.navy} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Difficulty Adaptation</Text>
                <Text style={styles.settingSubtext}>
                  Automatic real-time difficulty scaling
                </Text>
              </View>
            </View>
            <View style={[styles.infoBadge, { backgroundColor: P.sageMuted, borderColor: P.sage + '30' }]}>
              <Text style={[styles.infoBadgeText, { color: P.sage }]}>Active</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: P.sageMuted }]}>
                <Ionicons name="git-branch-outline" size={18} color={P.sage} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Baseline Protocol</Text>
                <Text style={styles.settingSubtext}>
                  Calibrated across Working Memory
                </Text>
              </View>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>Tier 1</Text>
            </View>
          </View>
        </View>

        {/* ── ABOUT OVERLOAD ── */}
        <Text style={styles.sectionLabel}>ABOUT OVERLOAD</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: P.navyMuted }]}>
                <Ionicons name="information-circle-outline" size={18} color={P.navy} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Version</Text>
              </View>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: P.navyMuted }]}>
                <Ionicons name="code-outline" size={18} color={P.navy} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Architecture</Text>
              </View>
            </View>
            <Text style={styles.settingValue}>React Native · Expo</Text>
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: bottomPad }} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
  },

  /* ── Section Labels ── */
  sectionLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },

  /* ── Card ── */
  card: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
  },

  /* ── Setting Row ── */
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: typography.weights.semibold,
    color: P.text,
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 12,
    color: P.textSec,
    lineHeight: 17,
  },
  settingValue: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: P.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* ── Info Badge ── */
  infoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: P.surfaceAlt,
    borderWidth: 1,
    borderColor: P.border,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: P.border,
    marginLeft: 64,
  },
});
