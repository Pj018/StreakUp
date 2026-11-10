import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';

export default function StatsScreen() {
  const { user } = useAuth();
  const { habits, heatmap } = useHabits();
  const insets = useSafeAreaInsets();

  const currentXp = user?.xpPoints ?? 0;
  const currentLevel = user?.currentLevel ?? 1;
  const xpNeeded = 100 - (currentXp % 100);
  const progressPercent = Math.min(100, Math.round(((currentXp % 100) / 100) * 100));

  const totalCompletions = user?.totalCompletions ?? habits.filter(h => h.completedToday).length;
  const longestStreakOverall = Math.max(0, ...habits.map(h => h.longestStreak ?? 0));
  const shieldsLeft = user?.streakShields ?? 1;

  const getRankTitle = (lvl: number) => {
    if (lvl <= 1) return 'Routine Starter';
    if (lvl === 2) return 'Habit Builder';
    if (lvl === 3) return 'Discipline Adept';
    if (lvl === 4) return 'Consistency Pro';
    return 'Discipline Master';
  };

  const rankDescription =
    currentXp === 0
      ? 'Complete daily habits to earn XP and level up your rank!'
      : totalCompletions === 1
      ? 'Great start! Keep building momentum daily.'
      : 'Consistently crushing goals. Keep your streak alive!';

  // Real 8-week (56 days) activity matrix based on genuine completion logs
  const todayCompletions = habits.filter(h => h.completedToday).length;
  const heatmapDays = Array.from({ length: 56 }).map((_, idx) => {
    // idx 0 = 55 days ago, idx 55 = today
    if (heatmap && heatmap.length >= 56) {
      const entry = heatmap[heatmap.length - 56 + idx];
      let count = entry?.count ?? 0;
      if (idx === 55 && todayCompletions > count) {
        count = todayCompletions;
      }
      return { day: idx, count };
    }
    return {
      day: idx,
      count: idx === 55 ? todayCompletions : 0,
    };
  });

  const getHeatmapColor = (count: number) => {
    if (count === 0) return '#F1F5F9';
    if (count === 1) return '#A7F3D0';
    if (count === 2) return '#34D399';
    if (count === 3) return '#10B981';
    return '#059669';
  };

  const safeTopPadding = Math.max(insets.top, 46) + 12;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: safeTopPadding }]}>
        <Text style={styles.headerTitle}>CONSISTENCY MATRIX</Text>
        <Text style={styles.headerSub}>Discipline & Activity Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= LEVEL & XP PROGRESS CARD ================= */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <View style={styles.rankPill}>
                <Text style={styles.rankPillText}>CURRENT RANK</Text>
              </View>
              <Text style={styles.levelTitle}>
                Level {currentLevel}: {getRankTitle(currentLevel)}
              </Text>
              <Text style={styles.levelDesc}>{rankDescription}</Text>
            </View>
            <View style={styles.starCircle}>
              <Ionicons name="star" size={26} color="#D97706" />
            </View>
          </View>

          <View style={styles.xpRow}>
            <Text style={styles.xpText}>{currentXp} Total XP</Text>
            <Text style={styles.xpTextNext}>{xpNeeded} XP to Level {currentLevel + 1}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* ================= 3 STATS PILLARS ================= */}
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>🔥</Text>
            <Text style={styles.metricValue}>{longestStreakOverall} d</Text>
            <Text style={styles.metricLabel}>Best Streak</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>🛡️</Text>
            <Text style={styles.metricValue}>{shieldsLeft}</Text>
            <Text style={styles.metricLabel}>Shields Left</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>🎯</Text>
            <Text style={styles.metricValue}>{totalCompletions}</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
        </View>

        {/* ================= 8-WEEK GITHUB-STYLE HEATMAP ================= */}
        <View style={styles.heatmapCard}>
          <View style={styles.heatmapHeader}>
            <View>
              <Text style={styles.heatmapTitle}>Activity Matrix (Last 8 Weeks)</Text>
              <Text style={styles.heatmapSub}>Green squares indicate days with completed habits</Text>
            </View>
            <View style={styles.legend}>
              <View style={[styles.legendBox, { backgroundColor: '#F1F5F9' }]} />
              <View style={[styles.legendBox, { backgroundColor: '#34D399' }]} />
              <View style={[styles.legendBox, { backgroundColor: '#059669' }]} />
            </View>
          </View>

          <View style={styles.gridContainer}>
            {heatmapDays.map(item => (
              <View
                key={item.day}
                style={[
                  styles.gridBox,
                  { backgroundColor: getHeatmapColor(item.count) },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ================= MOTIVATIONAL TIP ================= */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Ionicons name="sparkles" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>The 2-Day Rule</Text>
            <Text style={styles.tipDesc}>
              Never allow yourself to skip a habit two days in a row. One day off is recovery; two days off is the start of a new habit!
            </Text>
          </View>
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
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  rankPillText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  levelDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  starCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
  },
  xpTextNext: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '800',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 5,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  metricEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  heatmapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heatmapTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  heatmapSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  gridBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  tipDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
});
