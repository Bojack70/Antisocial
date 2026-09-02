import AsyncStorage from '@react-native-async-storage/async-storage';
import { recordGoodTurn } from './weekLedger';

// A lifetime count of Moral Compass acts marked done — one quiet number,
// same contract as missions.ts: no streaks, no badges, no daily reset.
// Especially here. A good-turn streak would turn decency into a score to
// protect, which is the exact machine this app exists not to be.
//
// Nothing is verified and nothing leaves the device. The number's only job
// is to feed the weekly recap.

const KEY = 'good_turns_done';

export async function goodTurnsDone(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export async function recordGoodTurnDone(): Promise<number> {
  const next = (await goodTurnsDone()) + 1;
  await AsyncStorage.setItem(KEY, String(next));
  await recordGoodTurn();
  return next;
}
