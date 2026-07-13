/**
 * VerificationBadge — compact status badge for assignment verification level.
 *
 * unverified                   → grey  "Unverified"
 * community_confirmed          → blue  "Confirmed"   (✓)
 * trusted_contributor_verified → amber "Verified"    (★)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { VerificationStatus } from '@/types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  /** 'sm' shows only the icon; 'md' (default) shows icon + label */
  size?: 'sm' | 'md';
}

const CONFIG: Record<
  VerificationStatus,
  { label: string; icon: keyof typeof Ionicons.glyphMap; colorKey: 'unverified' | 'confirmed' | 'verified' }
> = {
  unverified: { label: 'Unverified', icon: 'ellipse-outline', colorKey: 'unverified' },
  community_confirmed: { label: 'Confirmed', icon: 'checkmark-circle', colorKey: 'confirmed' },
  trusted_contributor_verified: { label: 'Verified', icon: 'star', colorKey: 'verified' },
};

export function VerificationBadge({ status, size = 'md' }: VerificationBadgeProps) {
  const colors = useColors();
  const { label, icon, colorKey } = CONFIG[status];

  const palette = {
    unverified: {
      bg: colors.muted,
      text: colors.mutedForeground,
      icon: colors.mutedForeground,
    },
    confirmed: {
      bg: '#DBEAFE',
      text: '#1D4ED8',
      icon: '#2563EB',
    },
    verified: {
      bg: '#FEF3C7',
      text: '#B45309',
      icon: '#D97706',
    },
  }[colorKey];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Ionicons
        name={icon}
        size={size === 'sm' ? 10 : 12}
        color={palette.icon}
      />
      {size === 'md' ? (
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 100,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
});
