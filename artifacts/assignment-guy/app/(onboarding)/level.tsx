/**
 * Onboarding Step 3 — Select Academic Level
 * Static list (no API needed). Level codes: 1-4 = Year 1-4, 5 = Postgraduate, 0 = Other
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

const LEVELS = [
  { value: 1, label: 'Year 1', description: 'First year student' },
  { value: 2, label: 'Year 2', description: 'Second year student' },
  { value: 3, label: 'Year 3', description: 'Third year student' },
  { value: 4, label: 'Year 4', description: 'Fourth year student' },
  { value: 5, label: 'Postgraduate', description: 'Masters, PhD, or equivalent' },
  { value: 0, label: 'Other', description: 'Foundation year, transfer, etc.' },
];

export default function LevelScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { schoolId, schoolName, departmentId, departmentName } =
    useLocalSearchParams<{
      schoolId: string;
      schoolName: string;
      departmentId: string;
      departmentName: string;
    }>();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const handleContinue = () => {
    if (selectedLevel === null) return;
    router.push({
      pathname: '/(onboarding)/courses',
      params: {
        schoolId,
        schoolName,
        departmentId,
        departmentName,
        level: String(selectedLevel),
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

        <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 3 of 4</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          What year are you in?
        </Text>
        <View style={[styles.breadcrumb, { backgroundColor: colors.secondary, borderRadius: 8 }]}>
          <Ionicons name="library-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.breadcrumbText, { color: colors.mutedForeground }]}>
            {departmentName}
          </Text>
        </View>
      </View>

      <FlatList
        data={LEVELS}
        keyExtractor={(item) => String(item.value)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedLevel === item.value;
          return (
            <Pressable
              onPress={() => setSelectedLevel(item.value)}
              style={[
                styles.levelItem,
                {
                  backgroundColor: isSelected ? colors.primaryLight : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: 12,
                },
              ]}
            >
              <View style={styles.levelInfo}>
                <Text
                  style={[
                    styles.levelLabel,
                    { color: isSelected ? colors.primary : colors.foreground },
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={[styles.levelDesc, { color: colors.mutedForeground }]}>
                  {item.description}
                </Text>
              </View>
              {isSelected ? (
                <View
                  style={[
                    styles.checkCircle,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                </View>
              ) : (
                <View
                  style={[styles.emptyCircle, { borderColor: colors.border }]}
                />
              )}
            </Pressable>
          );
        }}
      />

      {/* Continue button */}
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
          title="Continue"
          variant="primary"
          fullWidth
          size="lg"
          disabled={selectedLevel === null}
          onPress={handleContinue}
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
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1.5,
  },
  levelInfo: { flex: 1 },
  levelLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  levelDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
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
