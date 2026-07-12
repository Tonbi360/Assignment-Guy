import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Button } from '@/components/ui/Button';
import { SPACING } from '@/constants/colors';

const FEATURES = [
  {
    icon: 'notifications-outline' as const,
    text: 'Never miss an assignment again',
  },
  {
    icon: 'people-outline' as const,
    text: 'Collaborate with classmates',
  },
  {
    icon: 'time-outline' as const,
    text: 'Track every deadline automatically',
  },
  {
    icon: 'sparkles-outline' as const,
    text: 'AI-assisted assignment context',
  },
];

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + SPACING.xl,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo + Brand */}
        <View style={styles.brand}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: colors.foreground }]}>
            Assignment Guy
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Your assignments, organized.
          </Text>
        </View>

        {/* Feature list */}
        <View style={[styles.features, { backgroundColor: colors.secondary, borderRadius: 16 }]}>
          {FEATURES.map((f, i) => (
            <View
              key={f.text}
              style={[
                styles.featureRow,
                i < FEATURES.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={f.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.foreground }]}>
                {f.text}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.actions}>
          <Button
            title="Create Account"
            variant="primary"
            fullWidth
            size="lg"
            onPress={() => router.push('/(auth)/register')}
          />
          <Button
            title="Sign In"
            variant="outline"
            fullWidth
            size="lg"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          For students, by students
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xl,
  },
  brand: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  appName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  features: {
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    flex: 1,
  },
  actions: {
    gap: SPACING.sm,
  },
  footer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
});
