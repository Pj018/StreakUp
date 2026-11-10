import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';

export default function LoginScreen({ navigation }: any) {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const safeTopPadding = Math.max(insets.top, 46) + 12;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please fill in both email and password.');
      return;
    }
    triggerHaptic.light();
    await login(email.trim(), password.trim());
  };

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo / Flame */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoFlame}>🔥</Text>
          </View>

          <Text style={styles.appName}>StreakUp</Text>
          <Text style={styles.appTagline}>Gamified Habits & Routine Planner</Text>

          {/* Form Card */}
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="alex@streakup.app"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
              <Text style={styles.loginBtnText}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
            </TouchableOpacity>

            {/* Quick Demo Login Button */}
            <TouchableOpacity style={styles.demoBtn} onPress={quickDemoLogin} activeOpacity={0.8}>
              <Ionicons name="flash" size={16} color="#D97706" />
              <Text style={styles.demoBtnText}>Instant Demo Preview (No Password)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpLink}>Sign Up Free</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFEDD5',
    borderWidth: 2,
    borderColor: '#FDBA74',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoFlame: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  appTagline: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 28,
    marginTop: 4,
  },
  form: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
  },
  loginBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  demoBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
  },
  demoBtnText: {
    color: '#B45309',
    fontWeight: '800',
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
  },
  signUpLink: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 13,
  },
});
