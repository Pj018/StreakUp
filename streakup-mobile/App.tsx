// StreakUp Mobile App - Main Application Navigator with OTA Live Update Support
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { HabitProvider } from './src/context/HabitContext';

import TodayScreen from './src/screens/TodayScreen';
import HabitsManageScreen from './src/screens/HabitsManageScreen';
import StatsScreen from './src/screens/StatsScreen';
import BadgesScreen from './src/screens/BadgesScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

type TabType = 'Today' | 'Habits' | 'Stats' | 'Badges';
type AuthScreenType = 'Login' | 'Register';

function MainApp() {
  const { user, isLoading } = useAuth();
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('Today');
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('Login');
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.flamePrimary} />
      </View>
    );
  }

  // Not logged in: Show Auth screens
  if (!user) {
    const authNav = {
      navigate: (screen: AuthScreenType) => setAuthScreen(screen),
    };

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {authScreen === 'Login' ? (
          <LoginScreen navigation={authNav} />
        ) : (
          <RegisterScreen navigation={authNav} />
        )}
      </View>
    );
  }

  // Logged in: Main Screens & Bottom Navigation Bar
  const renderScreen = () => {
    switch (activeTab) {
      case 'Today':
        return <TodayScreen />;
      case 'Habits':
        return <HabitsManageScreen />;
      case 'Stats':
        return <StatsScreen />;
      case 'Badges':
        return <BadgesScreen />;
      default:
        return <TodayScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Active Screen */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Themed Bottom Tab Bar */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.tabBarBorder,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Today')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.tabIconWrap,
              activeTab === 'Today' && {
                backgroundColor: isDark ? 'rgba(255, 107, 0, 0.16)' : '#FFF7ED',
              },
            ]}
          >
            <Ionicons
              name={activeTab === 'Today' ? 'flame' : 'flame-outline'}
              size={22}
              color={activeTab === 'Today' ? colors.flamePrimary : colors.textMuted}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: colors.textMuted },
              activeTab === 'Today' && { color: colors.flamePrimary, fontWeight: '800' },
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Habits')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.tabIconWrap,
              activeTab === 'Habits' && {
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.16)' : '#EEF2FF',
              },
            ]}
          >
            <Ionicons
              name={activeTab === 'Habits' ? 'list' : 'list-outline'}
              size={22}
              color={activeTab === 'Habits' ? colors.accentIndigo : colors.textMuted}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: colors.textMuted },
              activeTab === 'Habits' && { color: colors.accentIndigo, fontWeight: '800' },
            ]}
          >
            Habits
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Stats')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.tabIconWrap,
              activeTab === 'Stats' && {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : '#ECFDF5',
              },
            ]}
          >
            <Ionicons
              name={activeTab === 'Stats' ? 'stats-chart' : 'stats-chart-outline'}
              size={22}
              color={activeTab === 'Stats' ? colors.accentGreen : colors.textMuted}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: colors.textMuted },
              activeTab === 'Stats' && { color: colors.accentGreen, fontWeight: '800' },
            ]}
          >
            Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Badges')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.tabIconWrap,
              activeTab === 'Badges' && {
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.16)' : '#FEF3C7',
              },
            ]}
          >
            <Ionicons
              name={activeTab === 'Badges' ? 'trophy' : 'trophy-outline'}
              size={22}
              color={activeTab === 'Badges' ? '#F59E0B' : colors.textMuted}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: colors.textMuted },
              activeTab === 'Badges' && { color: '#F59E0B', fontWeight: '800' },
            ]}
          >
            Badges
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  useEffect(() => {
    async function checkForLiveUpdates() {
      try {
        if (__DEV__) return;
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        // Silent update check
      }
    }

    checkForLiveUpdates();
    const interval = setInterval(checkForLiveUpdates, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <HabitProvider>
            <MainApp />
          </HabitProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 3,
  },
  tabIconWrap: {
    padding: 4,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
