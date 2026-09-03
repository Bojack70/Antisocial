import AsyncStorage from '@react-native-async-storage/async-storage';
import { today } from './usage';
import { recordWrite } from './weekLedger';

// The notebook: the writing card's store. A couple of honest lines against
// a specific prompt, kept locally and only locally — nothing here ever
// leaves the device. The Week in Review quotes the freshest line back
// ("you wrote this on Tuesday"), which is the whole payoff. Same
// discipline as usage.ts and weekLedger.ts: dated entries, corrupt data
// reads as empty, old days pruned on write.

export interface NotebookEntry {
  date: string; // local YYYY-MM-DD
  sessionKey: string; // one entry per rendered card; edits replace it
  promptId: string;
  prompt: string;
  text: string;
}

const KEY = 'notebook';
const RECENT_KEY = 'notebook_recent_prompts';
const KEEP_DAYS = 28;
const RECENT_PROMPTS = 6;

async function readBook(): Promise<NotebookEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is NotebookEntry =>
        typeof e?.date === 'string' &&
        typeof e?.sessionKey === 'string' &&
        typeof e?.prompt === 'string' &&
        typeof e?.text === 'string'
    );
  } catch {
    return [];
  }
}

function cutoff(now: Date): string {
  const d = new Date(now);
  d.setDate(d.getDate() - (KEEP_DAYS - 1));
  return today(d);
}

/**
 * Keep (or re-keep) what was written on one card. The first write of a
 * session ticks the week ledger; edits replace the entry without counting
 * twice — the depth action is "wrote something", not "kept typing".
 */
export async function writeInNotebook(
  entry: Omit<NotebookEntry, 'date'>,
  now = new Date()
): Promise<void> {
  const book = await readBook();
  const existing = book.findIndex((e) => e.sessionKey === entry.sessionKey);
  const dated: NotebookEntry = { ...entry, date: today(now) };
  if (existing >= 0) {
    book[existing] = dated;
  } else {
    book.push(dated);
    recordWrite(now);
  }
  const pruned = book.filter((e) => e.date >= cutoff(now));
  await AsyncStorage.setItem(KEY, JSON.stringify(pruned));
}

/** The freshest entry within [from, to] (local dates, inclusive), or null. */
export async function entryBetween(
  from: string,
  to: string
): Promise<NotebookEntry | null> {
  const inRange = (await readBook()).filter((e) => e.date >= from && e.date <= to);
  return inRange.length > 0 ? inRange[inRange.length - 1] : null;
}

/**
 * Pick the session's prompt: random among those not used recently, so the
 * same question doesn't come back before ~a week of sessions has passed.
 */
export async function pickPrompt<T extends { id: string }>(prompts: T[]): Promise<T> {
  let recent: string[] = [];
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) recent = parsed.filter((x) => typeof x === 'string');
  } catch {
    // Unreadable recency list: any prompt is fine.
  }
  const fresh = prompts.filter((p) => !recent.includes(p.id));
  const pool = fresh.length > 0 ? fresh : prompts;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const nextRecent = [...recent.filter((id) => id !== chosen.id), chosen.id].slice(
    -RECENT_PROMPTS
  );
  AsyncStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent)).catch(() => {});
  return chosen;
}
