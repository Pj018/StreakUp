import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const { changePassword } = useAuth();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const safeTopPadding = Math.max(insets.top, 46) + 8;

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your current password');
      triggerHaptic.warning();
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      triggerHaptic.warning();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match');
      triggerHaptic.warning();
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('New password cannot be the same as current password');
      triggerHaptic.warning();
      return;
    }

    setIsLoading(true);
    triggerHaptic.medium();

    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        soundEffects.playLevelUpSound();
        triggerHaptic.success();
        Alert.alert('Success! 🔒', res.message || 'Your password has been changed securely.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        triggerHaptic.error();
        setErrorMsg(res.message || 'Incorrect current password');
      }
    } catch (err: any) {
      triggerHaptic.error();
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingTop: safeTopPadding }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>SECURITY SETTINGS</Text>
              <Text style={styles.headerSub}>Change & Protect Account Password</Text>
            </View>
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
            {/* Security Badge */}
            <View style={styles.securityBanner}>
              <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>BCrypt 256-Bit Password Encryption</Text>
                <Text style={styles.bannerSub}>
                  Your password is never stored in plain text and protected by enterprise cryptography.
                </Text>
              </View>
            </View>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Input 1: Current Password */}
            <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter existing password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                <Ionicons
                  name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Input 2: New Password */}
            <Text style={styles.inputLabel}>NEW PASSWORD</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="key-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                <Ionicons
                  name={showNew ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Input 3: Confirm New Password */}
            <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="checkmark-done-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-type new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Password Validation Hints */}
            <View style={styles.requirementsBox}>
              <Text style={styles.reqTitle}>Password Requirements:</Text>
              <View style={styles.reqItem}>
                <Ionicons
                  name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={newPassword.length >= 6 ? '#10B981' : '#94A3B8'}
                />
                <Text style={[styles.reqText, newPassword.length >= 6 && styles.reqTextDone]}>
                  At least 6 characters
                </Text>
              </View>
              <View style={styles.reqItem}>
                <Ionicons
                  name={
                    newPassword && confirmPassword && newPassword === confirmPassword
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={16}
                  color={
                    newPassword && confirmPassword && newPassword === confirmPassword
                      ? '#10B981'
                      : '#94A3B8'
                  }
                />
                <Text
                  style={[
                    styles.reqText,
                    newPassword &&
                      confirmPassword &&
                      newPassword === confirmPassword &&
                      styles.reqTextDone,
                  ]}
                >
                  Both passwords match exactly
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="shield-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
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
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 14,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#312E81',
  },
  bannerSub: {
    fontSize: 11,
    color: '#4338CA',
    marginTop: 2,
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 6,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  requirementsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
    marginBottom: 24,
    gap: 8,
  },
  reqTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  reqTextDone: {
    color: '#059669',
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
