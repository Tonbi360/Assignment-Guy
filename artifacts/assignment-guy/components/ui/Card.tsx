/**
 * Card — Container component for raised content
 * Design tokens: 16px radius, soft shadow, F8FAFC background
 */

import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { SPACING } from '@/constants/colors';

interface CardProps extends ViewProps {
  padding?: keyof typeof SPACING | number;
  shadow?: boolean;
}

export function Card({ children, style, padding = 'md', shadow = true, ...rest }: CardProps) {
  const colors = useColors();

  const paddingValue = typeof padding === 'number'
    ? padding
    : SPACING[padding];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 16,
          padding: paddingValue,
        },
        shadow && styles.shadow,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
