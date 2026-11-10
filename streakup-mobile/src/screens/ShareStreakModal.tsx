import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  streakCount: number;
  userName: string;
  level: number;
  xpPoints: number;
  completedToday: number;
  totalHabits: number;
}

export default function ShareStreakModal({
  visible,
  onClose,
  streakCount,
  userName,
  level,
  xpPoints,
  completedToday,
  totalHabits,
}: Props) {
  const displayStreak = Math.max(1, streakCount);
  const shareMessage = `🔥 I'm on a ${displayStreak}-day discipline streak on StreakUp!\n\n⚡ Level ${level} Explorer • ${xpPoints} XP\n🎯 Completed ${completedToday}/${totalHabits} daily habits today.\n\nBuilding daily consistency! Keep your discipline flame glowing! 🚀\n#StreakUp #DailyDiscipline`;

  const handleShareWhatsApp = async () => {
    triggerHaptic.success();
    const url = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message: shareMessage });
      }
    } catch (e) {
      await Share.share({ message: shareMessage });
    }
  };

  const handleGeneralShare = async () => {
    triggerHaptic.light();
    try {
      await Share.share({ message: shareMessage });
    } catch (e) {
      // Ignore
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>

          {/* Social Story Poster Card */}
          <View style={styles.posterCard}>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>🔥 StreakUp</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                <Text style={styles.verifiedText}>DISCIPLINE CLUB</Text>
              </View>
            </View>

            {/* Giant Flame & Streak */}
            <View style={styles.streakCenter}>
              <View style={styles.flameGlow}>
                <Text style={styles.flameEmoji}>🔥</Text>
              </View>
              <Text style={styles.streakNumber}>{displayStreak}</Text>
              <Text style={styles.streakWord}>DAY STREAK</Text>
              <Text style={styles.streakTagline}>Unstoppable Consistency</Text>
            </View>

            {/* User Stats Pill Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>Lv. {level}</Text>
                <Text style={styles.statLabel}>RANK</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{xpPoints} XP</Text>
                <Text style={styles.statLabel}>EARNED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{completedToday}/{totalHabits}</Text>
                <Text style={styles.statLabel}>TODAY</Text>
              </View>
            </View>

            {/* User Signature */}
            <View style={styles.userFootprint}>
              <Text style={styles.userNameText}>Achieved by {userName || 'Streak Master'}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.whatsAppBtn}
              onPress={handleShareWhatsApp}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.whatsAppBtnText}>Share to WhatsApp Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreShareBtn}
              onPress={handleGeneralShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={18} color="#4F46E5" />
              <Text style={styles.moreShareBtnText}>Share to Instagram / Others</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  posterCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  streakCenter: {
    alignItems: 'center',
    marginVertical: 10,
  },
  flameGlow: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(234, 88, 12, 0.5)',
    marginBottom: 8,
  },
  flameEmoji: {
    fontSize: 42,
  },
  streakNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 56,
    letterSpacing: -1,
  },
  streakWord: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 2,
    marginTop: -2,
  },
  streakTagline: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  userFootprint: {
    marginTop: 14,
  },
  userNameText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  whatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  moreShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 11,
    borderRadius: 14,
    gap: 6,
  },
  moreShareBtnText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '800',
  },
});
