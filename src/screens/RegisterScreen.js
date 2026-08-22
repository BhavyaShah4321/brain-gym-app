/**
 * OVERLOAD RegisterScreen
 * Clean light premium account creation screen matching the approved design system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Header, AppButton, AppCard } from '../components';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import { formatAuthError } from '../services/firebase/authService';
import { triggerHaptic } from '../utils/haptics';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter email and password.');
      triggerHaptic('error');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      triggerHaptic('error');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      triggerHaptic('error');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    triggerHaptic('medium');

    try {
      await signUp({
        email,
        password,
        displayName: displayName.trim() || 'Operator',
      });
      triggerHaptic('success');
      navigation.replace(ROUTES.MAIN_TABS);
    } catch (err) {
      triggerHaptic('error');
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable withPadding={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {/* Header */}
          <Header
            title="Register"
            subtitle="CREATE OPERATOR ACCOUNT"
            onBackPress={() => navigation.goBack()}
          />

          {/* Form Card */}
          <AppCard style={styles.formCard} contentStyle={styles.cardContent}>
            <Text style={styles.cardTitle}>Begin Calibration</Text>
            <Text style={styles.cardSubtitle}>
              Create your account to persist multi-faculty telemetry and training streaks.
            </Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Display Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Operator / Display Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={displayName}
                  onChangeText={(text) => {
                    setDisplayName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Operator"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="operator@domain.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Submit Button */}
            <AppButton
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              size="lg"
              loading={loading}
              style={styles.submitBtn}
            />
          </AppCard>

          {/* Link to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.huge,
  },
  formCard: {
    marginVertical: spacing.md,
  },
  cardContent: {
    padding: spacing.cardPadding,
  },
  cardTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: typography.sizes.bodySmall,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.bodySmall,
    marginBottom: spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerMuted,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.danger,
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});
