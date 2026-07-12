/**
 * Assignment Guy Design Tokens
 * Source of truth: UI Design System (Doc 3) + Design Tokens & Component Library (Doc 9)
 *
 * Spacing system (8px grid): 4 | 8 | 16 | 24 | 32 | 48
 * Border radius: 8 (small), 12 (inputs/buttons), 16 (cards), 24 (dialogs)
 * Primary: Blue #2563EB — modern academic, trust, clarity
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,  // inputs, buttons
  lg: 16,  // cards
  xl: 24,  // dialogs, bottom sheets
} as const;

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#0F172A',
    tint: '#2563EB',

    // Core surfaces
    background: '#FFFFFF',
    foreground: '#0F172A',

    // Cards / elevated surfaces
    card: '#F8FAFC',
    cardForeground: '#0F172A',

    // Primary action color — blue
    primary: '#2563EB',
    primaryForeground: '#FFFFFF',
    primaryLight: '#EFF6FF',

    // Secondary
    secondary: '#F1F5F9',
    secondaryForeground: '#1E293B',

    // Muted / subdued
    muted: '#F1F5F9',
    mutedForeground: '#64748B',

    // Accent
    accent: '#EFF6FF',
    accentForeground: '#2563EB',

    // Destructive
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',

    // Borders and inputs
    border: '#E2E8F0',
    input: '#F8FAFC',

    // Semantic status colors
    success: '#22C55E',
    successLight: '#F0FDF4',
    warning: '#F97316',
    warningLight: '#FFF7ED',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    info: '#3B82F6',
    infoLight: '#EFF6FF',

    // Assignment status colors (per UI Design System doc)
    statusActive: '#2563EB',
    statusActiveLight: '#EFF6FF',
    statusDueSoon: '#F97316',
    statusDueSoonLight: '#FFF7ED',
    statusOverdue: '#EF4444',
    statusOverdueLight: '#FEF2F2',
    statusCompleted: '#22C55E',
    statusCompletedLight: '#F0FDF4',
    statusInProgress: '#3B82F6',
    statusArchived: '#94A3B8',
    statusArchivedLight: '#F1F5F9',
  },

  // Border radius base value (used by useColors().radius for cards, buttons, inputs)
  radius: 12,
};

export default colors;
