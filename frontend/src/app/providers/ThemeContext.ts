import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
  isDark: true,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
