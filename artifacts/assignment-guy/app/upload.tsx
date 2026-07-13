/**
 * Upload Assignment Screen — Milestone 2 placeholder.
 *
 * The form lets a user create an assignment record (title, course, type,
 * description). File attachment upload is Milestone 3 — the section is shown
 * but clearly labelled as coming soon.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SPACING, BORDER_RADIUS } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { ASSIGNMENT_TYPE_LABELS } from '@/types';
import type { AssignmentType } from '@/types';
import { supabase } from '@/lib/supabase';

const ASSIGNMENT_TYPES: AssignmentType[] = [
  'assignment',
  'exam',
  'quiz',
  'lab',
  'project',
];

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    user?.courses?.[0]?.course_id ?? '',
  );
  const [selectedType, setSelectedType] = useState<AssignmentType>('assignment');
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [courseError, setCourseError] = useState('');

  const courses = user?.courses ?? [];

  const validate = (): boolean => {
    let valid = true;
    setTitleError('');
    setCourseError('');

    if (!title.trim()) {
      setTitleError('Assignment title is required.');
      valid = false;
    } else if (title.trim().length < 3) {
      setTitleError('Title must be at least 3 characters.');
      valid = false;
    }

    if (!selectedCourseId) {
      setCourseError('Please select a course.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('You must be signed in to upload an assignment.');

      const res = await fetch(`${API_BASE}/api/v1/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          title: title.trim(),
          description: description.trim() || undefined,
          assignmentType: selectedType,
        }),
      });

      const body = await res.json() as { success: boolean; message?: string; data?: { assignment_id: string } };
      if (!res.ok) throw new Error(body.message ?? 'Failed to create assignment.');

      Alert.alert(
        'Assignment created!',
        'Your assignment has been posted to the feed.',
        [{ text: 'View Feed', onPress: () => router.replace('/(tabs)') }],
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Upload Assignment
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.closeButton, { backgroundColor: colors.muted }]}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + SPACING.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Input
          label="Assignment Title"
          placeholder="e.g. CSC 301 Mid-semester Assignment"
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          error={titleError}
        />

        {/* Course picker */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Course</Text>
          {courses.length === 0 ? (
            <View
              style={[
                styles.emptyCoursesBox,
                { backgroundColor: colors.muted, borderRadius: BORDER_RADIUS.md },
              ]}
            >
              <Ionicons name="book-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.emptyCoursesText, { color: colors.mutedForeground }]}>
                You haven't enrolled in any courses. Go to your Profile to update your course list.
              </Text>
            </View>
          ) : (
            <View style={styles.courseList}>
              {courses.map((course) => {
                const active = course.course_id === selectedCourseId;
                return (
                  <Pressable
                    key={course.course_id}
                    onPress={() => setSelectedCourseId(course.course_id)}
                    style={[
                      styles.courseChip,
                      {
                        backgroundColor: active ? colors.primary : colors.muted,
                        borderRadius: BORDER_RADIUS.sm,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.courseChipText,
                        { color: active ? '#FFFFFF' : colors.foreground },
                      ]}
                      numberOfLines={1}
                    >
                      {course.course_code} — {course.course_name}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </Pressable>
                );
              })}
              {courseError ? (
                <Text style={[styles.fieldError, { color: colors.error }]}>
                  {courseError}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Assignment type */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Type</Text>
          <View style={styles.typeRow}>
            {ASSIGNMENT_TYPES.map((type) => {
              const active = type === selectedType;
              return (
                <Pressable
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: active ? colors.primary : colors.muted,
                      borderRadius: BORDER_RADIUS.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: active ? '#FFFFFF' : colors.mutedForeground },
                    ]}
                  >
                    {ASSIGNMENT_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <Input
          label="Description (optional)"
          placeholder="Add any relevant details, context, or instructions…"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Attachments — coming soon */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Attachments{' '}
            <Text style={[styles.comingSoon, { color: colors.mutedForeground }]}>
              (photos & PDFs — coming soon)
            </Text>
          </Text>
          <Pressable
            style={[
              styles.attachmentPlaceholder,
              {
                backgroundColor: colors.muted,
                borderRadius: BORDER_RADIUS.md,
                borderColor: colors.border,
              },
            ]}
            disabled
          >
            <Ionicons name="cloud-upload-outline" size={28} color={colors.mutedForeground} />
            <Text style={[styles.attachmentPlaceholderText, { color: colors.mutedForeground }]}>
              Photo & PDF uploads are coming in the next update
            </Text>
          </Pressable>
        </View>

        {/* Submit */}
        <Button
          title="Post Assignment"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          onPress={handleSubmit}
          disabled={courses.length === 0}
        />

        {courses.length === 0 ? (
          <Text style={[styles.disabledNote, { color: colors.mutedForeground }]}>
            Enrol in at least one course before posting assignments.
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  fieldGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  comingSoon: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  fieldError: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  emptyCoursesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  emptyCoursesText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  courseList: {
    gap: SPACING.xs,
  },
  courseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderWidth: 1,
  },
  courseChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  typeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  typeChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  attachmentPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  attachmentPlaceholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  disabledNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
});
