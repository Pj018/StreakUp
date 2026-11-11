import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginScreen({ navigation }: any) {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const safeTopPadding = Math.max(insets.top, 46) + 10;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter both your email address and password.');
      return;
    }
    triggerHaptic.light();
    await login(email.trim(), password.trim());
  };

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Branding */}
          <View style={styles.headerSection}>
            <View style={styles.logoBadgeWrap}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🔥</Text>
              </View>
              <View style={styles.communityPill}>
                <Ionicons name="sparkles" size={12} color="#EA580C" />
                <Text style={styles.communityPillText}>STREAK MASTER CLUB</Text>
              </View>
            </View>

            <Text style={styles.appName}>StreakUp</Text>
            <Text style={styles.welcomeSubtitle}>
              Welcome back! Build discipline, earn XP, and protect your daily streak.
            </Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>SIGN IN TO YOUR ROUTINE</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
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
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic.light();
                    setShowForgotPassword(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In CTA */}
            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Social Proof / Gamification Highlights */}
          <View style={styles.perksRow}>
            <View style={styles.perkItem}>
              <Text style={styles.perkEmoji}>🛡️</Text>
              <Text style={styles.perkLabel}>Streak Shields</Text>
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkEmoji}>⚡</Text>
              <Text style={styles.perkLabel}>Level & XP</Text>
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkEmoji}>📊</Text>
              <Text style={styles.perkLabel}>8-Week Grid</Text>
            </View>
          </View>

          {/* Footer Register Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.light();
                navigation.navigate('Register');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpLink}>Create Account Free</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPassword}
        initialEmail={email}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={newEmail => {
          setEmail(newEmail);
          setShowForgotPassword(false);
          Alert.alert('Password Updated', 'You can now sign in with your new password.');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 10,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  logoBadgeWrap: {
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 40,
  },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
    marginTop: -8,
  },
  communityPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#C2410C',
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  demoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoBtnTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#92400E',
  },
  demoBtnSub: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 1,
  },
  perksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  perkItem: {
    alignItems: 'center',
    gap: 3,
  },
  perkEmoji: {
    fontSize: 18,
  },
  perkLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
  },
});
