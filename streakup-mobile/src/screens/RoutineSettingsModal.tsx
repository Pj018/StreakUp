import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';
import notificationService from '../utils/notificationService';

import AvatarPickerModal, { PRESET_AVATARS } from './AvatarPickerModal';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import TermsAndPrivacyModal from './TermsAndPrivacyModal';
import PlanComparisonModal from './PlanComparisonModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenPaywall: () => void;
}

export default function RoutineSettingsModal({ visible, onClose, onOpenPaywall }: Props) {
  const { user, logout, deleteAccount } = useAuth();
  const { isDark, colors, themeMode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();

  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.isSoundEnabled());

  // Sub-modals state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsInitialTab, setTermsInitialTab] = useState<'terms' | 'privacy'>('terms');
  const [showPlanComparison, setShowPlanComparison] = useState(false);

  // Restore user preferences
  useEffect(() => {
    AsyncStorage.multiGet([
      '@streakup_pref_morning',
      '@streakup_pref_evening',
      '@streakup_pref_haptics',
      '@streakup_pref_sound',
    ]).then(values => {
      if (values[0][1] !== null) setMorningReminder(values[0][1] === 'true');
      if (values[1][1] !== null) setEveningReminder(values[1][1] === 'true');
      if (values[2][1] !== null) setHapticsEnabled(values[2][1] === 'true');
      if (values[3][1] !== null) {
        const snd = values[3][1] === 'true';
        setSoundEnabled(snd);
        soundEffects.setSoundEnabled(snd);
      }
    }).catch(() => {});
  }, []);

  const handleMorningToggle = (val: boolean) => {
    triggerHaptic.light();
    setMorningReminder(val);
    AsyncStorage.setItem('@streakup_pref_morning', String(val)).catch(() => {});
  };

  const handleEveningToggle = (val: boolean) => {
    triggerHaptic.light();
    setEveningReminder(val);
    AsyncStorage.setItem('@streakup_pref_evening', String(val)).catch(() => {});
  };

  const handleHapticsToggle = (val: boolean) => {
    triggerHaptic.light();
    setHapticsEnabled(val);
    AsyncStorage.setItem('@streakup_pref_haptics', String(val)).catch(() => {});
  };

  const handleSoundToggle = (val: boolean) => {
    triggerHaptic.light();
    setSoundEnabled(val);
    soundEffects.setSoundEnabled(val);
    AsyncStorage.setItem('@streakup_pref_sound', String(val)).catch(() => {});
  };

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

  const handleDeleteAccount = () => {
    triggerHaptic.heavy();
    Alert.alert(
      '⚠️ Delete Account & All Data',
      'Are you completely sure you want to permanently delete your StreakUp account? All your habits, streaks, badges, and routine history will be permanently erased. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic.heavy();
            onClose();
            const res = await deleteAccount();
            if (res.success) {
              Alert.alert('Account Deleted', 'Your account and routine data have been permanently removed.');
            }
          },
        },
      ]
    );
  };

  const currentAvatarEmoji =
    PRESET_AVATARS.find(a => a.id === user?.avatarUrl)?.emoji || '⚡';
  const hasCustomImage =
    user?.avatarUrl &&
    (user.avatarUrl.startsWith('data:') ||
      user.avatarUrl.startsWith('file:') ||
      user.avatarUrl.startsWith('http'));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: safeTopPadding }]}>
        {/* Header */}
        <View style={[styles.headerRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>PROFILE & SETTINGS</Text>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: isDark ? '#141E33' : '#F1F5F9' }]}
            onPress={() => {
              triggerHaptic.light();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* User Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.profileTopRow}>
              {/* Avatar with Camera edit button */}
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => {
                  triggerHaptic.light();
                  setShowAvatarPicker(true);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#141E33' : '#EEF2FF', borderColor: isDark ? colors.flamePrimary : '#4F46E5' }]}>
                  {hasCustomImage ? (
                    <Image source={{ uri: user!.avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarEmoji}>{currentAvatarEmoji}</Text>
                  )}
                </View>
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={13} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <View style={styles.userNameRow}>
                  <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.fullName || 'Hero'}</Text>
                  {user?.isPro ? (
                    <View style={styles.proPill}>
                      <Text style={styles.proPillText}>★ PRO</Text>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.editPencilBtn, { backgroundColor: isDark ? '#141E33' : '#EEF2FF' }]}
                    onPress={() => {
                      triggerHaptic.light();
                      setShowEditProfile(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={14} color={isDark ? '#818CF8' : '#4F46E5'} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
                <Text style={[styles.userStatsSub, { color: colors.textMuted }]}>
                  Level {user?.currentLevel ?? 1} • {user?.xpPoints ?? 0} XP • {user?.streakShields ?? 1} Shields
                </Text>
              </View>
            </View>

            {/* Discipline Bio (if set) */}
            {user?.bio ? (
              <View style={[styles.bioBox, { backgroundColor: isDark ? '#141E33' : '#FFF7ED', borderColor: isDark ? colors.border : '#FED7AA' }]}>
                <Ionicons name="sparkles" size={14} color={colors.flamePrimary} />
                <Text style={[styles.bioText, { color: isDark ? colors.textPrimary : '#9A3412' }]}>"{user.bio}"</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addBioBtn, { backgroundColor: isDark ? '#141E33' : '#EEF2FF' }]}
                onPress={() => {
                  triggerHaptic.light();
                  setShowEditProfile(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={15} color={isDark ? '#818CF8' : '#4F46E5'} />
                <Text style={[styles.addBioText, { color: isDark ? '#818CF8' : '#4F46E5' }]}>Add Discipline Motto / Bio</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Pro Membership Banner */}
          {!user?.isPro ? (
            <TouchableOpacity
              style={[styles.upgradeCard, { backgroundColor: isDark ? '#1B1405' : '#FFF7ED', borderColor: isDark ? '#B45309' : '#FED7AA' }]}
              onPress={() => {
                onClose();
                onOpenPaywall();
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.upgradeIcon, { backgroundColor: isDark ? 'rgba(255, 107, 0, 0.2)' : '#FFEDD5' }]}>
                <Ionicons name="sparkles" size={20} color={colors.flamePrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.upgradeTitle, { color: isDark ? '#FCD34D' : '#9A3412' }]}>Unlock StreakUp PRO</Text>
                <Text style={[styles.upgradeSub, { color: isDark ? '#FBBF24' : '#C2410C' }]}>Unlimited habits, freeze shields & advanced heatmaps</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.flamePrimary} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.proActiveCard, { backgroundColor: isDark ? '#06281E' : '#ECFDF5', borderColor: isDark ? '#059669' : '#A7F3D0' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.proActiveTitle}>StreakUp PRO Active</Text>
                <Text style={styles.proActiveSub}>All premium superpowers and shields unlocked</Text>
              </View>
            </View>
          )}

          {/* Feature Comparison Pill */}
          <TouchableOpacity
            style={[styles.compareBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}
            onPress={() => {
              triggerHaptic.light();
              setShowPlanComparison(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.compareIcon, { backgroundColor: isDark ? '#141E33' : '#EEF2FF' }]}>
              <Ionicons name="stats-chart" size={16} color={isDark ? '#818CF8' : '#4F46E5'} />
            </View>
            <Text style={[styles.compareBtnText, { color: colors.textPrimary }]}>Compare Free vs PRO Plans</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* ================= APPEARANCE & THEME SECTION ================= */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>APPEARANCE & THEME</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.themeRow}>
              <TouchableOpacity
                style={[
                  styles.themeOptionBtn,
                  {
                    backgroundColor: themeMode === 'dark' ? '#FF6B00' : isDark ? '#141E33' : '#F1F5F9',
                    borderColor: themeMode === 'dark' ? '#FF6B00' : colors.border,
                  },
                ]}
                onPress={() => {
                  triggerHaptic.medium();
                  setThemeMode('dark');
                }}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="moon"
                  size={16}
                  color={themeMode === 'dark' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: themeMode === 'dark' ? '#FFFFFF' : colors.textSecondary },
                    themeMode === 'dark' && { fontWeight: '800' },
                  ]}
                >
                  AMOLED Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOptionBtn,
                  {
                    backgroundColor: themeMode === 'light' ? '#4F46E5' : isDark ? '#141E33' : '#F1F5F9',
                    borderColor: themeMode === 'light' ? '#4F46E5' : colors.border,
                  },
                ]}
                onPress={() => {
                  triggerHaptic.medium();
                  setThemeMode('light');
                }}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="sunny"
                  size={16}
                  color={themeMode === 'light' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: themeMode === 'light' ? '#FFFFFF' : colors.textSecondary },
                    themeMode === 'light' && { fontWeight: '800' },
                  ]}
                >
                  Clean Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOptionBtn,
                  {
                    backgroundColor: themeMode === 'system' ? '#10B981' : isDark ? '#141E33' : '#F1F5F9',
                    borderColor: themeMode === 'system' ? '#10B981' : colors.border,
                  },
                ]}
                onPress={() => {
                  triggerHaptic.medium();
                  setThemeMode('system');
                }}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={16}
                  color={themeMode === 'system' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: themeMode === 'system' ? '#FFFFFF' : colors.textSecondary },
                    themeMode === 'system' && { fontWeight: '800' },
                  ]}
                >
                  System
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reminders & Routine Section */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>DAILY ROUTINE REMINDERS</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? 'rgba(255, 107, 0, 0.2)' : '#FFEDD5' }]}>
                <Ionicons name="sunny" size={20} color={colors.flamePrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Morning Kickstart</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>08:00 AM • Plan habits & set intention</Text>
              </View>
              <Switch
                value={morningReminder}
                onValueChange={handleMorningToggle}
                trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: isDark ? '#B45309' : '#FED7AA' }}
                thumbColor={morningReminder ? colors.flamePrimary : colors.textMuted}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
                <Ionicons name="moon" size={20} color={isDark ? '#818CF8' : '#4F46E5'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Night Streak Saver</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>08:30 PM • Rescue uncompleted habits</Text>
              </View>
              <Switch
                value={eveningReminder}
                onValueChange={handleEveningToggle}
                trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: isDark ? '#4338CA' : '#C7D2FE' }}
                thumbColor={eveningReminder ? (isDark ? '#818CF8' : '#4F46E5') : colors.textMuted}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <TouchableOpacity
              style={[styles.testBtn, { backgroundColor: isDark ? '#141E33' : '#EEF2FF' }]}
              onPress={handleTestReminder}
              activeOpacity={0.75}
            >
              <Ionicons name="notifications-outline" size={18} color={isDark ? '#818CF8' : '#4F46E5'} />
              <Text style={[styles.testBtnText, { color: isDark ? '#818CF8' : '#4F46E5' }]}>Send Test Reminder Notification</Text>
            </TouchableOpacity>
          </View>

          {/* Sensory Feedback Section */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>HAPTICS & SOUND</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
                <Ionicons name="hardware-chip-outline" size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Haptic Touch Feedback</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Vibrate phone on habit completions & XP claims</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleHapticsToggle}
                trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: isDark ? '#065F46' : '#A7F3D0' }}
                thumbColor={hapticsEnabled ? '#10B981' : colors.textMuted}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }]}>
                <Ionicons name="volume-medium-outline" size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Audio Chimes & Effects</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Play satisfying sounds on task completions & level-ups</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: isDark ? '#78350F' : '#FDE68A' }}
                thumbColor={soundEnabled ? '#F59E0B' : colors.textMuted}
              />
            </View>

            {soundEnabled && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <View style={styles.soundTestRow}>
                  <TouchableOpacity
                    style={[styles.soundTestBtn, { backgroundColor: isDark ? '#141E33' : '#F8FAFC', borderColor: colors.border }]}
                    onPress={() => soundEffects.playCompleteSound()}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="sparkles" size={14} color={colors.flamePrimary} />
                    <Text style={[styles.soundTestBtnText, { color: colors.textPrimary }]}>Test Chime 🔔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.soundTestBtn, { backgroundColor: isDark ? '#141E33' : '#F8FAFC', borderColor: colors.border }]}
                    onPress={() => soundEffects.playLevelUpSound()}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="trophy" size={14} color="#F59E0B" />
                    <Text style={[styles.soundTestBtnText, { color: colors.textPrimary }]}>Test Fanfare 🎺</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Account & Security Section */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>ACCOUNT & SECURITY</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                triggerHaptic.light();
                setShowChangePassword(true);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={isDark ? '#818CF8' : '#4F46E5'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Change Password</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Update your BCrypt salted account password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                triggerHaptic.light();
                setShowAvatarPicker(true);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }]}>
                <Ionicons name="image-outline" size={18} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Change Profile Photo</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Upload selfie, gallery photo or pick avatar</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Legal & Compliance Section */}
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>LEGAL & POLICIES</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                triggerHaptic.light();
                setTermsInitialTab('terms');
                setShowTermsModal(true);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Terms & Conditions</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Usage terms, streak rules & subscription guidelines</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                triggerHaptic.light();
                setTermsInitialTab('privacy');
                setShowTermsModal(true);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name="shield-outline" size={18} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Data retention, GDPR & Play Store compliance</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* App Metadata Card */}
          <View style={[styles.appMetaCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.metaRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.metaTitle, { color: colors.textPrimary }]}>StreakUp v1.0.0 (OTA Ready)</Text>
            </View>
            <Text style={[styles.metaSub, { color: colors.textSecondary }]}>Cloud Backend: 24/7 Production Online (PostgreSQL 16)</Text>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Log Out of StreakUp</Text>
            </TouchableOpacity>

            {/* Delete Account Button (Compliance) */}
            <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={14} color="#94A3B8" />
              <Text style={styles.deleteAccountBtnText}>Delete Account & Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modals */}
        <AvatarPickerModal
          visible={showAvatarPicker}
          onClose={() => setShowAvatarPicker(false)}
        />

        <EditProfileModal
          visible={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />

        <ChangePasswordModal
          visible={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />

        <TermsAndPrivacyModal
          visible={showTermsModal}
          initialTab={termsInitialTab}
          onClose={() => setShowTermsModal(false)}
        />

        <PlanComparisonModal
          visible={showPlanComparison}
          onClose={() => setShowPlanComparison(false)}
          onUpgradePress={() => {
            onClose();
            onOpenPaywall();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 3,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4F46E5',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
  },
  editPencilBtn: {
    padding: 4,
    borderRadius: 8,
  },
  proPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
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
    marginTop: 2,
  },
  userStatsSub: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  bioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
  },
  bioText: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
    flex: 1,
  },
  addBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  addBioText: {
    fontSize: 12,
    fontWeight: '700',
  },
  upgradeCard: {
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  upgradeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  upgradeSub: {
    fontSize: 11,
    marginTop: 2,
  },
  proActiveCard: {
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  proActiveTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#065F46',
  },
  proActiveSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    gap: 10,
  },
  compareIcon: {
    padding: 6,
    borderRadius: 8,
  },
  compareBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  soundTestRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  soundTestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  soundTestBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  appMetaCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  metaTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  metaSub: {
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 16,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  deleteAccountBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
