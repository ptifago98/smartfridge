import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getReminderDate } from '../utils/expiry';

const CHANNEL_ID = 'expiry-reminders';
let channelReady = false;

function channelOption() {
  return channelReady ? { channelId: CHANNEL_ID } : {};
}


// How to display a notification that arrives while the app is OPEN.
// (When the app is closed, the system shows it normally.)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Run once at startup. Returns true if notifications are allowed. */
export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Expiry reminders',
        importance: Notifications.AndroidImportance.HIGH,
      });
      channelReady = true;
    } catch (e) {
      // Known Expo Go 57 bug: notifications fall back to the default channel
      console.warn('Notification channel unavailable, using default channel');
    }
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

interface ReminderInput {
  productId: string;
  name: string;
  expiryDate: string;
}

/**
 * Schedules the "expires tomorrow" reminder.
 * Returns its id, or undefined if no reminder was scheduled.
 * Never throws: a reminder problem must not stop the product being saved.
 */
export async function scheduleExpiryReminder({ productId, name, expiryDate }: ReminderInput) {
  try {
    const date = getReminderDate(expiryDate);
    if (!date) return undefined;

    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return undefined;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Expires tomorrow',
        body: `${name} expires tomorrow. Eat it or find a recipe!`,
        data: { productId },   // used in step 5 to open the product
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        ...channelOption(),                                        
      },
    });
  } catch (e) {
    console.warn('Could not schedule reminder', e);
    return undefined;
  }
}

/** Cancels a reminder. Safe to call with undefined or an id that already fired. */
export async function cancelReminder(notificationId?: string) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // already fired or already cancelled: nothing to do
  }
}

// ---------- Debug helpers (used only in development) ----------

/** Fires 10 seconds from now. */
export function scheduleTestReminder(name: string) {
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Test reminder ', body: `${name} expires tomorrow (test)` },
    trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 10,
    ...channelOption(),
    },
  });
}

/** Prints every pending reminder in the Expo terminal. */
export async function logScheduledReminders() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  console.log(`${all.length} scheduled:`, all.map((n) => `${n.content.body} → ${JSON.stringify(n.trigger)}`));
}