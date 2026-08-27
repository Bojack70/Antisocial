import AsyncStorage from '@react-native-async-storage/async-storage';

// The daily time boundary. The count used to be a bare running total with
// no date attached, so once it passed the limit the app locked itself out
// permanently. It is now stamped with the day it belongs to and anything
// from an earlier day reads as zero.

export const DAILY_LIMIT_MINUTES = 180;

const KEY = 'daily_usage';
const LEGACY_KEY = 'daily_usage_minutes';

interface Usage {
  date: string;
  minutes: number;
}

/** Local calendar day, not UTC — "tomorrow" should mean the user's tomorrow. */
export function today(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

async function read(): Promise<Usage> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    // First run after the fix: drop the old undated counter rather than
    // inheriting a total that may already be past the limit.
    await AsyncStorage.removeItem(LEGACY_KEY);
    return { date: today(), minutes: 0 };
  }
  try {
    const parsed = JSON.parse(raw) as Usage;
    if (parsed?.date === today() && typeof parsed.minutes === 'number') {
      return parsed;
    }
  } catch {
    // Corrupt value: treat as a fresh day rather than blocking the app.
  }
  return { date: today(), minutes: 0 };
}

/** Minutes used so far today. Any earlier day's count reads as zero. */
export async function minutesUsedToday(): Promise<number> {
  return (await read()).minutes;
}

/**
 * Adds a minute to today's total. `rolledOver` is true when the clock
 * crossed midnight since the last tick, so a session running past midnight
 * can lift the boundary instead of staying locked out until a restart.
 */
export async function addMinute(): Promise<{ minutes: number; rolledOver: boolean }> {
  const raw = await AsyncStorage.getItem(KEY);
  let previousDate: string | null = null;
  if (raw) {
    try {
      previousDate = (JSON.parse(raw) as Usage)?.date ?? null;
    } catch {
      previousDate = null;
    }
  }

  const current = await read();
  const next: Usage = { date: today(), minutes: current.minutes + 1 };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));

  return {
    minutes: next.minutes,
    rolledOver: previousDate !== null && previousDate !== next.date,
  };
}

/** Start today's count from zero (used when onboarding completes). */
export async function resetUsage(): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify({ date: today(), minutes: 0 }));
  await AsyncStorage.removeItem(LEGACY_KEY);
}
