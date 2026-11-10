import { Platform } from 'react-native';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  if (Notifications && Notifications.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  // Graceful fallback if native module is not present
}

class NotificationService {
  private hasPermission: boolean = false;

  public async requestPermissions(): Promise<boolean> {
    if (!Notifications || Platform.OS === 'web') return false;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      this.hasPermission = finalStatus === 'granted';

      if (this.hasPermission && Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('streakup-reminders', {
          name: 'StreakUp Daily Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#EA580C',
          sound: 'default',
        });
      }

      return this.hasPermission;
    } catch (e) {
      return false;
    }
  }

  /**
   * Schedule a daily reminder for a specific habit
   * @param habitId Unique identifier
   * @param title Habit title
   * @param hour Hour in 24h format (e.g. 8 for 8:00 AM)
   * @param minute Minute (e.g. 0)
   */
  public async scheduleHabitReminder(habitId: string, title: string, hour: number, minute: number): Promise<string | null> {
    if (!Notifications || Platform.OS === 'web') return null;
    try {
      await this.requestPermissions();
      // Cancel existing reminder with same habit identifier if any
      await this.cancelHabitReminder(habitId);

      const id = await Notifications.scheduleNotificationAsync({
        identifier: `habit-${habitId}`,
        content: {
          title: `Time for: ${title} 🔥`,
          body: 'Check in today to maintain your routine and protect your streak!',
          sound: 'default',
          data: { habitId },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      return id;
    } catch (e) {
      return null;
    }
  }

  /**
   * Schedule daily 8:30 PM evening Streak Saver alert
   */
  public async scheduleEveningStreakSaver(): Promise<void> {
    if (!Notifications || Platform.OS === 'web') return;
    try {
      await this.requestPermissions();
      await Notifications.scheduleNotificationAsync({
        identifier: 'evening-streak-saver',
        content: {
          title: '🔥 Protect Your Streak!',
          body: 'Don’t let your daily discipline flame burn out! Open StreakUp to complete remaining goals.',
          sound: 'default',
        },
        trigger: {
          hour: 20,
          minute: 30,
          repeats: true,
        },
      });
    } catch (e) {
      // Ignore
    }
  }

  public async cancelHabitReminder(habitId: string): Promise<void> {
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`);
    } catch (e) {
      // Ignore
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
