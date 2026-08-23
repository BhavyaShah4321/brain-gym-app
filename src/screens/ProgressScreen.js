/**
 * OVERLOAD ProgressScreen
 * Premium Luxury Light Theme — Cognitive performance telemetry & trend analytics
 * Connected to Local-First storage
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import { radii } from '../theme/spacing';
import { usePlayer } from '../context';
import storageService from '../services/storageService';
import { useFocusEffect } from '@react-navigation/native';

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
  roseMuted: 'rgba(196, 120, 122, 0.10)',

  lavender: '#8B7EC8',
  lavenderMuted: 'rgba(139, 126, 200, 0.10)',

  cyan: '#5BA4B5',
  cyanMuted: 'rgba(91, 164, 181, 0.10)',

  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
};

const SCREEN_PAD = 24;

/* ── Faculty color map ── */
const FACULTY_COLORS = {
  memory:      { accent: P.navy,      accentBg: P.navyMuted,      icon: 'cube-outline' },
  focus:       { accent: P.gold,      accentBg: P.goldMuted,      icon: 'eye-outline' },
  reaction:    { accent: '#EA580C',   accentBg: 'rgba(234, 88, 12, 0.10)', icon: 'flash-outline' },
  processing:  { accent: P.sage,      accentBg: P.sageMuted,      icon: 'speedometer-outline' },
  decision:    { accent: P.lavender,  accentBg: P.lavenderMuted,  icon: 'git-branch-outline' },
  spatial:     { accent: P.cyan,      accentBg: P.cyanMuted,      icon: 'navigate-outline' },
  flexibility: { accent: P.rose,      accentBg: P.roseMuted,      icon: 'swap-horizontal-outline' },
  logic:       { accent: '#0D9488',   accentBg: 'rgba(13, 148, 136, 0.10)', icon: 'bulb-outline' },
};

/* ── Default faculty names ── */
const DEFAULT_FACULTIES = [
  { id: 'memory',      name: 'Working Memory' },
  { id: 'focus',       name: 'Focus & Attention' },
  { id: 'reaction',    name: 'Reaction Speed' },
  { id: 'processing',  name: 'Processing Speed' },
  { id: 'decision',    name: 'Decision Making' },
  { id: 'spatial',     name: 'Spatial Reasoning' },
  { id: 'flexibility', name: 'Cognitive Flexibility' },
  { id: 'logic',       name: 'Logic & Problem Solving' },
];

