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
import { useTheme } from '../context/ThemeContext';

export default function StatsScreen() {
  const { user } = useAuth();
  const { habits, heatmap } = useHabits();
  const { isDark, colors } = useTheme();
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
    if (count === 0) return isDark ? '#141E33' : '#F1F5F9';
    if (count === 1) return isDark ? '#064E3B' : '#A7F3D0';
    if (count === 2) return isDark ? '#059669' : '#34D399';
    if (count === 3) return '#10B981';
    return isDark ? '#34D399' : '#059669';
  };

  const safeTopPadding = Math.max(insets.top, 46) + 12;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: safeTopPadding, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>CONSISTENCY MATRIX</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Discipline & Activity Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= LEVEL & XP PROGRESS CARD ================= */}
        <View style={[styles.levelCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={styles.levelHeader}>
            <View>
              <View style={[styles.rankPill, { backgroundColor: isDark ? 'rgba(255, 107, 0, 0.18)' : '#FFF7ED', borderColor: isDark ? '#78350F' : '#FED7AA' }]}>
                <Text style={[styles.rankPillText, { color: colors.flamePrimary }]}>CURRENT RANK</Text>
              </View>
              <Text style={[styles.levelTitle, { color: colors.textPrimary }]}>
                Level {currentLevel}: {getRankTitle(currentLevel)}
              </Text>
              <Text style={[styles.levelDesc, { color: colors.textSecondary }]}>{rankDescription}</Text>
            </View>
            <View style={[styles.starCircle, { backgroundColor: isDark ? '#2D1F08' : '#FEF3C7', borderColor: isDark ? '#B45309' : '#FDE68A' }]}>
              <Ionicons name="star" size={26} color="#D97706" />
            </View>
          </View>

          <View style={styles.xpRow}>
            <Text style={[styles.xpText, { color: colors.textPrimary }]}>{currentXp} Total XP</Text>
            <Text style={[styles.xpTextNext, { color: colors.textSecondary }]}>{xpNeeded} XP to Level {currentLevel + 1}</Text>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.flamePrimary }]} />
          </View>
        </View>

        {/* ================= 3 STATS PILLARS ================= */}
        <View style={styles.metricRow}>
          <View style={[styles.metricCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <Text style={styles.metricEmoji}>🔥</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{longestStreakOverall} d</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Best Streak</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <Text style={styles.metricEmoji}>🛡️</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{shieldsLeft}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Shields Left</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <Text style={styles.metricEmoji}>🎯</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{totalCompletions}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
        </View>

        {/* ================= 8-WEEK GITHUB-STYLE HEATMAP ================= */}
        <View style={[styles.heatmapCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={styles.heatmapHeader}>
            <View>
              <Text style={[styles.heatmapTitle, { color: colors.textPrimary }]}>Activity Matrix (Last 8 Weeks)</Text>
              <Text style={[styles.heatmapSub, { color: colors.textSecondary }]}>Green squares indicate days with completed habits</Text>
            </View>
            <View style={styles.legend}>
              <View style={[styles.legendBox, { backgroundColor: isDark ? '#141E33' : '#F1F5F9' }]} />
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
        <View style={[styles.tipCard, { backgroundColor: isDark ? '#1B1405' : '#FFFBEB', borderColor: isDark ? '#78350F' : '#FDE68A' }]}>
          <View style={[styles.tipIconWrap, { backgroundColor: isDark ? '#2D1F08' : '#FEF3C7' }]}>
            <Ionicons name="sparkles" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tipTitle, { color: isDark ? '#FCD34D' : '#92400E' }]}>The 2-Day Rule</Text>
            <Text style={[styles.tipDesc, { color: isDark ? '#FDE68A' : '#B45309' }]}>
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
  },
  header: {
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
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  levelCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
  },
  rankPillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  levelDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  starCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '800',
  },
  xpTextNext: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 1,
  },
  metricEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  heatmapCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
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
  },
  heatmapSub: {
    fontSize: 11,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
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
    borderRadius: 6,
  },
  tipCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tipDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
