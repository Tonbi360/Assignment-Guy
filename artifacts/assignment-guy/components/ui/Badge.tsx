/**
 * Badge — Status indicator component
 * Used for assignment status, verification badges, contributor levels
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

type BadgeVariant =
  | 'active'
  | 'dueSoon'
  | 'overdue'
  | 'completed'
  | 'inProgress'
  | 'archived'
  | 'verified'
  | 'trusted'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  const colors = useColors();

  const getColors = (): { bg: string; text: string } => {
    switch (variant) {
      case 'active':
        return { bg: colors.statusActiveLight, text: colors.statusActive };
      case 'dueSoon':
        return { bg: colors.statusDueSoonLight, text: colors.statusDueSoon };
      case 'overdue':
        return { bg: colors.statusOverdueLight, text: colors.statusOverdue };
      case 'completed':
        return { bg: colors.statusCompletedLight, text: colors.statusCompleted };
      case 'inProgress':
        return { bg: colors.infoLight, text: colors.info };
      case 'archived':
        return { bg: colors.statusArchivedLight, text: colors.statusArchived };
      case 'verified':
        return { bg: colors.successLight, text: colors.success };
      case 'trusted':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'error':
        return { bg: colors.errorLight, text: colors.error };
      case 'secondary':
        return { bg: colors.secondary, text: colors.mutedForeground };
      default:
        return { bg: colors.primaryLight, text: colors.primary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
});
