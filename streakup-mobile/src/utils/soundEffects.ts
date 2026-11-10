import { Platform } from 'react-native';
import { triggerHaptic } from './haptics';

let AudioModule: any = null;
try {
  AudioModule = require('expo-audio');
} catch (e) {
  // Graceful fallback
}

class SoundEffectsService {
  private soundEnabled: boolean = true;

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
    if (!this.soundEnabled) return;
    try {
      if (AudioModule && AudioModule.createAudioPlayer) {
        const player = AudioModule.createAudioPlayer(asset);
        player.play();
      }
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

