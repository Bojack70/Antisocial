import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic recency-rotated picker — the notebook's pickPrompt pattern with
 * the storage key parameterized, so every client-bundled pool (quotes,
 * places, …) can avoid repeats without inventing its own ledger. Random
 * among entries not seen in the last `keep` picks; when the whole pool is
 * recent, any entry is fine again.
 */
export async function pickRotating<T extends { id: string }>(
  pool: T[],
  recentKey: string,
  keep = 8
): Promise<T | null> {
  if (pool.length === 0) return null;
  let recent: string[] = [];
  try {
    const raw = await AsyncStorage.getItem(recentKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) recent = parsed.filter((x) => typeof x === 'string');
  } catch {
    // Unreadable recency list: any entry is fine.
  }
  const fresh = pool.filter((p) => !recent.includes(p.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  const nextRecent = [...recent.filter((id) => id !== chosen.id), chosen.id].slice(
    -Math.min(keep, Math.max(1, pool.length - 1))
  );
  AsyncStorage.setItem(recentKey, JSON.stringify(nextRecent)).catch(() => {});
  return chosen;
}
