import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';

interface ForgotPasswordModalProps {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function ForgotPasswordModal({
  visible,
  initialEmail = '',
  onClose,
  onSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'SUCCESS'>('EMAIL');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (visible) {
      setStep('EMAIL');
      setEmail(initialEmail);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      setCooldown(0);
    }
  }, [visible, initialEmail]);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);
    triggerHaptic.light();

    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      soundEffects.playCompleteSound();
      triggerHaptic.success();
      setStep('OTP');
      setCooldown(30);
      Alert.alert(
        'Code Sent 📬',
        `A 6-digit verification code has been sent to ${email.trim()}. Please check your Gmail inbox and spam folder.`
      );
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        'Failed to send verification code. Please make sure this email is registered.';
      Alert.alert('Account Notice', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || otp.trim().length < 4) {
      Alert.alert('Code Required', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Password Too Short', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);
    triggerHaptic.medium();

    try {
      const res = await apiClient.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      soundEffects.playLevelUpSound();
      triggerHaptic.success();
      setStep('SUCCESS');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Invalid or expired verification code. Please try again.';
      Alert.alert('Verification Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setCooldown(30);
      triggerHaptic.success();
      Alert.alert('Code Resent', `A new verification code has been sent to ${email}.`);
    } catch (e) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>PASSWORD RECOVERY</Text>
            <Text style={styles.headerSub}>Reset your account password via email verification</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 'EMAIL' && (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="mail" size={28} color="#4F46E5" />
              </View>

              <Text style={styles.cardTitle}>Find Your Account</Text>
              <Text style={styles.cardDesc}>
                Enter your registered email address and we'll send you a 6-digit verification code to reset your password.
              </Text>

              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="alex@streakup.app"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Send 6-Digit Code</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 'OTP' && (
            <View style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="key" size={28} color="#4F46E5" />
              </View>

              <Text style={styles.cardTitle}>Enter Verification Code</Text>
              <Text style={styles.cardDesc}>
                We sent a 6-digit code to <Text style={{ fontWeight: '800', color: '#0F172A' }}>{email}</Text>. Enter it below along with your new password.
              </Text>

              {/* 6-Digit OTP Code */}
              <Text style={styles.inputLabel}>6-Digit Verification Code (OTP)</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="123456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>

              {/* New Password */}
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-type new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Reset CTA */}
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>Reset Password</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Resend Code */}
              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={cooldown > 0 || isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendBtnText, cooldown > 0 && { color: '#94A3B8' }]}>
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.backStepBtn}
                onPress={() => setStep('EMAIL')}
                activeOpacity={0.7}
              >
                <Text style={styles.backStepText}>← Change Email Address</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'SUCCESS' && (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 36 }]}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>

              <Text style={styles.successTitle}>Password Reset Successful! 🎉</Text>
              <Text style={styles.successDesc}>
                Your account password has been updated securely. You can now sign in with your new credentials.
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { width: '100%', marginTop: 20 }]}
                onPress={() => {
                  onSuccess(email);
                  onClose();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Continue to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 16,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: '#0F172A',
  },
  otpInput: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  eyeBtn: {
    padding: 6,
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.65,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  resendText: {
    fontSize: 12,
    color: '#64748B',
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  backStepBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  backStepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#065F46',
    marginBottom: 8,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
