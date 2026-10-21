// src/theme.ts
import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const theme: MD3Theme = {
  ...MD3LightTheme,                 // copy everything from the default theme
  colors: {
    ...MD3LightTheme.colors,        // copy all default colours
    primary: '#2E7D4F',             // then replace these ones
    primaryContainer: '#D4EDDC',
    background: '#F3F5F2',
  },
};