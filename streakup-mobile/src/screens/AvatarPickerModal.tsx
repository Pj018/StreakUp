import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const PRESET_AVATARS = [
  { id: 'avatar:flame', emoji: '🔥', name: 'Flame Titan', bg: '#FFEDD5', border: '#EA580C' },
  { id: 'avatar:thunder', emoji: '⚡', name: 'Thunder Prodigy', bg: '#FEF3C7', border: '#D97706' },
  { id: 'avatar:spartan', emoji: '🛡️', name: 'Iron Spartan', bg: '#E0F2FE', border: '#0284C7' },
  { id: 'avatar:ninja', emoji: '🥋', name: 'Dojo Master', bg: '#FEE2E2', border: '#EF4444' },
  { id: 'avatar:zen', emoji: '🧘', name: 'Zen Monk', bg: '#ECFDF5', border: '#059669' },
  { id: 'avatar:crown', emoji: '👑', name: 'Streak Monarch', bg: '#FEF9C3', border: '#CA8A04' },
  { id: 'avatar:phoenix', emoji: '🦅', name: 'Solar Phoenix', bg: '#FDF2F8', border: '#DB2777' },
  { id: 'avatar:wolf', emoji: '🐺', name: 'Lone Wolf', bg: '#F1F5F9', border: '#475569' },
  { id: 'avatar:rocket', emoji: '🚀', name: 'Cosmic Goal', bg: '#EEF2FF', border: '#4F46E5' },
];

export default function AvatarPickerModal({ visible, onClose }: Props) {
  const { user, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const safeTopPadding = Math.max(insets.top, 46) + 8;

  const handlePickFromGallery = async () => {
    try {
      triggerHaptic.light();
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow photo gallery access in device settings to select your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const avatarData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        setIsLoading(true);
        const res = await updateProfile({ avatarUrl: avatarData });
        setIsLoading(false);

        if (res.success) {
          soundEffects.playCompleteSound();
          triggerHaptic.success();
          Alert.alert('Profile Photo Updated! 📸', 'Your new profile picture is now live.');
          onClose();
        }
      }
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Error', 'Could not access device photos.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      triggerHaptic.light();
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow camera access in device settings to take a selfie.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const avatarData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        setIsLoading(true);
        const res = await updateProfile({ avatarUrl: avatarData });
        setIsLoading(false);

        if (res.success) {
          soundEffects.playCompleteSound();
          triggerHaptic.success();
          Alert.alert('Selfie Saved! 📷', 'Your new profile avatar is live.');
          onClose();
        }
      }
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleSelectPreset = async (presetId: string) => {
    setIsLoading(true);
    triggerHaptic.medium();
    const res = await updateProfile({ avatarUrl: presetId });
    setIsLoading(false);

    if (res.success) {
      soundEffects.playCompleteSound();
      triggerHaptic.success();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: safeTopPadding }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>PROFILE AVATAR</Text>
            <Text style={styles.headerSub}>Choose photo or signature discipline icon</Text>
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
          {/* Current Avatar Preview */}
          <View style={styles.currentPreviewCard}>
            <View style={styles.avatarLargeCircle}>
              {user?.avatarUrl?.startsWith('data:') || user?.avatarUrl?.startsWith('file:') || user?.avatarUrl?.startsWith('http') ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmojiLarge}>
                  {PRESET_AVATARS.find(a => a.id === user?.avatarUrl)?.emoji || '⚡'}
                </Text>
              )}
            </View>
            <Text style={styles.currentName}>{user?.fullName || 'Hero'}</Text>
            <Text style={styles.currentLevel}>Level {user?.currentLevel ?? 1} Warrior</Text>
          </View>

          {/* Action Row: Camera & Gallery */}
          <Text style={styles.sectionHeading}>UPLOAD CUSTOM PHOTO</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handlePickFromGallery}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="images-outline" size={22} color="#4F46E5" />
              </View>
              <Text style={styles.actionTitle}>Photo Gallery</Text>
              <Text style={styles.actionSub}>Pick image from phone</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleTakePhoto}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="camera-outline" size={22} color="#059669" />
              </View>
              <Text style={styles.actionTitle}>Take Selfie</Text>
              <Text style={styles.actionSub}>Open phone camera</Text>
            </TouchableOpacity>
          </View>

          {/* Preset Avatars Grid */}
          <Text style={styles.sectionHeading}>SIGNATURE DISCIPLINE AVATARS</Text>
          <View style={styles.grid}>
            {PRESET_AVATARS.map(avatar => {
              const isSelected = user?.avatarUrl === avatar.id;
              return (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.gridItem,
                    { backgroundColor: avatar.bg, borderColor: isSelected ? avatar.border : '#E2E8F0' },
                    isSelected && styles.gridItemSelected,
                  ]}
                  onPress={() => handleSelectPreset(avatar.id)}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.gridEmoji}>{avatar.emoji}</Text>
                  <Text style={styles.gridLabel} numberOfLines={1}>
                    {avatar.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedCheck, { backgroundColor: avatar.border }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Updating avatar...</Text>
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
  currentPreviewCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarLargeCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4F46E5',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmojiLarge: {
    fontSize: 44,
  },
  currentName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  currentLevel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
    padding: 6,
  },
  gridItemSelected: {
    borderWidth: 2.5,
    transform: [{ scale: 1.03 }],
  },
  gridEmoji: {
    fontSize: 34,
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  selectedCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 8,
  },
});
