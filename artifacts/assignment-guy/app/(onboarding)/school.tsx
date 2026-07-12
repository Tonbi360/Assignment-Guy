/**
 * Onboarding Step 1 — Select School
 * Loads schools from /api/v1/schools. Shows empty state if DB is empty.
 * No hardcoded school data.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { SPACING } from '@/constants/colors';
import { EmptyState } from '@/components/ui/EmptyState';
import { RowSkeleton } from '@/components/ui/LoadingSkeleton';
import { useListSchools } from '@workspace/api-client-react';
import type { School } from '@/types';

export default function SchoolScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useListSchools(
    search ? { search } : undefined,
  );

  const schools: School[] = (data?.data ?? []) as School[];

  const filteredSchools = useMemo(() => {
    if (!search.trim()) return schools;
    const q = search.trim().toLowerCase();
    return schools.filter(
      (s) =>
        s.school_name.toLowerCase().includes(q) ||
        (s.country ?? '').toLowerCase().includes(q),
    );
  }, [schools, search]);

  const handleSelect = (school: School) => {
    router.push({
      pathname: '/(onboarding)/department',
      params: { schoolId: school.school_id, schoolName: school.school_name },
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
        <Text style={[styles.step, { color: colors.mutedForeground }]}>
          Step 1 of 4
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Which school do you attend?
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your feed will show assignments from your school only.
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search schools…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon="wifi-outline"
          title="Couldn't load schools"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : filteredSchools.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title={search ? 'No schools found' : 'No schools available yet'}
          description={
            search
              ? `No results for "${search}". Try a different search term.`
              : 'Schools will appear here once they are added. Contact support to add your institution.'
          }
        />
      ) : (
        <FlatList
          data={filteredSchools}
          keyExtractor={(item) => item.school_id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + SPACING.xl },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              style={({ pressed }) => [
                styles.schoolItem,
                {
                  backgroundColor: pressed ? colors.secondary : colors.card,
                  borderColor: colors.border,
                  borderRadius: 12,
                },
              ]}
            >
              <View style={styles.schoolInfo}>
                <Text style={[styles.schoolName, { color: colors.foreground }]}>
                  {item.school_name}
                </Text>
                {item.country && (
                  <Text style={[styles.schoolCountry, { color: colors.mutedForeground }]}>
                    {item.country}
                  </Text>
                )}
              </View>
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
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderWidth: 1.5,
    marginTop: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  schoolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
  },
  schoolInfo: { flex: 1 },
  schoolName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  schoolCountry: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
});
