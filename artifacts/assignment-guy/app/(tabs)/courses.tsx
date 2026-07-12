/**
 * Courses Tab — Shows the user's enrolled courses
 * Source: AuthContext (from onboarding). Will sync with backend in M2.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { SPACING } from '@/constants/colors';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import type { Course } from '@/types';

export default function CoursesTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const courses: Course[] = user?.courses ?? [];

  const renderCourse = ({ item }: { item: Course }) => (
    <Pressable
      style={({ pressed }) => [
        styles.courseCard,
        {
          backgroundColor: pressed ? colors.secondary : colors.card,
          borderColor: colors.border,
          borderRadius: 16,
        },
      ]}
    >
      <View style={[styles.courseAccent, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.courseCode, { color: colors.primary }]}>
          {item.course_code}
        </Text>
      </View>
      <View style={styles.courseBody}>
        <Text style={[styles.courseName, { color: colors.foreground }]} numberOfLines={2}>
          {item.course_name}
        </Text>
        {item.semester && (
          <Text style={[styles.courseMeta, { color: colors.mutedForeground }]}>
            {item.semester} Semester
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </Pressable>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {courses.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="No courses yet"
          description="Complete your profile setup to join courses and see assignments."
          actionLabel="Set up profile"
          onAction={() => {/* TODO: navigate to onboarding */}}
        />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.course_id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                My Courses
              </Text>
              <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
                {courses.length} course{courses.length !== 1 ? 's' : ''}
              </Text>
            </View>
          }
          renderItem={renderCourse}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: SPACING.md, gap: SPACING.sm },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    gap: SPACING.md,
  },
  courseAccent: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseCode: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  courseBody: {
    flex: 1,
  },
  courseName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 21,
  },
  courseMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
});
