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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
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
  const { user, logout } = useAuth();
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

  const currentAvatarEmoji =
    PRESET_AVATARS.find(a => a.id === user?.avatarUrl)?.emoji || '⚡';
  const hasCustomImage =
    user?.avatarUrl &&
    (user.avatarUrl.startsWith('data:') ||
      user.avatarUrl.startsWith('file:') ||
      user.avatarUrl.startsWith('http'));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: safeTopPadding }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>PROFILE & SETTINGS</Text>
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
                <View style={styles.avatarCircle}>
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
                  <Text style={styles.userName}>{user?.fullName || 'Hero'}</Text>
                  {user?.isPro ? (
                    <View style={styles.proPill}>
                      <Text style={styles.proPillText}>★ PRO</Text>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={styles.editPencilBtn}
                    onPress={() => {
                      triggerHaptic.light();
                      setShowEditProfile(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={14} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
                <Text style={styles.userStatsSub}>
                  Level {user?.currentLevel ?? 1} • {user?.xpPoints ?? 0} XP • {user?.streakShields ?? 1} Shields
                </Text>
              </View>
            </View>

            {/* Discipline Bio (if set) */}
            {user?.bio ? (
              <View style={styles.bioBox}>
                <Ionicons name="sparkles" size={14} color="#EA580C" />
                <Text style={styles.bioText}>"{user.bio}"</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addBioBtn}
                onPress={() => {
                  triggerHaptic.light();
                  setShowEditProfile(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={15} color="#4F46E5" />
                <Text style={styles.addBioText}>Add Discipline Motto / Bio</Text>
              </TouchableOpacity>
            )}
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

          {/* Feature Comparison Pill */}
          <TouchableOpacity
            style={styles.compareBtn}
            onPress={() => {
              triggerHaptic.light();
              setShowPlanComparison(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.compareIcon}>
              <Ionicons name="stats-chart" size={16} color="#4F46E5" />
            </View>
            <Text style={styles.compareBtnText}>Compare Free vs PRO Plans</Text>
            <Ionicons name="chevron-forward" size={16} color="#64748B" />
          </TouchableOpacity>

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
                onValueChange={val => {
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
                onValueChange={val => {
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
                onValueChange={val => {
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
                onValueChange={val => {
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

          {/* Account & Security Section */}
          <Text style={styles.sectionHeading}>ACCOUNT & SECURITY</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                triggerHaptic.light();
                setShowChangePassword(true);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingSub}>Update your BCrypt salted account password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                triggerHaptic.light();
                setShowAvatarPicker(true);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="image-outline" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Change Profile Photo</Text>
                <Text style={styles.settingSub}>Upload selfie, gallery photo or pick avatar</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Legal & Compliance Section */}
          <Text style={styles.sectionHeading}>LEGAL & POLICIES</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                triggerHaptic.light();
                setTermsInitialTab('terms');
                setShowTermsModal(true);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="document-text-outline" size={18} color="#475569" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Terms & Conditions</Text>
                <Text style={styles.settingSub}>Usage terms, streak rules & subscription guidelines</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                triggerHaptic.light();
                setTermsInitialTab('privacy');
                setShowTermsModal(true);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingSub}>Zero data selling • End-to-end encryption</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* App Build & Logout */}
          <View style={styles.appMetaCard}>
            <View style={styles.metaRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.metaTitle}>StreakUp Cloud • Connected to PostgreSQL</Text>
            </View>
            <Text style={styles.metaSub}>Build v1.0.0 (Release 58) • Spring Boot 3 Engine</Text>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Log Out Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sub-modals */}
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
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
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
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  editPencilBtn: {
    padding: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  proPill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  userStatsSub: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
  bioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  bioText: {
    flex: 1,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#9A3412',
    fontWeight: '600',
  },
  addBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  addBioText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  upgradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    marginBottom: 12,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 20,
  },
  compareIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
    marginTop: 10,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
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
    color: '#4F46E5',
  },
  soundTestRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
  },
  soundTestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  soundTestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  appMetaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 10,
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
    color: '#1E293B',
  },
  metaSub: {
    fontSize: 11,
    color: '#64748B',
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
});
