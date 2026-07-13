/**
 * Home Tab — Assignment Feed
 * Milestone 2: Live assignment feed with search, filters, and assignment cards.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { SPACING, BORDER_RADIUS } from '@/constants/colors';
import { EmptyState } from '@/components/ui/EmptyState';
// TO THIS:
import { Skeleton as LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { AssignmentCard } from '@/components/ui/AssignmentCard';
import { useAuth } from '@/context/AuthContext';
import { useListAssignments } from '@workspace/api-client-react';
import type { AssignmentSummary } from '@/types';

// ── Filter options ────────────────────────────────────────────────────────────

type FeedFilter = 'all' | 'my_courses' | 'exams' | 'projects';

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'my_courses', label: 'My Courses' },
  { key: 'exams', label: 'Exams' },
  { key: 'projects', label: 'Projects' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [searchDebounced, setSearchDebounced] = useState('');
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input so we don't hammer the API on every keystroke
  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchDebounced(text), 350);
  }, []);

  // Build query params based on active filter
  const queryParams = React.useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      status: 'active',
      limit: 50,
    };
    if (searchDebounced.trim()) params.search = searchDebounced.trim();
    if (activeFilter === 'exams') params.assignmentType = 'exam';
    if (activeFilter === 'projects') params.assignmentType = 'project';
    // "my_courses" filtering is done client-side below using the user's enrolled courses
    return params;
  }, [searchDebounced, activeFilter]);

  const { data: response, isLoading, isError, refetch, isFetching } =
    useListAssignments(queryParams as Parameters<typeof useListAssignments>[0]);

  const allAssignments: AssignmentSummary[] =
    (response as { data?: AssignmentSummary[] } | undefined)?.data ?? [];

  // Client-side "My Courses" filter
  const assignments = React.useMemo(() => {
    if (activeFilter !== 'my_courses') return allAssignments;
    const myCourseIds = new Set(user?.courses?.map((c) => c.course_id) ?? []);
    if (myCourseIds.size === 0) return allAssignments;
    return allAssignments.filter((a) => myCourseIds.has(a.course_id));
  }, [allAssignments, activeFilter, user?.courses]);

  const handleCardPress = useCallback((assignmentId: string) => {
    router.push(`/assignment/${assignmentId}`);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + SPACING.sm, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Assignments
        </Text>
        <Pressable
          onPress={() => router.push('/upload')}
          hitSlop={8}
          style={[styles.notifButton, { backgroundColor: colors.muted }]}
          accessibilityLabel="Upload assignment"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.muted, borderRadius: BORDER_RADIUS.lg },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search assignments…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 ? (
            <Pressable onPress={() => { setSearch(''); setSearchDebounced(''); }} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter chips */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => {
          const active = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.primary : colors.muted,
                  borderRadius: BORDER_RADIUS.lg,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: active ? '#FFFFFF' : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Feed */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton
              key={i}
              width="100%"
              height={120}
              borderRadius={BORDER_RADIUS.md}
              style={{ marginBottom: SPACING.sm }}
            />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>
            Couldn't load assignments
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.mutedForeground }]}>
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item.assignment_id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 88 }, // 88 = FAB area
          ]}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title={
                activeFilter === 'my_courses'
                  ? 'No assignments for your courses'
                  : searchDebounced
                  ? 'No results found'
                  : 'No assignments yet'
              }
              description={
                activeFilter === 'my_courses'
                  ? 'Assignments for your enrolled courses will appear here.'
                  : searchDebounced
                  ? `Try a different search term.`
                  : 'Be the first to upload an assignment for your class.'
              }
            />
          }
          renderItem={({ item }) => (
            <AssignmentCard
              assignment={item}
              onPress={() => handleCardPress(item.assignment_id)}
            />
          )}
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: pressed ? '#1D4ED8' : colors.primary,
            bottom: insets.bottom + SPACING.lg,
            shadowColor: colors.primary,
          },
        ]}
        onPress={() => router.push('/upload')}
        accessibilityLabel="Upload Assignment"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  notifButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
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
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  listContent: {
    padding: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});
