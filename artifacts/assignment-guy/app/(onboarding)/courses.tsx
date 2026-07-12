/**
 * Onboarding Step 4 — Select Courses
 * Loads courses from /api/v1/departments/:id/courses. Multi-select.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Button } from '@/components/ui/Button';
import { SPACING } from '@/constants/colors';
import { EmptyState } from '@/components/ui/EmptyState';
import { RowSkeleton } from '@/components/ui/LoadingSkeleton';
import { useListCoursesByDepartment } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import type { Course, School, Department } from '@/types';
import { LEVEL_LABELS } from '@/types';

export default function CoursesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateOnboarding, completeOnboarding, user } = useAuth();

  const { schoolId, schoolName, departmentId, departmentName, level } =
    useLocalSearchParams<{
      schoolId: string;
      schoolName: string;
      departmentId: string;
      departmentName: string;
      level: string;
    }>();

  const levelNum = level ? parseInt(level, 10) : undefined;

  const { data, isLoading, isError, refetch } = useListCoursesByDepartment(
    departmentId ?? '',
    levelNum !== undefined ? { level: levelNum } : undefined,
  );

  const courses: Course[] = (data?.data ?? []) as Course[];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggleCourse = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDone = async () => {
    if (selectedIds.size === 0) return;
    setSaving(true);
    try {
      const selectedCourses = courses.filter((c) => selectedIds.has(c.course_id));
      const school: School = {
        school_id: schoolId,
        school_name: schoolName,
        created_at: new Date().toISOString(),
      };
      const department: Department = {
        department_id: departmentId,
        school_id: schoolId,
        department_name: departmentName,
      };
      await updateOnboarding({
        school,
        department,
        level: levelNum,
        courses: selectedCourses,
      });
      await completeOnboarding();
      // Navigation will be handled by root _layout.tsx effect
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + SPACING.md, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 4 of 4</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Select your courses
          </Text>
          {selectedIds.size > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.countText}>{selectedIds.size}</Text>
            </View>
          )}
        </View>

        <View style={styles.breadcrumbs}>
          <View style={[styles.breadcrumb, { backgroundColor: colors.secondary, borderRadius: 8 }]}>
            <Ionicons name="library-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.breadcrumbText, { color: colors.mutedForeground }]}>
              {departmentName}
            </Text>
          </View>
          <View style={[styles.breadcrumb, { backgroundColor: colors.secondary, borderRadius: 8 }]}>
            <Ionicons name="person-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.breadcrumbText, { color: colors.mutedForeground }]}>
              {levelNum !== undefined ? LEVEL_LABELS[levelNum] ?? 'Other' : 'All levels'}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
        </View>
      ) : isError ? (
        <EmptyState
          icon="wifi-outline"
          title="Couldn't load courses"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : courses.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="No courses available"
          description="No courses found for your department and year. You can add courses later from your profile."
          actionLabel="Skip for now"
          onAction={async () => {
            await updateOnboarding({
              school: { school_id: schoolId, school_name: schoolName, created_at: new Date().toISOString() },
              department: { department_id: departmentId, school_id: schoolId, department_name: departmentName },
              level: levelNum,
              courses: [],
            });
            await completeOnboarding();
          }}
        />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.course_id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.course_id);
            return (
              <Pressable
                onPress={() => toggleCourse(item.course_id)}
                style={[
                  styles.courseItem,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: 12,
                  },
                ]}
              >
                <View style={styles.courseInfo}>
                  <Text
                    style={[
                      styles.courseCode,
                      { color: isSelected ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    {item.course_code}
                  </Text>
                  <Text
                    style={[
                      styles.courseName,
                      { color: isSelected ? colors.primary : colors.foreground },
                    ]}
                  >
                    {item.course_name}
                  </Text>
                </View>
                {isSelected ? (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                ) : (
                  <View style={[styles.emptyCircle, { borderColor: colors.border }]} />
                )}
              </Pressable>
            );
          }}
        />
      )}

      {/* Done button */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + SPACING.md,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Button
          title={selectedIds.size === 0 ? 'Select at least one course' : `Join ${selectedIds.size} course${selectedIds.size > 1 ? 's' : ''}`}
          variant="primary"
          fullWidth
          size="lg"
          disabled={selectedIds.size === 0}
          loading={saving}
          onPress={handleDone}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.sm,
  },
  backButton: { alignSelf: 'flex-start', marginBottom: SPACING.xs },
  step: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  countText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#FFF',
  },
  breadcrumbs: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  breadcrumbText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  list: { padding: SPACING.md, gap: SPACING.sm },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1.5,
  },
  courseInfo: { flex: 1 },
  courseCode: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
});
