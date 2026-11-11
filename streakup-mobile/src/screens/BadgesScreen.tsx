import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';

export default function BadgesScreen() {
  const { badges } = useHabits();
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const safeTopPadding = Math.max(insets.top, 46) + 12;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: safeTopPadding, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>ACHIEVEMENTS</Text>
          <Text style={[styles.unlockedSub, { color: colors.textSecondary }]}>
            {unlockedCount} of {badges.length} Badges Unlocked
          </Text>
        </View>
        <View style={[styles.trophyCircle, { backgroundColor: isDark ? '#2B1E07' : '#FEF3C7', borderColor: isDark ? '#B45309' : '#FDE68A' }]}>
          <Ionicons name="trophy" size={24} color="#D97706" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeGrid}>
          {badges.map(badge => (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                badge.unlocked
                  ? [
                      styles.badgeCardUnlocked,
                      isDark && {
                        backgroundColor: '#1C1506',
                        borderColor: '#B45309',
                      },
                    ]
                  : [
                      styles.badgeCardLocked,
                      isDark && {
                        backgroundColor: colors.surfaceCard,
                        borderColor: colors.border,
                      },
                    ],
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  badge.unlocked
                    ? [styles.iconUnlocked, isDark && { backgroundColor: '#2D1F08' }]
                    : [styles.iconLocked, isDark && { backgroundColor: '#141E33' }],
                ]}
              >
                <Ionicons
                  name={badge.unlocked ? 'ribbon' : 'lock-closed'}
                  size={26}
                  color={badge.unlocked ? '#D97706' : colors.textMuted}
                />
              </View>

              <Text style={[styles.badgeName, { color: colors.textPrimary }]}>{badge.name}</Text>
              <Text style={[styles.badgeDesc, { color: colors.textSecondary }]}>{badge.description}</Text>

              {badge.unlocked ? (
                <View style={[styles.unlockedTag, isDark && { backgroundColor: '#06281E', borderColor: '#059669', borderWidth: 1 }]}>
                  <Ionicons name="checkmark-sharp" size={12} color="#10B981" />
                  <Text style={[styles.unlockedText, isDark && { color: '#34D399' }]}>Unlocked</Text>
                </View>
              ) : (
                <View style={[styles.lockedTag, isDark && { backgroundColor: '#141E33' }]}>
                  <Text style={[styles.lockedText, isDark && { color: colors.textMuted }]}>
                    {badge.requiredStreak > 0
                      ? `${badge.requiredStreak}-Day Streak`
                      : `${badge.requiredXp} XP`}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  unlockedSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  trophyCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 2,
  },
  badgeCardLocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  badgeCardUnlocked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconLocked: {
    backgroundColor: '#F1F5F9',
  },
  iconUnlocked: {
    backgroundColor: '#FDE68A',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 12,
    flexGrow: 1,
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  unlockedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  lockedTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
});
