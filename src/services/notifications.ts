import * as Notifications from 'expo-notifications';
import { Medication, TimeSlot } from '../types';

export const TIME_SLOT_HOURS: Record<TimeSlot, { hour: number; minute: number }> = {
  morning: { hour: 8, minute: 0 },
  afternoon: { hour: 13, minute: 0 },
  evening: { hour: 20, minute: 0 },
};

export function notificationId(medicationId: string, slot: TimeSlot): string {
  return `med-${medicationId}-${slot}`;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelMedicationReminders(medicationId: string, times: TimeSlot[]): Promise<void> {
  await Promise.all(
    times.map((slot) => Notifications.cancelScheduledNotificationAsync(notificationId(medicationId, slot))),
  );
}

export async function scheduleMedicationReminders(medication: Medication): Promise<void> {
  for (const slot of medication.times) {
    const { hour, minute } = TIME_SLOT_HOURS[slot];
    await Notifications.scheduleNotificationAsync({
      identifier: notificationId(medication.id, slot),
      content: {
        title: 'Medication Reminder',
        body: `Time to take ${medication.name} (${medication.dosage})`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}

export async function syncAllMedicationReminders(
  medications: Medication[],
  enabled: boolean,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  for (const med of medications) {
    await scheduleMedicationReminders(med);
  }
}
