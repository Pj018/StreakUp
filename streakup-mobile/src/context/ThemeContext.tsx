import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_THEME = '@streakup_theme_mode';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceCard: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  flamePrimary: string;
  flameGlow: string;
  accentIndigo: string;
  accentGreen: string;
  accentPurple: string;
  accentRed: string;
  tabBarBg: string;
  tabBarBorder: string;
  inputBg: string;
  inputBorder: string;
  badgeBg: string;
  quoteBg: string;
  divider: string;
}

export const DARK_THEME: ThemeColors = {
  isDark: true,
  background: '#070B14', // Pitch AMOLED Deep Night
  surface: '#0F172A', // Sleek Slate 900
  surfaceElevated: '#1E293B', // Slate 800
  surfaceCard: '#0D1527', // Deep card surface
  border: '#1E293B',
  borderSubtle: '#172238',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  flamePrimary: '#FF6B00', // Glowing Neon Flame
  flameGlow: 'rgba(255, 107, 0, 0.28)',
  accentIndigo: '#6366F1',
  accentGreen: '#10B981',
  accentPurple: '#A855F7',
  accentRed: '#EF4444',
  tabBarBg: '#090E1A',
  tabBarBorder: '#1E293B',
  inputBg: '#131D33',
  inputBorder: '#27354F',
  badgeBg: '#131D33',
  quoteBg: '#0B1324',
  divider: '#1E293B',
};

export const LIGHT_THEME: ThemeColors = {
  isDark: false,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  surfaceCard: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  flamePrimary: '#EA580C',
  flameGlow: 'rgba(234, 88, 12, 0.15)',
  accentIndigo: '#4F46E5',
  accentGreen: '#10B981',
  accentPurple: '#8B5CF6',
  accentRed: '#EF4444',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  badgeBg: '#F1F5F9',
  quoteBg: '#EFF6FF',
  divider: '#F1F5F9',
};

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark'); // Default to awesome Dark Mode!

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_THEME)
      .then(saved => {
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          setThemeModeState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, mode);
    } catch (e) {}
  };

  const toggleTheme = async () => {
    const nextMode = isDark ? 'light' : 'dark';
    await setThemeMode(nextMode);
  };

  const isDark =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
