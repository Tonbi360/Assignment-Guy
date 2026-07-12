/**
 * Input — Form input component
 * Supports: label, placeholder, error state, focus state, secure text
 * Design tokens: 12px radius, Inter_400Regular, F8FAFC background
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { SPACING } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: object;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    secureTextEntry,
    containerStyle,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.input,
            borderColor,
            borderRadius: colors.radius,
          },
        ]}
      >
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { color: colors.foreground },
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setIsSecure((prev) => !prev)}
            style={styles.toggleButton}
            hitSlop={8}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.mutedForeground}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hintText, { color: colors.mutedForeground }]}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    paddingVertical: 14,
  },
  toggleButton: {
    paddingLeft: SPACING.sm,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  hintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
});
