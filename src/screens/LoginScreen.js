/**
 * OVERLOAD LoginScreen
 * Clean light premium authentication screen matching the approved design system
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
  ActivityIndicator,
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

export default function LoginScreen({ navigation }) {
  const { signIn, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      triggerHaptic('error');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    triggerHaptic('medium');

    try {
      await signIn({ email, password });
      triggerHaptic('success');
      navigation.replace(ROUTES.MAIN_TABS);
    } catch (err) {
      triggerHaptic('error');
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    triggerHaptic('light');
    continueAsGuest();
    navigation.replace(ROUTES.MAIN_TABS);
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
            title="Sign In"
            subtitle="OPERATOR AUTHENTICATION"
            onBackPress={() => navigation.goBack()}
          />

          {/* Form Card */}
          <AppCard style={styles.formCard} contentStyle={styles.cardContent}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to sync your cognitive training progress across devices.
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
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <AppButton
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              loading={loading}
              style={styles.submitBtn}
            />

            {/* Continue as Guest Button */}
            <AppButton
              title="Continue as Guest"
              onPress={handleGuestLogin}
              variant="secondary"
              size="md"
              style={styles.guestBtn}
            />
          </AppCard>

          {/* Link to Register */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an operator account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.footerLink}>Register</Text>
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
    marginBottom: spacing.sm,
  },
  guestBtn: {
    width: '100%',
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
