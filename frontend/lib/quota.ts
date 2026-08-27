import AsyncStorage from '@react-native-async-storage/async-storage';
import { today } from './usage';

// The daily session quota. The feed serves finite sessions of 9-12 cards;
// this ledger caps how many of those a day may hold. Two = the first visit
// plus one "Drift a little longer". Time-of-day boundary logic (the 180-min
// backstop) lives in usage.ts; this file only counts sessions.

export const MAX_SESSIONS_PER_DAY = 2;

const KEY = 'daily_sessions';

interface SessionLedger {
  date: string;
  sessions: number;
}

async function read(): Promise<SessionLedger> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionLedger;
      if (
        parsed?.date === today() &&
        typeof parsed.sessions === 'number' &&
        parsed.sessions >= 0
      ) {
        return parsed;
      }
    }
  } catch {
    // Corrupt value: treat as a fresh day rather than locking the feed.
  }
  return { date: today(), sessions: 0 };
}

/** Sessions consumed so far today. Any earlier day's count reads as zero. */
export async function sessionsUsedToday(): Promise<number> {
  return (await read()).sessions;
}

export async function hasSessionsLeftToday(): Promise<boolean> {
  return (await read()).sessions < MAX_SESSIONS_PER_DAY;
}

/**
 * Records one consumed feed session. Call only after a session's cards have
 * actually loaded — a failed or empty fetch must not burn quota.
 */
export async function consumeSession(): Promise<number> {
  const current = await read();
  const next: SessionLedger = { date: today(), sessions: current.sessions + 1 };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next.sessions;
}

/** Start today's count from zero (used when onboarding completes). */
export async function resetSessions(): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify({ date: today(), sessions: 0 }));
}
