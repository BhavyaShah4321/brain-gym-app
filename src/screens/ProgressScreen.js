/**
 * OVERLOAD ProgressScreen
 * Clean light theme cognitive performance telemetry and trend analytics connected to Local-First storage
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  ScreenContainer,
  Header,
  GradientCard,
  AppCard,
  StatCard,
  Badge,
  SectionHeader,
  ProgressBar,
} from '../components';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';
import { useAuth } from '../hooks/useAuth';
import storageService from '../services/storageService';
import { useFocusEffect } from '@react-navigation/native';

export default function ProgressScreen({ navigation }) {
  const { userProfile, refreshProfile } = useAuth();
  const [facultiesMap, setFacultiesMap] = useState({});
  const [sessions, setSessions] = useState([]);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      storageService.getAllFaculties().then((data) => {
        if (data) setFacultiesMap(data);
      });
      storageService.getGameSessions().then((data) => {
        if (data) setSessions(data);
      });
    }, [refreshProfile])
  );

  const stats = userProfile?.stats || {};
  const totalDrills = sessions.length > 0 ? sessions.length : (stats.totalDrills || 0);

  // Derive real statistics directly from actual sessions if available, or user stats
  const accuracy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length)
    : (stats.averageAccuracy || 0);

  const latencyMs = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.latency || s.responseTime || 0), 0) / sessions.length)
    : (stats.averageLatencyMs || 0);

  const cognitiveIndex = totalDrills > 0 ? (stats.cognitiveIndex || 0) : 0;
  const readiness = totalDrills > 0 ? (stats.readiness || 0) : 0;
  const streak = stats.currentStreak || 0;

  const defaultFaculties = [
    { id: 'memory', name: 'Working Memory', defaultScore: 82, color: colors.primary },
    { id: 'focus', name: 'Focus & Attention', defaultScore: 74, color: colors.secondary },
    { id: 'reaction', name: 'Reaction Speed', defaultScore: 91, color: colors.gold },
    { id: 'processing', name: 'Processing Speed', defaultScore: 76, color: colors.accentBlue },
    { id: 'decision', name: 'Decision Making', defaultScore: 80, color: colors.accentLavender },
    { id: 'spatial', name: 'Spatial Reasoning', defaultScore: 70, color: colors.accentCyan },
    { id: 'flexibility', name: 'Cognitive Flexibility', defaultScore: 75, color: '#EC4899' },
    { id: 'logic', name: 'Logic & Problem Solving', defaultScore: 85, color: colors.success },
  ];

  const categoryScores = defaultFaculties.map((cat) => {
    const liveDoc = facultiesMap[cat.id];
    let score = 0;
    if (liveDoc?.metrics?.accuracy) {
      score = liveDoc.metrics.accuracy;
    } else if (liveDoc?.metrics?.score) {
      score = Math.min(100, Math.round((liveDoc.metrics.score / 1000) * 100));
    } else if (totalDrills > 0 && cat.id === 'memory' && accuracy > 0) {
      score = accuracy;
    }
    return {
      ...cat,
      score,
    };
  });

  return (
    <ScreenContainer scrollable withPadding={false}>
      <View style={styles.container}>
        <Header
          title="Your Progress"
          subtitle="ANALYTICS"
        />

        {/* Intro Tagline */}
        <View style={styles.introBox}>
          <Text style={styles.introHeading}>Cognitive Telemetry</Text>
          <Text style={styles.introSubheading}>
            Track how your cognitive performance changes over time.
          </Text>
        </View>

        {/* Overall Index Hero Card */}
        <GradientCard
          colors={colors.gradients.readinessSoft}
          style={styles.heroCard}
          contentStyle={styles.heroContent}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>OVERALL COGNITIVE INDEX</Text>
              <Text style={styles.heroScore}>
                {totalDrills > 0 ? cognitiveIndex : '—'}
              </Text>
            </View>
            <Badge
              label={totalDrills > 0 ? `${totalDrills} ${totalDrills === 1 ? 'Drill' : 'Drills'} Calibrated` : 'Baseline Calibration'}
              color={totalDrills > 0 ? colors.success : colors.primary}
            />
          </View>

          <Text style={styles.heroDescription}>
            {totalDrills > 0
              ? 'Composite score indexed across memory buffer, reaction latency, and processing accuracy.'
              : 'Complete your first few training drills to unlock your personalized cognitive performance curve.'}
          </Text>

          <View style={styles.heroProgress}>
            <ProgressBar
              progress={totalDrills > 0 ? cognitiveIndex / 1000 : 0}
              color={colors.primary}
              height={6}
            />
          </View>
        </GradientCard>

        {/* 2x2 Telemetry Snapshot */}
        <SectionHeader title="Performance Highlights" />
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <StatCard
              value={totalDrills > 0 ? `${readiness}%` : '—'}
              label="Readiness Score"
              iconName="pulse-outline"
              accentColor={colors.primary}
            />
            <StatCard
              value={totalDrills > 0 ? `${accuracy}%` : '—'}
              label="Mean Accuracy"
              iconName="checkmark-circle-outline"
              accentColor={colors.success}
            />
          </View>
          <View style={styles.metricsRow}>
            <StatCard
              value={`${streak} Days`}
              label="Active Streak"
              iconName="flame-outline"
              accentColor={colors.gold}
            />
            <StatCard
              value={totalDrills > 0 ? `${latencyMs} ms` : '—'}
              label="Mean Latency"
              iconName="flash-outline"
              accentColor={colors.accentLavender}
            />
          </View>
        </View>

        {/* Faculty Calibration Performance List */}
        <SectionHeader
          title="Faculty Performance"
          subtitle="Performance index by cognitive domain"
        />

        <View style={styles.facultiesList}>
          {categoryScores.map((cat) => (
            <AppCard
              key={cat.id}
              style={styles.facultyCard}
              contentStyle={styles.facultyContent}
            >
              <View style={styles.facultyRow}>
                <Text style={styles.facultyName}>{cat.name}</Text>
                <Text style={[styles.facultyPercent, { color: cat.color }]}>
                  {cat.score > 0 ? `${cat.score}%` : 'Calibrating'}
                </Text>
              </View>

              <ProgressBar
                progress={cat.score > 0 ? cat.score / 100 : 0}
                color={cat.color}
                height={6}
              />
            </AppCard>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.huge,
  },
  introBox: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  introHeading: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xxs,
  },
  introSubheading: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.body,
  },
  heroCard: {
    marginVertical: spacing.xs,
  },
  heroContent: {
    padding: spacing.cardPadding,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  heroLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.caps,
    marginBottom: 2,
  },
  heroScore: {
    fontSize: typography.sizes.scoreNumber,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  heroDescription: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.body,
    marginVertical: spacing.xs,
  },
  heroProgress: {
    marginTop: spacing.md,
  },
  metricsGrid: {
    gap: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  facultiesList: {
    gap: spacing.xs,
  },
  facultyCard: {
    marginVertical: spacing.xxs,
  },
  facultyContent: {
    padding: spacing.md,
  },
  facultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  facultyName: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  facultyPercent: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.bold,
  },
});
