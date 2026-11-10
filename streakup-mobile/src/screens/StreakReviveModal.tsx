import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { useHabits } from '../context/HabitContext';
import { triggerHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface Props {
  habit: Habit;
  visible: boolean;
  onClose: () => void;
}

const SPONSOR_ADS = [
  {
    brand: 'NIKE RUNNING CLUB',
    tagline: 'Run with the world’s best coaches & athletes.',
    cta: 'Install Now • Free',
    color: '#EA580C',
    icon: 'fitness',
    theme: '#C2410C',
    videoTitle: 'Nike Zoom Fly 5: Speed Meets Daily Routine',
  },
  {
    brand: 'HEADSPACE: MEDITATION',
    tagline: 'Stress less. Sleep soundly. Build focus.',
    cta: 'Start 14-Day Free Trial',
    color: '#0284C7',
    icon: 'cloudy-night',
    theme: '#0369A1',
    videoTitle: 'Guided Morning Focus Capsule (10m)',
  },
  {
    brand: 'DUOLINGO SUPER',
    tagline: 'Learn languages 15 mins a day with streak rewards.',
    cta: 'Claim Free Pass',
    color: '#10B981',
    icon: 'chatbubbles',
    theme: '#059669',
    videoTitle: 'Duolingo: Build Lifelong Fluency',
  },
];

export default function StreakReviveModal({ habit, visible, onClose }: Props) {
  const { reviveStreakWithAd } = useHabits();
  const [adState, setAdState] = useState<'READY' | 'PLAYING' | 'REWARDED'>('READY');
  const [countdown, setCountdown] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const currentAd = SPONSOR_ADS[activeAdIndex];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (adState === 'PLAYING') {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      }).start();

      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAdFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adState]);

  const handleStartAd = () => {
    setActiveAdIndex(Math.floor(Math.random() * SPONSOR_ADS.length));
    setCountdown(10);
    setAdState('PLAYING');
  };

  const handleAdFinished = async () => {
    triggerHaptic.heavy();
    await reviveStreakWithAd(habit.id);
    setAdState('REWARDED');

    Animated.spring(celebrationAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        {/* ================= STAGE 1: RISK SCREEN ================= */}
        {adState === 'READY' && (
          <View style={styles.modalCard}>
            <Animated.View style={[styles.iconCircleWarning, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="flame" size={44} color="#EA580C" />
            </Animated.View>

            <View style={styles.tagDanger}>
              <Text style={styles.tagDangerText}>STREAK AT RISK</Text>
            </View>

            <Text style={styles.title}>Don't Lose Your Streak!</Text>
            <Text style={styles.desc}>
              You missed <Text style={styles.boldText}>"{habit.title}"</Text> yesterday.
              Your <Text style={styles.streakHighlight}>{habit.longestStreak || 5}-Day Streak 🔥</Text> is about to be wiped out!
            </Text>

            <View style={styles.rewardCard}>
              <View style={styles.rewardIconWrap}>
                <Ionicons name="shield-checkmark" size={22} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardTitle}>Instant Streak Revival</Text>
                <Text style={styles.rewardSub}>
                  Watch a 10s video ad to recover your full streak count without losing your rank.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.watchAdBtn} onPress={handleStartAd} activeOpacity={0.85}>
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.watchAdText}>Watch Video Ad (Save Streak)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Let Streak Reset to 0</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STAGE 2: INTERACTIVE VIDEO AD ================= */}
        {adState === 'PLAYING' && (
          <View style={styles.videoPlayerCard}>
            {/* Top Video Header */}
            <View style={styles.videoHeader}>
              <View style={styles.adPill}>
                <Text style={styles.adPillText}>AD • REWARDED VIDEO</Text>
              </View>

              <View style={styles.timerPill}>
                <Ionicons name="time-outline" size={14} color="#D97706" />
                <Text style={styles.timerText}>Reward in {countdown}s</Text>
              </View>

              <TouchableOpacity
                style={styles.muteBtn}
                onPress={() => setIsMuted(!isMuted)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={18}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>

            {/* Video Canvas */}
            <View style={[styles.videoCanvas, { borderColor: currentAd.color }]}>
              <View style={styles.videoContentBox}>
                <View style={[styles.brandIconLarge, { backgroundColor: currentAd.color }]}>
                  <Ionicons name={currentAd.icon as any} size={40} color="#FFFFFF" />
                </View>

                <Text style={styles.videoBrandName}>{currentAd.brand}</Text>
                <Text style={styles.videoTitleText}>{currentAd.videoTitle}</Text>
                <Text style={styles.videoTagline}>{currentAd.tagline}</Text>

                {/* Animated Soundwave bars */}
                <View style={styles.soundWaveRow}>
                  <View style={[styles.waveBar, { height: 16 }]} />
                  <View style={[styles.waveBar, { height: 28 }]} />
                  <View style={[styles.waveBar, { height: 22 }]} />
                  <View style={[styles.waveBar, { height: 32 }]} />
                  <View style={[styles.waveBar, { height: 18 }]} />
                  <View style={[styles.waveBar, { height: 26 }]} />
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { width: progressWidth, backgroundColor: currentAd.color },
                  ]}
                />
              </View>
            </View>

            {/* Video Footer CTA Bar */}
            <View style={styles.videoFooter}>
              <View style={{ flex: 1 }}>
                <Text style={styles.footerBrand}>{currentAd.brand}</Text>
                <Text style={styles.footerSub}>Sponsored Partner</Text>
              </View>
              <TouchableOpacity
                style={[styles.installBtn, { backgroundColor: currentAd.color }]}
                activeOpacity={0.8}
              >
                <Text style={styles.installBtnText}>{currentAd.cta}</Text>
                <Ionicons name="open-outline" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.videoTip}>
              ⚡ Keep watching until countdown finishes to claim your +1 Streak Revive!
            </Text>
          </View>
        )}

        {/* ================= STAGE 3: CELEBRATION REWARD SCREEN ================= */}
        {adState === 'REWARDED' && (
          <View style={styles.modalCard}>
            <Animated.View
              style={[
                styles.iconCircleSuccess,
                {
                  transform: [
                    {
                      scale: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={{ fontSize: 44 }}>🔥</Text>
            </Animated.View>

            <View style={styles.tagSuccess}>
              <Text style={styles.tagSuccessText}>STREAK RESCUED SUCCESSFULLY!</Text>
            </View>

            <Text style={styles.title}>You're Back in the Game!</Text>
            <Text style={styles.desc}>
              Your <Text style={styles.streakHighlight}>"{habit.title}"</Text> streak has been restored to{' '}
              <Text style={styles.streakHighlight}>{Math.max(1, habit.longestStreak)} Days 🔥</Text>.
            </Text>

            <View style={styles.revivedStatsBox}>
              <View style={styles.revivedStatItem}>
                <Text style={styles.revivedStatNumber}>+{habit.longestStreak || 5}</Text>
                <Text style={styles.revivedStatLabel}>Streak Restored</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.revivedStatItem}>
                <Text style={styles.revivedStatNumber}>+10 XP</Text>
                <Text style={styles.revivedStatLabel}>Reward Bonus</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.continueBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.continueText}>Claim & Return to Goals</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)', // Clean dim overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF', // Clean White Card
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircleWarning: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  iconCircleSuccess: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2.5,
    borderColor: '#A7F3D0',
  },
  tagDanger: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  tagDangerText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagSuccess: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tagSuccessText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
  },
  boldText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  streakHighlight: {
    color: '#EA580C',
    fontWeight: '900',
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    width: '100%',
  },
  rewardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  rewardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  watchAdBtn: {
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    marginBottom: 12,
    shadowColor: '#EA580C',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  watchAdText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  // Video Player Card Styles
  videoPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  adPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adPillText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timerText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
  },
  muteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCanvas: {
    height: 240,
    backgroundColor: '#0F172A', // Dark screen inside video for high contrast
    borderRadius: 18,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContentBox: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  brandIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  videoBrandName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  videoTitleText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  videoTagline: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  soundWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#334155',
  },
  progressBarFill: {
    height: '100%',
  },
  videoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footerBrand: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13,
  },
  footerSub: {
    color: '#64748B',
    fontSize: 10,
  },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  installBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  videoTip: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  // Revived Celebration Styles
  revivedStatsBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  revivedStatItem: {
    alignItems: 'center',
  },
  revivedStatNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA580C',
  },
  revivedStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  continueBtn: {
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
