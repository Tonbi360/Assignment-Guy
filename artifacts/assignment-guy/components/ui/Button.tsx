/**
 * Button — Primary interactive component
 * Variants: primary | secondary | outline | ghost | danger
 * Follows Design Tokens: 12px radius, 16px vertical padding, Inter_600SemiBold
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { SPACING } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  ...rest
}: ButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    if (!loading && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(e);
    }
  };

  const getContainerStyle = () => {
    const base = {
      borderRadius: colors.radius,
      borderWidth: variant === 'outline' ? 1.5 : 0,
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: colors.primary, borderColor: 'transparent' };
      case 'secondary':
        return { ...base, backgroundColor: colors.secondary, borderColor: 'transparent' };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderColor: colors.border };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent', borderColor: 'transparent' };
      case 'danger':
        return { ...base, backgroundColor: colors.destructive, borderColor: 'transparent' };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return colors.primaryForeground;
      case 'secondary': return colors.secondaryForeground;
      case 'outline': return colors.foreground;
      case 'ghost': return colors.primary;
      case 'danger': return colors.destructiveForeground;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case 'md': return { paddingVertical: 14, paddingHorizontal: SPACING.lg };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: SPACING.xl };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'md': return 15;
      case 'lg': return 16;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={[
        styles.base,
        getContainerStyle(),
        getPadding(),
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
});
