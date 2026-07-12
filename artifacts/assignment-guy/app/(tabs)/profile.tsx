/**
 * Profile Tab — User info, courses, contribution score
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { SPACING, BORDER_RADIUS } from '@/constants/colors';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { LEVEL_LABELS } from '@/types';

export default function ProfileTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            await signOut();
            // Navigation handled by AuthContext effect
          },
        },
      ],
    );
  };

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + name */}
      <View style={[styles.heroSection, { backgroundColor: colors.secondary }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.displayName, { color: colors.foreground }]}>
          {user?.displayName ?? '—'}
        </Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>
          {user?.email ?? '—'}
        </Text>
        <Badge
          label={
            user?.role === 'trusted_contributor'
              ? 'Trusted Contributor'
              : user?.role === 'contributor'
              ? 'Contributor'
              : 'Student'
          }
          variant={
            user?.role === 'trusted_contributor'
              ? 'trusted'
              : user?.role === 'contributor'
              ? 'verified'
              : 'secondary'
          }
        />
      </View>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} padding="md">
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {user?.contributionScore ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Contribution Score
            </Text>
          </Card>
          <Card style={styles.statCard} padding="md">
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {user?.courses.length ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Courses Joined
            </Text>
          </Card>
        </View>

        {/* Academic info */}
        <Card>
          <Text style={[styles.sectionHeading, { color: colors.mutedForeground }]}>
            ACADEMIC PROFILE
          </Text>

          <ProfileRow
            icon="school-outline"
            label="School"
            value={user?.school?.school_name ?? 'Not set'}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ProfileRow
            icon="library-outline"
            label="Department"
            value={user?.department?.department_name ?? 'Not set'}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ProfileRow
            icon="person-outline"
            label="Year"
            value={user?.level != null ? (LEVEL_LABELS[user.level] ?? 'Other') : 'Not set'}
            colors={colors}
          />
        </Card>

        {/* Sign out */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: pressed ? colors.errorLight : colors.card,
              borderColor: colors.border,
              borderRadius: BORDER_RADIUS.md,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.profileRow}>
      <Ionicons name={icon} size={18} color={colors.mutedForeground} />
      <View style={styles.profileRowContent}>
        <Text style={[styles.profileRowLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.profileRowValue, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroSection: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#FFF',
  },
  displayName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  email: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  profileRowContent: { flex: 1 },
  profileRowLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  profileRowValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    marginTop: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
  },
  signOutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
