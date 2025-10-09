import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { NotificationSettings } from "../../types/notifications";

const COL = "notification_settings";
const key = (familyId: string, userId: string) => `${familyId}_${userId}`;

export async function getNotificationSettings(familyId: string, userId: string): Promise<NotificationSettings> {
  const id = key(familyId, userId);
  const ref = doc(db, COL, id);
  const snap = await getDoc(ref);

  if (snap.exists()) return { id, ...(snap.data() as any) };

  const defaults: NotificationSettings = {
    id, familyId, userId,
    enableAll: true,
    sound: true,
    vibration: true,
    quietHours: { enabled: false, start: "22:00", end: "07:00" },
    dayFilters: { enabled: false, allowedWeekdays: [1,2,3,4,5] },
    channels: {
      family_schedules: { enabled: true, sound: true, vibration: true },
      upcoming_reminders: { enabled: true, sound: true, vibration: true },
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, defaults);
  return defaults;
}

export async function saveNotificationSettings(settings: NotificationSettings) {
  const id = settings.id ?? key(settings.familyId, settings.userId);
  const ref = doc(db, COL, id);
  const payload = { ...settings, id, updatedAt: serverTimestamp() };
  await setDoc(ref, payload, { merge: true });
  return id;
}
