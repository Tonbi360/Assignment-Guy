/**
 * Home Tab — Assignment Feed
 * Milestone 1: Empty state shown (no assignments yet).
 * Milestone 2: Assignment feed with cards, search, and filters.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { SPACING } from '@/constants/colors';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Feed area */}
      <EmptyState
        icon="document-text-outline"
        title="No assignments yet"
        description="Assignments for your courses will appear here. Be the first to upload one for your class."
      />

      {/* Floating Action Button — Upload Assignment */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: pressed ? '#1D4ED8' : colors.primary,
            shadowColor: colors.primary,
          },
        ]}
        onPress={() => {
          /* TODO Milestone 3: navigate to upload screen */
        }}
        accessibilityLabel="Upload Assignment"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 90 + SPACING.md,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
