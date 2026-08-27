import AsyncStorage from '@react-native-async-storage/async-storage';

// The ledger of cards this visitor has already been shown.
//
// The backend picks content with MongoDB's $sample, which draws independently
// on every request — so without this list the same card can surface twice in
// one day no matter how much content exists. Volume decides how many days the
// museum lasts; this file is what stops it repeating itself.
//
// Unlike the quota and usage ledgers, this one is deliberately NOT day-stamped:
// a card seen on Monday should still be spent on Friday.

const KEY = 'seen_content';

// Roughly a month at 2 sessions x 12 cards, so the window comfortably outlives
// the content behind it. Kept bounded because the whole list travels to the
// backend on every fetch; at ~37 bytes an id this is a request of ~22 KB.
export const MAX_SEEN = 600;

async function read(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is string => typeof id === 'string');
      }
    }
  } catch {
    // Corrupt value: start the ledger over. Showing a repeat is a far smaller
    // failure than refusing to serve a session.
  }
  return [];
}

/** Ids to exclude from the next slate, oldest first. */
export async function getSeenIds(): Promise<string[]> {
  return read();
}

/**
 * Records the cards a session actually put on screen.
 *
 * Call with only the items the visitor saw — the backend returns a slate of 35
 * and the client shows 9-12, so marking the whole slate would burn three
 * sessions' worth of content per session.
 */
export async function markSeen(ids: string[]): Promise<void> {
  const fresh = ids.filter((id) => typeof id === 'string' && id.length > 0);
  if (fresh.length === 0) return;

  const merged = [...(await read()), ...fresh];
  // Dedupe keeping first occurrence, then keep only the newest MAX_SEEN so the
  // very oldest cards eventually become eligible again.
  const deduped = Array.from(new Set(merged));
  const trimmed = deduped.slice(Math.max(0, deduped.length - MAX_SEEN));

  await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
}

/** Wipes the ledger, making every card eligible again. */
export async function resetSeen(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
