/**
 * Assignment Detail Screen
 * Milestone 2: Full assignment view with description, context sections,
 * attachments placeholder, verification badge, and discussion count.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { SPACING, BORDER_RADIUS } from '@/constants/colors';
import { ASSIGNMENT_TYPE_LABELS } from '@/types';
import type { AssignmentType } from '@/types';
import { useGetAssignment } from '@workspace/api-client-react';

// ── Date helpers ──────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDueDateFull(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = d.getTime() - now;
  const diffDay = Math.ceil(diff / 86_400_000);

  if (diffDay < 0) return `Overdue · ${formatDate(iso)}`;
  if (diffDay === 0) return `Due today · ${formatDate(iso)}`;
  if (diffDay === 1) return `Due tomorrow · ${formatDate(iso)}`;
  return `Due in ${diffDay} days · ${formatDate(iso)}`;
}

const TYPE_COLORS: Record<AssignmentType, { bg: string; text: string }> = {
  assignment: { bg: '#F0F9FF', text: '#0369A1' },
  exam:       { bg: '#FEF2F2', text: '#B91C1C' },
  quiz:       { bg: '#F5F3FF', text: '#6D28D9' },
  lab:        { bg: '#F0FDF4', text: '#15803D' },
  project:    { bg: '#FFF7ED', text: '#C2410C' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssignmentDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: response, isLoading, isError, refetch } = useGetAssignment(
    id ?? '',
    { query: { enabled: !!id } },
  );

  const assignment = (response as { data?: ReturnType<typeof Object> } | undefined)?.data as {
    assignment_id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    assignment_type: string;
    status: string;
    verification_status: 'unverified' | 'community_confirmed' | 'trusted_contributor_verified';
    discussion_count: number;
    created_at: string;
    updated_at: string;
    course_id: string;
    course_name: string;
    course_code: string;
    uploader_display_name: string;
    attachments: { attachment_id: string; attachment_type: string; url: string | null; filename: string | null; sort_order: number }[];
    context: { context_id: string; section_title: string; content: string; sort_order: number }[];
  } | undefined;

  const typeStyle =
    TYPE_COLORS[assignment?.assignment_type as AssignmentType] ??
    TYPE_COLORS.assignment;
  const typeLabel =
    ASSIGNMENT_TYPE_LABELS[assignment?.assignment_type as AssignmentType] ??
    'Assignment';

  const isDueSoon =
    assignment?.due_date &&
    new Date(assignment.due_date).getTime() - Date.now() < 2 * 86_400_000;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + SPACING.xs,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={{ flex: 1 }} />
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

      {isLoading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError || !assignment ? (
        <View style={styles.centred}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>
            Assignment not found
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.mutedForeground }]}>
            It may have been removed or the link is invalid.
          </Text>
          <Pressable
            onPress={() => (isError ? refetch() : router.back())}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.retryText}>{isError ? 'Retry' : 'Go back'}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + SPACING.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Badges row */}
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
              <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>
                {typeLabel}
              </Text>
            </View>
            <VerificationBadge status={assignment.verification_status} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.foreground }]}>
            {assignment.title}
          </Text>

          {/* Course */}
          <View style={styles.courseRow}>
            <Ionicons name="book-outline" size={15} color={colors.mutedForeground} />
            <Text style={[styles.courseName, { color: colors.mutedForeground }]}>
              {assignment.course_code} · {assignment.course_name}
            </Text>
          </View>

          {/* Due date */}
          {assignment.due_date ? (
            <View style={styles.dueRow}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color={isDueSoon ? '#EF4444' : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.dueText,
                  { color: isDueSoon ? '#EF4444' : colors.mutedForeground },
                ]}
              >
                {formatDueDateFull(assignment.due_date)}
              </Text>
            </View>
          ) : null}

          {/* Meta: uploader + discussion */}
          <View
            style={[
              styles.metaCard,
              {
                backgroundColor: colors.muted,
                borderRadius: BORDER_RADIUS.md,
              },
            ]}
          >
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                Uploaded by{' '}
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_500Medium' }}>
                  {assignment.uploader_display_name}
                </Text>
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {assignment.discussion_count}{' '}
                {assignment.discussion_count === 1 ? 'comment' : 'comments'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                Posted {formatDate(assignment.created_at)}
              </Text>
            </View>
          </View>

          {/* Description */}
          {assignment.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Description
              </Text>
              <Text style={[styles.body, { color: colors.foreground }]}>
                {assignment.description}
              </Text>
            </View>
          ) : null}

          {/* Context sections */}
          {assignment.context.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Additional Context
              </Text>
              {assignment.context.map((ctx) => (
                <View
                  key={ctx.context_id}
                  style={[
                    styles.contextCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: BORDER_RADIUS.md,
                    },
                  ]}
                >
                  <Text style={[styles.contextTitle, { color: colors.foreground }]}>
                    {ctx.section_title}
                  </Text>
                  <Text style={[styles.body, { color: colors.foreground }]}>
                    {ctx.content}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Attachments */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Attachments
            </Text>
            {assignment.attachments.length > 0 ? (
              assignment.attachments.map((att) => (
                <View
                  key={att.attachment_id}
                  style={[
                    styles.attachmentRow,
                    { borderColor: colors.border, borderRadius: BORDER_RADIUS.sm },
                  ]}
                >
                  <Ionicons
                    name={
                      att.attachment_type === 'pdf'
                        ? 'document-outline'
                        : att.attachment_type === 'image'
                        ? 'image-outline'
                        : 'text-outline'
                    }
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.attachmentName, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {att.filename ?? 'Attachment'}
                  </Text>
                </View>
              ))
            ) : (
              <View
                style={[
                  styles.attachmentEmpty,
                  { backgroundColor: colors.muted, borderRadius: BORDER_RADIUS.md },
                ]}
              >
                <Ionicons name="attach-outline" size={20} color={colors.mutedForeground} />
                <Text style={[styles.attachmentEmptyText, { color: colors.mutedForeground }]}>
                  No attachments yet. Photo, PDF & text uploads coming in the next update.
                </Text>
              </View>
            )}
          </View>

          {/* Discussion placeholder */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Discussion
            </Text>
            <View
              style={[
                styles.attachmentEmpty,
                { backgroundColor: colors.muted, borderRadius: BORDER_RADIUS.md },
              ]}
            >
              <Ionicons name="chatbubbles-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.attachmentEmptyText, { color: colors.mutedForeground }]}>
                Discussion threads are coming in Milestone 4. Be the first to discuss this assignment.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  errorTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  retryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  typeBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -SPACING.xs,
  },
  courseName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  metaCard: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 23,
  },
  contextCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  contextTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  attachmentName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    flex: 1,
  },
  attachmentEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  attachmentEmptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