/* ── Inline StatBox ── */
function StatBox({ value, label, icon, accent, accentBg }) {
  return (
    <View style={s.statBox}>
      <View style={[s.statIconBox, { backgroundColor: accentBg }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { playerProfile, refreshProfile } = usePlayer();
  const [facultiesMap, setFacultiesMap] = useState({});
  const [sessions, setSessions] = useState([]);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      storageService.getAllFaculties().then((d) => { if (d) setFacultiesMap(d); });
      storageService.getGameSessions().then((d) => { if (d) setSessions(d); });
    }, [refreshProfile])
  );

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 12
      : Math.max(insets.top, 20) + 8;

  const bottomPad = Math.max(insets.bottom, 20) + 20;

  const stats = playerProfile?.stats || {};
  const totalDrills = sessions.length > 0 ? sessions.length : (stats.totalDrills || 0);
  const accuracy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length)
    : (stats.averageAccuracy || 0);
  const latencyMs = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.latency || s.responseTime || 0), 0) / sessions.length)
    : (stats.averageLatencyMs || 0);
  const cognitiveIndex = totalDrills > 0 ? (stats.cognitiveIndex || 0) : 0;
  const readiness = totalDrills > 0 ? (stats.readiness || 0) : 0;
  const streak = stats.currentStreak || 0;

  const categoryScores = DEFAULT_FACULTIES.map((cat) => {
    const liveDoc = facultiesMap[cat.id];
    let score = 0;
    if (liveDoc?.metrics?.accuracy) {
      score = liveDoc.metrics.accuracy;
    } else if (liveDoc?.metrics?.score) {
      score = Math.min(100, Math.round((liveDoc.metrics.score / 1000) * 100));
    } else if (totalDrills > 0 && cat.id === 'memory' && accuracy > 0) {
      score = accuracy;
    }
    const c = FACULTY_COLORS[cat.id] || { accent: P.navy, accentBg: P.navyMuted, icon: 'cube-outline' };
    return { ...cat, score, ...c };
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} translucent />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingTop: topPad, paddingHorizontal: SCREEN_PAD }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>COGNITIVE TELEMETRY</Text>
            <Text style={s.userName}>Progress</Text>
          </View>
        </View>

        {/* ── INTRO CARD ── */}
        <LinearGradient
          colors={['#F5F2ED', '#EDE9E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.introCard}
        >
          <View style={s.introTopRow}>
            <View style={s.introIconBox}>
              <Ionicons name="analytics-outline" size={24} color={P.navy} />
            </View>
            <View style={s.introTextCol}>
              <Text style={s.introTitle}>
                Track how your cognitive performance changes over time.
              </Text>
              <Text style={s.introDesc}>
                Composite metrics calibrated across all your completed training drills.
              </Text>
            </View>
          </View>

          {/* Quick Stats Row */}
          <View style={s.quickStats}>
            <View style={s.quickStatItem}>
              <Text style={s.quickStatValue}>{totalDrills > 0 ? totalDrills : '—'}</Text>
              <Text style={s.quickStatLabel}>Sessions</Text>
            </View>
            <View style={s.quickStatDivider} />
            <View style={s.quickStatItem}>
              <Text style={s.quickStatValue}>{totalDrills > 0 ? `${accuracy}%` : '—'}</Text>
              <Text style={s.quickStatLabel}>Accuracy</Text>
            </View>
            <View style={s.quickStatDivider} />
            <View style={s.quickStatItem}>
              <Text style={s.quickStatValue}>{totalDrills > 0 ? cognitiveIndex : '—'}</Text>
              <Text style={s.quickStatLabel}>Index</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── HERO CARD: Overall Cognitive Index ── */}
        <View style={s.heroCard}>
          <View style={s.heroTopRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={s.heroLabel}>OVERALL COGNITIVE INDEX</Text>
              <Text style={s.heroScore}>
                {totalDrills > 0 ? cognitiveIndex : '—'}
              </Text>
            </View>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>
                {totalDrills > 0
                  ? `${totalDrills} ${totalDrills === 1 ? 'Drill' : 'Drills'} Calibrated`
                  : 'Baseline'}
              </Text>
            </View>
          </View>

          <Text style={s.heroDesc}>
            {totalDrills > 0
              ? 'Composite score indexed across memory buffer, reaction latency, and processing accuracy.'
              : 'Complete your first few training drills to unlock your personalized cognitive performance curve.'}
          </Text>

          {/* Progress bar */}
          <View style={s.progressTrack}>
            <View
              style={[
                s.progressFill,
                { width: totalDrills > 0 ? `${Math.min(100, cognitiveIndex / 10)}%` : '0%' },
              ]}
            />
          </View>

          {/* Sub-metrics row */}
          <View style={s.subMetrics}>
            <View style={s.subMetricItem}>
              <Text style={s.subMetricLabel}>Readiness</Text>
              <Text style={s.subMetricValue}>{totalDrills > 0 ? `${readiness}%` : '—'}</Text>
            </View>
            <View style={s.subMetricDivider} />
            <View style={s.subMetricItem}>
              <Text style={s.subMetricLabel}>Accuracy</Text>
              <Text style={s.subMetricValue}>{totalDrills > 0 ? `${accuracy}%` : '—'}</Text>
            </View>
            <View style={s.subMetricDivider} />
            <View style={s.subMetricItem}>
              <Text style={s.subMetricLabel}>Latency</Text>
              <Text style={s.subMetricValue}>{totalDrills > 0 ? `${latencyMs}ms` : '—'}</Text>
            </View>
          </View>
        </View>

        {/* ── SECTION: Performance Highlights ── */}
        <Text style={s.sectionTitle}>Performance Highlights</Text>
        <Text style={s.sectionSubtitle}>Key telemetry from your training sessions</Text>

        <View style={s.statsGrid}>
          <View style={s.statsRow}>
            <StatBox
              value={totalDrills > 0 ? `${readiness}%` : '—'}
              label="Readiness Score"
              icon="pulse-outline"
              accent={P.navy}
              accentBg={P.navyMuted}
            />
            <StatBox
              value={totalDrills > 0 ? `${accuracy}%` : '—'}
              label="Mean Accuracy"
              icon="checkmark-circle-outline"
              accent={P.sage}
              accentBg={P.sageMuted}
            />
          </View>
          <View style={s.statsRow}>
            <StatBox
              value={`${streak} days`}
              label="Active Streak"
              icon="flame-outline"
              accent={P.gold}
              accentBg={P.goldMuted}
            />
            <StatBox
              value={totalDrills > 0 ? `${latencyMs} ms` : '—'}
              label="Mean Latency"
              icon="flash-outline"
              accent={P.rose}
              accentBg={P.roseMuted}
            />
          </View>
        </View>

        {/* ── SECTION: Faculty Performance ── */}
        <Text style={s.sectionTitle}>Faculty Performance</Text>
        <Text style={s.sectionSubtitle}>Performance index by cognitive domain</Text>

        <View style={s.facultiesList}>
          {categoryScores.map((cat) => {
            const pct = cat.score > 0 ? cat.score : 0;
            const status = cat.score > 0 ? `${cat.score}%` : 'Calibrating';

            return (
              <View key={cat.id} style={s.facultyCard}>
                <View style={s.facultyRow}>
                  <View style={s.facultyLeft}>
                    <View style={[s.facultyIconBox, { backgroundColor: cat.accentBg }]}>
                      <Ionicons name={cat.icon} size={18} color={cat.accent} />
                    </View>
                    <View style={s.facultyTextCol}>
                      <Text style={s.facultyName}>{cat.name}</Text>
                      <Text style={s.facultyStatus}>{status}</Text>
                    </View>
                  </View>
                  <Text style={[s.facultyScore, { color: cat.accent }]}>
                    {cat.score > 0 ? cat.score : '—'}
                  </Text>
                </View>

                <View style={s.facultyProgressTrack}>
                  <View
                    style={[
                      s.facultyProgressFill,
                      { width: `${Math.min(100, pct)}%`, backgroundColor: cat.accent },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: bottomPad }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
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

  /* ── Intro Card ── */
  introCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 20,
    marginBottom: 28,
    overflow: 'hidden',
  },
  introTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  introIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  introTextCol: {
    flex: 1,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 13,
    color: P.textSec,
    lineHeight: 20,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: P.navyBorder,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: P.navyBorder,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: P.navy,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: P.textSec,
  },

  /* ── Hero Card ── */
  heroCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 20,
    marginBottom: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroScore: {
    fontSize: 46,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: -1,
    lineHeight: 50,
  },
  heroBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: P.navyMuted,
    borderWidth: 1,
    borderColor: P.navyBorder,
    flexShrink: 0,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: 0.3,
  },
  heroDesc: {
    fontSize: 14,
    color: P.textSec,
    lineHeight: 21,
    marginBottom: 14,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: P.gold,
  },
  subMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: P.navyBorder,
  },
  subMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  subMetricDivider: {
    width: 1,
    height: 22,
    backgroundColor: P.navyBorder,
  },
  subMetricLabel: {
    fontSize: 12,
    color: P.textSec,
    marginBottom: 3,
  },
  subMetricValue: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.text,
  },

  /* ── Section Headers ── */
  sectionTitle: {
    fontSize: 21,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: P.textSec,
    marginBottom: 14,
  },

  /* ── Stats Grid (Performance Highlights) ── */
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

  /* ── Faculty Performance Cards ── */
  facultiesList: {
    gap: 10,
    marginBottom: 8,
  },
  facultyCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
  },
  facultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  facultyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  facultyIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facultyTextCol: {
    flex: 1,
  },
  facultyName: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.text,
    marginBottom: 2,
  },
  facultyStatus: {
    fontSize: 12,
    color: P.textSec,
  },
  facultyScore: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.4,
    marginLeft: 12,
    flexShrink: 0,
  },
  facultyProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
  },
  facultyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
