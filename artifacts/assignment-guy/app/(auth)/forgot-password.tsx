/**
 * Forgot Password screen.
 * Calls supabase.auth.resetPasswordForEmail — Supabase sends a reset link to
 * the user's inbox. The user opens the link in their browser to set a new
 * password, then signs in again.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { SPACING } from '@/constants/colors';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validate = (): boolean => {
    setEmailError('');
    setGeneralError('');
    if (!email.trim()) {
      setEmailError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + SPACING.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button — top-right */}
        <View style={[styles.topBar, { paddingTop: insets.top + SPACING.xs }]}>
          <View style={styles.spacer} />
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={[styles.backButton, { backgroundColor: colors.muted }]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {sent ? (
          /* ── Success state ─────────────────────────────────────────── */
          <View style={styles.successContainer}>
            <View
              style={[styles.successIcon, { backgroundColor: colors.primaryLight }]}
            >
              <Ionicons name="mail-outline" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Check your inbox
            </Text>
            <Text
              style={[styles.successBody, { color: colors.mutedForeground }]}
            >
              We sent a password reset link to{' '}
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_500Medium' }}>
                {email.trim()}
              </Text>
              .{'\n\n'}
              Open the link in your browser to set a new password, then sign in
              again.
            </Text>
            <Button
              title="Back to Sign In"
              variant="primary"
              fullWidth
              size="lg"
              onPress={() => router.replace('/(auth)/login')}
            />
          </View>
        ) : (
          /* ── Email entry ───────────────────────────────────────────── */
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Reset password
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Enter your email and we'll send you a link to reset your password.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSend}
                error={emailError}
              />

              {generalError ? (
                <View
                  style={[
                    styles.errorBox,
                    { backgroundColor: colors.errorLight, borderRadius: 8 },
                  ]}
                >
                  <Text style={[styles.errorBoxText, { color: colors.error }]}>
                    {generalError}
                  </Text>
                </View>
              ) : null}

              <Button
                title="Send Reset Link"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                onPress={handleSend}
              />
            </View>

            <View style={styles.footer}>
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  Back to Sign In
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: { flex: 1 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { gap: SPACING.xs },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  form: { gap: SPACING.md },
  errorBox: { padding: SPACING.md },
  errorBoxText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  successContainer: {
    flex: 1,
    gap: SPACING.lg,
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
