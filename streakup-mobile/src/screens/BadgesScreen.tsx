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

export default function BadgesScreen() {
  const { badges } = useHabits();
  const insets = useSafeAreaInsets();

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const safeTopPadding = Math.max(insets.top, 46) + 12;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: safeTopPadding }]}>
        <View>
          <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
          <Text style={styles.unlockedSub}>
            {unlockedCount} of {badges.length} Badges Unlocked
          </Text>
        </View>
        <View style={styles.trophyCircle}>
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
                badge.unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  badge.unlocked ? styles.iconUnlocked : styles.iconLocked,
                ]}
              >
                <Ionicons
                  name={badge.unlocked ? 'ribbon' : 'lock-closed'}
                  size={26}
                  color={badge.unlocked ? '#D97706' : '#94A3B8'}
                />
              </View>

              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>

              {badge.unlocked ? (
                <View style={styles.unlockedTag}>
                  <Ionicons name="checkmark-sharp" size={12} color="#059669" />
                  <Text style={styles.unlockedText}>Unlocked</Text>
                </View>
              ) : (
                <View style={styles.lockedTag}>
                  <Text style={styles.lockedText}>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  unlockedSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  trophyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
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
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    justifyContent: 'space-between',
    minHeight: 180,
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeCardUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FDE68A',
  },
  badgeCardLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconUnlocked: {
    backgroundColor: '#FEF3C7',
  },
  iconLocked: {
    backgroundColor: '#E2E8F0',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 10,
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  unlockedText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  lockedTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
});
