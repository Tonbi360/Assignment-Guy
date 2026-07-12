/**
 * Notifications Tab — Assignment updates, reminders, replies
 * Milestone 1: Displays empty state. Notifications implemented in Milestone 4.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotificationsTab() {
  const colors = useColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <EmptyState
        icon="notifications-outline"
        title="You're all caught up"
        description="Notifications for new assignments, replies, and deadline reminders will appear here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
