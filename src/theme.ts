// src/theme.ts
import { MD3LightTheme, type MD3Theme } from 'react-native-paper';
import type { ExpiryStatus } from './types/product';
import { DefaultTheme as NavigationDefaultTheme, type Theme } from '@react-navigation/native';

export const theme: MD3Theme = {
  ...MD3LightTheme,                 // copy everything from the default theme
  colors: {
    ...MD3LightTheme.colors,        // copy all default colours
    primary: '#2E7D4F',             // then replace these ones
    primaryContainer: '#D4EDDC',
    background: '#F3F5F2',
  },
};

export const navigationTheme: Theme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: theme.colors.primary,          // active tab, back button
    background: theme.colors.background,    // behind every screen
    card: theme.colors.surface,             // headers + tab bar
    text: theme.colors.onSurface,           // header titles
    border: theme.colors.outlineVariant,
  },
};

export const expiryColors: Record<ExpiryStatus, { bg: string; fg: string }> = {
  fine:    { bg: '#E3F4E8', fg: '#2E7D4F' },  // green
  soon:    { bg: '#FFF1DC', fg: '#B86E00' },  // orange
  expired: { bg: '#FDE4E4', fg: '#C62828' },  // red
};