import { Platform } from 'react-native';
import { triggerHaptic } from './haptics';

let Audio: any = null;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  // Graceful fallback if native module is not linked
}

class SoundEffectsService {
  private soundEnabled: boolean = true;
  private soundObjects: { [key: string]: any } = {};

  constructor() {
    this.configureAudio();
  }

  private async configureAudio() {
    if (!Audio || Platform.OS === 'web') return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (e) {
      // Ignore audio mode errors
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  private async playSound(asset: any) {
    if (!this.soundEnabled || !Audio) return;
    try {
      const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true, volume: 1.0 });
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (e) {
      // Audio playback fallback
    }
  }

  /**
   * Satisfying sparkling chime for habit completion (+10 XP)
   */
  public async playCompleteSound() {
    triggerHaptic.success();
    await this.playSound(require('../../assets/sounds/chime.wav'));
  }

  /**
   * Celebratory fanfare for Level Up or Badge Unlock
   */
  public async playLevelUpSound() {
    triggerHaptic.heavy();
    setTimeout(() => triggerHaptic.success(), 180);
    await this.playSound(require('../../assets/sounds/fanfare.wav'));
  }

  /**
   * Warm flame whoosh when a streak shield or ad revive is used
   */
  public async playFlameSound() {
    triggerHaptic.medium();
    await this.playSound(require('../../assets/sounds/flame.wav'));
  }
}

export const soundEffects = new SoundEffectsService();
export default soundEffects;
