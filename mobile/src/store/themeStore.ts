import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  accentColor: '#0A84FF',
  setTheme: (theme) => set({ theme }),
  setAccentColor: (accentColor) => set({ accentColor }),
}));
