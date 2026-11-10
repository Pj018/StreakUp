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
  const [activeTab, setActiveTab] = useState<TabType>('Today');
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('Login');
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Not logged in: Show Auth screens
  if (!user) {
    const authNav = {
      navigate: (screen: AuthScreenType) => setAuthScreen(screen),
    };

    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
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
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Active Screen */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Clean Light Bottom Tab Bar with safe bottom inset */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('Today')}
          activeOpacity={0.7}
        >
          <View style={[styles.tabIconWrap, activeTab === 'Today' && styles.tabIconWrapActiveOrange]}>
            <Ionicons
              name={activeTab === 'Today' ? 'flame' : 'flame-outline'}
              size={22}
              color={activeTab === 'Today' ? '#EA580C' : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Today' && styles.tabLabelActiveToday,
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
          <View style={[styles.tabIconWrap, activeTab === 'Habits' && styles.tabIconWrapActiveIndigo]}>
            <Ionicons
              name={activeTab === 'Habits' ? 'list' : 'list-outline'}
              size={22}
              color={activeTab === 'Habits' ? '#4F46E5' : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Habits' && styles.tabLabelActive,
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
          <View style={[styles.tabIconWrap, activeTab === 'Stats' && styles.tabIconWrapActiveGreen]}>
            <Ionicons
              name={activeTab === 'Stats' ? 'stats-chart' : 'stats-chart-outline'}
              size={22}
              color={activeTab === 'Stats' ? '#10B981' : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Stats' && styles.tabLabelActiveStats,
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
          <View style={[styles.tabIconWrap, activeTab === 'Badges' && styles.tabIconWrapActiveGold]}>
            <Ionicons
              name={activeTab === 'Badges' ? 'trophy' : 'trophy-outline'}
              size={22}
              color={activeTab === 'Badges' ? '#D97706' : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Badges' && styles.tabLabelActiveBadges,
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
        // Safe fallback if offline
      }
    }

    checkForLiveUpdates();
    const interval = setInterval(checkForLiveUpdates, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <HabitProvider>
          <MainApp />
        </HabitProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
  tabIconWrapActiveOrange: {
    backgroundColor: '#FFF7ED',
  },
  tabIconWrapActiveIndigo: {
    backgroundColor: '#EEF2FF',
  },
  tabIconWrapActiveGreen: {
    backgroundColor: '#ECFDF5',
  },
  tabIconWrapActiveGold: {
    backgroundColor: '#FEF3C7',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabLabelActiveToday: {
    color: '#EA580C',
    fontWeight: '800',
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  tabLabelActiveStats: {
    color: '#10B981',
    fontWeight: '800',
  },
  tabLabelActiveBadges: {
    color: '#D97706',
    fontWeight: '800',
  },
});
