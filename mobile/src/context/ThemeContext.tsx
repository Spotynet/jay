import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

export const ENTITY_COLORS = {
  tasks: '#F43F5E',    // Rose Red
  events: '#F59E0B',   // Amber Gold
  habits: '#3B82F6',   // Vibrant Blue
  journal: '#A855F7',  // Orchid Purple
  workouts: '#21afcf', // Cyan Blue
  finance: '#1aad46',  // Forest Green
};

interface ThemeContextType {
  theme: ThemeType;
  accentColor: string;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  setAccentColor: (color: string) => void;
  colors: any;
  entityColors: typeof ENTITY_COLORS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENT_COLORS = [
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF9500', // Orange
  '#34C759', // Green
  '#AF52DE', // Indigo
];

const THEME_STORAGE_KEY = '@jay_theme';
const ACCENT_STORAGE_KEY = '@jay_accent_color';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [accentColor, setAccentColorState] = useState('#FF2D55');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedTheme, savedAccent] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(ACCENT_STORAGE_KEY),
        ]);

        if (savedTheme) setThemeState(savedTheme as ThemeType);
        if (savedAccent) setAccentColorState(savedAccent);
      } catch (e) {
        console.error('Failed to load theme settings', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const setAccentColor = async (newColor: string) => {
    setAccentColorState(newColor);
    try {
      await AsyncStorage.setItem(ACCENT_STORAGE_KEY, newColor);
    } catch (e) {
      console.error('Failed to save accent color', e);
    }
  };

  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';

  const colors = {
    background: isDark ? '#09090A' : '#F2F2F7',
    surface: isDark ? '#1C1C1E' : '#FFFFFF',
    surfaceElevated: isDark ? '#2C2C2E' : '#E5E5EA',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#38383A' : '#C6C6C8',
    subtext: isDark ? '#8E8E93' : '#636366',
    accent: accentColor,
    error: '#FF3B30',
  };

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, accentColor, isDark, setTheme, setAccentColor, colors, entityColors: ENTITY_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
