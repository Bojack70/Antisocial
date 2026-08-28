import AsyncStorage from '@react-native-async-storage/async-storage';
import { today } from './usage';
import { recordRetell } from './weekLedger';

// The guestbook: at the end of a session the visitor names the one card
// they would actually retell — the content bar's retell test, made into a
// tap. Entries keep the card's title so a future Week in Review can quote
// them back ("you said you'd retell this on Tuesday"); the ledger keeps
// the count. Same discipline as the other stores: dated entries, corrupt
// data reads as empty, old days pruned on write.

export interface GuestbookEntry {
  date: string; // local YYYY-MM-DD
  // One per guestbook card shown; lets a changed mind replace its own
  // entry instead of stacking a second signature for the same session.
  sessionKey: string;
  cardId: string;
  cardType: string;
  title: string;
  note?: string;
}

const KEY = 'guestbook';
const KEEP_DAYS = 28;

async function readBook(): Promise<GuestbookEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is GuestbookEntry =>
        typeof e?.date === 'string' &&
        typeof e?.sessionKey === 'string' &&
        typeof e?.cardId === 'string' &&
        typeof e?.title === 'string'
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
 * Sign (or re-sign) the guestbook for one session. The first signature of
 * a session ticks the week ledger; changing the chosen card or adding a
 * note afterwards replaces the entry without counting twice.
 */
export async function signGuestbook(
  entry: Omit<GuestbookEntry, 'date'>,
  now = new Date()
): Promise<void> {
  const book = await readBook();
  const existing = book.findIndex((e) => e.sessionKey === entry.sessionKey);
  const dated: GuestbookEntry = { ...entry, date: today(now) };
  if (existing >= 0) {
    book[existing] = dated;
  } else {
    book.push(dated);
    recordRetell(now); // depth action: one tick per session, not per change
  }
  const pruned = book.filter((e) => e.date >= cutoff(now));
  await AsyncStorage.setItem(KEY, JSON.stringify(pruned));
}

/** Entries from the last `days` local days, oldest first. */
export async function recentEntries(days = 7, now = new Date()): Promise<GuestbookEntry[]> {
  const d = new Date(now);
  d.setDate(d.getDate() - (days - 1));
  const from = today(d);
  return (await readBook()).filter((e) => e.date >= from);
}
