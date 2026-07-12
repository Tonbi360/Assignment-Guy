/**
 * Onboarding Step 2 — Select Department
 * Route params: schoolId, schoolName
 */

import React from 'react';
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
import { SPACING } from '@/constants/colors';
import { EmptyState } from '@/components/ui/EmptyState';
import { RowSkeleton } from '@/components/ui/LoadingSkeleton';
import { useListDepartmentsBySchool } from '@workspace/api-client-react';
import type { Department } from '@/types';

export default function DepartmentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { schoolId, schoolName } = useLocalSearchParams<{
    schoolId: string;
    schoolName: string;
  }>();

  const { data, isLoading, isError, refetch } = useListDepartmentsBySchool(schoolId ?? '');

  const departments: Department[] = (data?.data ?? []) as Department[];

  const handleSelect = (dept: Department) => {
    router.push({
      pathname: '/(onboarding)/level',
      params: {
        schoolId,
        schoolName,
        departmentId: dept.department_id,
        departmentName: dept.department_name,
      },
    });
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

        <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 2 of 4</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Select your department
        </Text>
        <View style={[styles.breadcrumb, { backgroundColor: colors.secondary, borderRadius: 8 }]}>
          <Ionicons name="school-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.breadcrumbText, { color: colors.mutedForeground }]}>
            {schoolName}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
        </View>
      ) : isError ? (
        <EmptyState
          icon="wifi-outline"
          title="Couldn't load departments"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : departments.length === 0 ? (
        <EmptyState
          icon="library-outline"
          title="No departments yet"
          description={`Departments for ${schoolName} haven't been added yet. This will be available soon.`}
        />
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => item.department_id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + SPACING.xl },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: pressed ? colors.secondary : colors.card,
                  borderColor: colors.border,
                  borderRadius: 12,
                },
              ]}
            >
              <Text style={[styles.itemName, { color: colors.foreground }]}>
                {item.department_name}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        />
      )}
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
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  breadcrumbText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  list: { padding: SPACING.md, gap: SPACING.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
  },
  itemName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    flex: 1,
  },
});
