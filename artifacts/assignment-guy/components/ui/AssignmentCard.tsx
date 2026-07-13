/**
 * AssignmentCard — tappable card shown in the assignment feed.
 *
 * Displays:
 *   • Title
 *   • Course code + name
 *   • Assignment type badge
 *   • Verification status badge
 *   • Due date (relative) — only when set
 *   • Discussion count
 *   • Uploader name + relative post date
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { VerificationBadge } from './VerificationBadge';
import { SPACING, BORDER_RADIUS } from '@/constants/colors';
import type { AssignmentSummary, AssignmentType } from '@/types';
import { ASSIGNMENT_TYPE_LABELS } from '@/types';

interface AssignmentCardProps {
  assignment: AssignmentSummary;
  onPress: () => void;
}

// ── Date helpers ────────────────────────────────────────────────────────────

function relativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatDueDate(isoString: string): string {
  const date = new Date(isoString);
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffDay = Math.ceil(diffMs / 86_400_000);

  if (diffDay < 0) return 'Overdue';
  if (diffDay === 0) return 'Due today';
  if (diffDay === 1) return 'Due tomorrow';
  if (diffDay <= 7) return `Due in ${diffDay} days`;
  return `Due ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
}

const TYPE_COLORS: Record<AssignmentType, { bg: string; text: string }> = {
  assignment: { bg: '#F0F9FF', text: '#0369A1' },
  exam:       { bg: '#FEF2F2', text: '#B91C1C' },
  quiz:       { bg: '#F5F3FF', text: '#6D28D9' },
  lab:        { bg: '#F0FDF4', text: '#15803D' },
  project:    { bg: '#FFF7ED', text: '#C2410C' },
};

// ── Component ────────────────────────────────────────────────────────────────

export function AssignmentCard({ assignment, onPress }: AssignmentCardProps) {
  const colors = useColors();

  const typeStyle =
    TYPE_COLORS[assignment.assignment_type as AssignmentType] ??
    TYPE_COLORS.assignment;

  const isDueSoon =
    assignment.due_date &&
    new Date(assignment.due_date).getTime() - Date.now() < 2 * 86_400_000;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: BORDER_RADIUS.md,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${assignment.title}, ${assignment.course_code}`}
    >
      {/* Top row: type badge + verification badge */}
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
          <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>
            {ASSIGNMENT_TYPE_LABELS[assignment.assignment_type as AssignmentType] ?? 'Assignment'}
          </Text>
        </View>
        <View style={styles.topRowRight}>
          <VerificationBadge status={assignment.verification_status} />
        </View>
      </View>

      {/* Title */}
      <Text
        style={[styles.title, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {assignment.title}
      </Text>

      {/* Course */}
      <Text style={[styles.course, { color: colors.mutedForeground }]}>
        {assignment.course_code} · {assignment.course_name}
      </Text>

      {/* Due date — only when set */}
      {assignment.due_date ? (
        <View style={styles.dueRow}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={isDueSoon ? '#EF4444' : colors.mutedForeground}
          />
          <Text
            style={[
              styles.dueText,
              { color: isDueSoon ? '#EF4444' : colors.mutedForeground },
            ]}
          >
            {formatDueDate(assignment.due_date)}
          </Text>
        </View>
      ) : null}

      {/* Footer: uploader + date + discussion count */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerMeta, { color: colors.mutedForeground }]}>
          {assignment.uploader_display_name} · {relativeDate(assignment.created_at)}
        </Text>
        <View style={styles.discussionRow}>
          <Ionicons
            name="chatbubble-outline"
            size={13}
            color={colors.mutedForeground}
          />
          <Text style={[styles.footerMeta, { color: colors.mutedForeground }]}>
            {assignment.discussion_count}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 100,
  },
  typeBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 21,
  },
  course: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dueText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  discussionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
