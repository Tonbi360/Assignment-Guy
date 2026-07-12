import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SPACING, BORDER_RADIUS } from '@/constants/colors';

export default function VerifyEmailScreen() {
  const colors = useColors();
  const {
    pendingEmailConfirmation,
    checkEmailConfirmed,
    resendConfirmationEmail,
    cancelEmailConfirmation,
  } = useAuth();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckConfirmed() {
    setChecking(true);
    setError(null);
    try {
      await checkEmailConfirmed();
      // If this resolves without throwing, onAuthStateChange fires SIGNED_IN
      // and the route guard in _layout.tsx navigates away automatically.
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to verify. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendSuccess(false);
    setError(null);
    try {
      await resendConfirmationEmail();
      setResendSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  }

  function handleBack() {
    cancelEmailConfirmation();
    router.replace('/(auth)/welcome');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="mail-outline" size={40} color={colors.primary} />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          Check your email
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          We sent a confirmation link to{'\n'}
          <Text style={[styles.emailText, { color: colors.foreground }]}>
            {pendingEmailConfirmation}
          </Text>
        </Text>

        {/* Steps */}
        <View style={[styles.stepsCard, { backgroundColor: colors.card, borderRadius: BORDER_RADIUS.lg }]}>
          {[
            'Open the email we sent you',
            'Tap the "Confirm your email" link',
            'Return here and tap the button below',
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={[styles.stepBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.stepBadgeText, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Error */}
        {error ? (
          <View style={[styles.messageBanner, { backgroundColor: colors.errorLight, borderRadius: BORDER_RADIUS.sm }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={[styles.bannerText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {/* Resend success */}
        {resendSuccess ? (
          <View style={[styles.messageBanner, { backgroundColor: colors.successLight, borderRadius: BORDER_RADIUS.sm }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={[styles.bannerText, { color: colors.success }]}>
              Confirmation email resent successfully.
            </Text>
          </View>
        ) : null}

        {/* Primary CTA */}
        <Button
          title={checking ? 'Checking…' : "I've confirmed my email"}
          onPress={handleCheckConfirmed}
          disabled={checking || resending}
          fullWidth
          size="lg"
          variant="primary"
        />

        {/* Resend */}
        <TouchableOpacity
          style={styles.resendRow}
          onPress={handleResend}
          disabled={resending || checking}
          hitSlop={8}
        >
          {resending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.resendText, { color: colors.primary }]}>
              Didn't receive it? Resend email
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? SPACING.md : SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  emailText: {
    fontFamily: 'Inter_600SemiBold',
  },
  stepsCard: {
    padding: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepBadgeText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    lineHeight: 20,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
