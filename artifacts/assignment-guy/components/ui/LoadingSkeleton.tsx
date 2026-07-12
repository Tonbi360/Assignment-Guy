/**
 * LoadingSkeleton — Animated placeholder while data loads
 * Per UX spec: "Skeleton cards" preferred over spinners for list content
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { SPACING } from '@/constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.secondary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** A card-shaped skeleton for assignment/course list items */
export function CardSkeleton() {
  const colors = useColors();
  return (
    <View
      style={[
        styles.cardSkeleton,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16 },
      ]}
    >
      <View style={styles.cardHeader}>
        <Skeleton width={80} height={12} borderRadius={6} />
        <Skeleton width={60} height={20} borderRadius={8} />
      </View>
      <Skeleton width="90%" height={14} borderRadius={6} style={{ marginTop: SPACING.sm }} />
      <Skeleton width="60%" height={12} borderRadius={6} style={{ marginTop: SPACING.xs }} />
      <View style={styles.cardFooter}>
        <Skeleton width={100} height={12} borderRadius={6} />
        <Skeleton width={70} height={12} borderRadius={6} />
      </View>
    </View>
  );
}

/** A row-shaped skeleton for school/department/course list items */
export function RowSkeleton() {
  const colors = useColors();
  return (
    <View
      style={[
        styles.rowSkeleton,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 },
      ]}
    >
      <View style={styles.rowContent}>
        <Skeleton width="70%" height={14} borderRadius={6} />
        <Skeleton width="40%" height={11} borderRadius={6} style={{ marginTop: SPACING.xs }} />
      </View>
      <Skeleton width={20} height={20} borderRadius={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  rowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    justifyContent: 'space-between',
  },
  rowContent: {
    flex: 1,
    gap: SPACING.xs,
  },
});
