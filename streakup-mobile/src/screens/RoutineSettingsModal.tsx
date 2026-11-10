import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';
import notificationService from '../utils/notificationService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenPaywall: () => void;
}

export default function RoutineSettingsModal({ visible, onClose, onOpenPaywall }: Props) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.isSoundEnabled());

  const safeTopPadding = Math.max(insets.top, 46) + 8;

  const handleTestReminder = async () => {
    soundEffects.playCompleteSound();
    await notificationService.scheduleHabitReminder(
      'preview-test',
      'Daily Routine Check-in',
      new Date().getHours(),
      (new Date().getMinutes() + 1) % 60
    );
    Alert.alert(
      '🔔 Reminder & Sound Tested!',
      'Sound effect played and reminder notification scheduled successfully.',
      [{ text: 'Awesome!' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of StreakUp?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            onClose();
            logout();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: safeTopPadding }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>ROUTINE & SETTINGS</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              triggerHaptic.light();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{user?.fullName || 'Hero'}</Text>
                {user?.isPro ? (
                  <View style={styles.proPill}>
                    <Text style={styles.proPillText}>★ PRO</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              <Text style={styles.userStatsSub}>
                Level {user?.currentLevel ?? 1} • {user?.xpPoints ?? 0} XP • {user?.streakShields ?? 1} Shields
              </Text>
            </View>
          </View>

          {/* Pro Membership Banner */}
          {!user?.isPro ? (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => {
                onClose();
                onOpenPaywall();
              }}
              activeOpacity={0.85}
            >
              <View style={styles.upgradeIcon}>
                <Ionicons name="sparkles" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>Unlock StreakUp PRO</Text>
                <Text style={styles.upgradeSub}>Unlimited habits, freeze shields & advanced heatmaps</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EA580C" />
            </TouchableOpacity>
          ) : (
            <View style={styles.proActiveCard}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.proActiveTitle}>StreakUp PRO Active</Text>
                <Text style={styles.proActiveSub}>All premium superpowers and shields unlocked</Text>
              </View>
            </View>
          )}

          {/* Reminders & Routine Section */}
          <Text style={styles.sectionHeading}>DAILY ROUTINE REMINDERS</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="sunny" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Morning Kickstart</Text>
                <Text style={styles.settingSub}>08:00 AM • Plan habits & set intention</Text>
              </View>
              <Switch
                value={morningReminder}
                onValueChange={(val) => {
                  triggerHaptic.light();
                  setMorningReminder(val);
                }}
                trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
                thumbColor={morningReminder ? '#EA580C' : '#94A3B8'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="moon" size={20} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Night Streak Saver</Text>
                <Text style={styles.settingSub}>08:30 PM • Rescue uncompleted habits</Text>
              </View>
              <Switch
                value={eveningReminder}
                onValueChange={(val) => {
                  triggerHaptic.light();
                  setEveningReminder(val);
                }}
                trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                thumbColor={eveningReminder ? '#4F46E5' : '#94A3B8'}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.testBtn} onPress={handleTestReminder} activeOpacity={0.75}>
              <Ionicons name="notifications-outline" size={18} color="#4F46E5" />
              <Text style={styles.testBtnText}>Send Test Reminder Notification</Text>
            </TouchableOpacity>
          </View>

          {/* Sensory Feedback Section */}
          <Text style={styles.sectionHeading}>HAPTICS & SOUND</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="hardware-chip-outline" size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Haptic Touch Feedback</Text>
                <Text style={styles.settingSub}>Vibrate phone on habit completions & XP claims</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={(val) => {
                  triggerHaptic.light();
                  setHapticsEnabled(val);
                }}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={hapticsEnabled ? '#059669' : '#94A3B8'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="volume-medium-outline" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Audio Chimes & Effects</Text>
                <Text style={styles.settingSub}>Play satisfying sounds on task completions & level-ups</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(val) => {
                  triggerHaptic.light();
                  setSoundEnabled(val);
                  soundEffects.setSoundEnabled(val);
                }}
                trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
                thumbColor={soundEnabled ? '#D97706' : '#94A3B8'}
              />
            </View>

            {soundEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.soundTestRow}>
                  <TouchableOpacity
                    style={styles.soundTestBtn}
                    onPress={() => soundEffects.playCompleteSound()}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="sparkles" size={14} color="#EA580C" />
                    <Text style={styles.soundTestBtnText}>Test Chime 🔔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.soundTestBtn}
                    onPress={() => soundEffects.playLevelUpSound()}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="trophy" size={14} color="#D97706" />
                    <Text style={styles.soundTestBtnText}>Test Fanfare 🎺</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* App Build & Logout */}
          <View style={styles.appMetaCard}>
            <Text style={styles.metaTitle}>StreakUp Mobile • Build v1.0.0 (Release 58)</Text>
            <Text style={styles.metaSub}>Spring Boot 3 + PostgreSQL Backend Connected</Text>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Log Out Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  proPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proPillText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 9,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  userStatsSub: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '700',
    marginTop: 4,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    gap: 12,
  },
  upgradeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#9A3412',
  },
  upgradeSub: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 2,
  },
  proActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    gap: 12,
  },
  proActiveTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  proActiveSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  settingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  soundTestRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  soundTestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  soundTestBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C2410C',
  },
  appMetaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  metaSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
});
