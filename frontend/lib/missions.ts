import AsyncStorage from '@react-native-async-storage/async-storage';

// A lifetime count of completed Field Trips — one quiet number, nothing
// else. Deliberately no streaks, no badges, no daily reset: tracking
// beyond a plain tally is the dopamine machine this app exists to not be.
// The count feeds the (future) weekly share card.

const KEY = 'missions_done';

export async function missionsDone(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export async function recordMissionDone(): Promise<number> {
  const next = (await missionsDone()) + 1;
  await AsyncStorage.setItem(KEY, String(next));
  return next;
}
