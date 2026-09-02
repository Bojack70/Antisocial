import AsyncStorage from '@react-native-async-storage/async-storage';
import { today } from './usage';

// A rolling record of the last two weeks, one entry per local calendar
// day, written as things happen (session served, field trip done, left
// early). The weekly recap card reads it; nothing else does. Same
// discipline as usage.ts/quota.ts: dated entries, corrupt data reads as
// empty, old days pruned on write.

export interface DayEntry {
  date: string; // local YYYY-MM-DD
  sessions: number;
  cards: number;
  missions: number;
  leftEarly: number;
  // Depth actions (session-depth spec): a guess committed on a card, an
  // audio actually played, a game run played to its natural end. A
  // 4-minute session with two guesses and a played round beats 9 minutes
  // of numb swiping, so these are the numbers the spec says to watch,
  // not raw minutes. audioPlays exists BEFORE the listening-room decision
  // (spec item 5) so that decision is made on data, not a hunch.
  guesses: number;
  audioPlays: number;
  gameRounds: number;
  // Guestbook signatures: "I would retell this card." The retell test
  // from the content bar, turned into a number.
  retells: number;
  // Notebook entries: lines actually written on a writing card.
  writes: number;
  // Try This cards taken to their "I did it" — a skill actually attempted.
  skillsDone: number;
  // Gentle Reminders taken to their "Done. That's it." — an honor-system
  // tap, same contract as missions.
  reminders: number;
  // Moral Compass cards taken to their done-tap: an outward act nobody
  // else can verify. Kept separate from `missions` deliberately — a field
  // trip is for you, a good turn isn't, and merging them would make the
  // recap unable to tell the visitor which kind of week they had.
  goodTurns: number;
}

export interface WeekRecap {
  weekStart: string;
  weekEnd: string;
  daysVisited: number;
  sessions: number;
  cards: number;
  missions: number;
  leftEarly: number;
  guesses: number;
  audioPlays: number;
  gameRounds: number;
  retells: number;
  writes: number;
  skillsDone: number;
  reminders: number;
  goodTurns: number;
}

const KEY = 'week_ledger';
const SHOWN_KEY = 'week_recap_shown';
const KEEP_DAYS = 14;

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Monday of the week containing d, local time. */
function mondayOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return addDays(x, -((x.getDay() + 6) % 7));
}

function isCount(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

async function readLedger(): Promise<DayEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is DayEntry =>
          typeof e?.date === 'string' &&
          isCount(e.sessions) &&
          isCount(e.cards) &&
          isCount(e.missions) &&
          isCount(e.leftEarly)
      )
      // Entries written before the depth-action fields existed stay valid;
      // they just read as zero rather than being dropped from the ledger.
      .map((e) => ({
        ...e,
        guesses: isCount(e.guesses) ? e.guesses : 0,
        audioPlays: isCount(e.audioPlays) ? e.audioPlays : 0,
        gameRounds: isCount(e.gameRounds) ? e.gameRounds : 0,
        retells: isCount(e.retells) ? e.retells : 0,
        writes: isCount(e.writes) ? e.writes : 0,
        skillsDone: isCount(e.skillsDone) ? e.skillsDone : 0,
        reminders: isCount(e.reminders) ? e.reminders : 0,
        goodTurns: isCount(e.goodTurns) ? e.goodTurns : 0,
      }));
  } catch {
    return [];
  }
}

async function record(
  delta: Partial<Omit<DayEntry, 'date'>>,
  now = new Date()
): Promise<void> {
  const ledger = await readLedger();
  const day = today(now);
  let entry = ledger.find((e) => e.date === day);
  if (!entry) {
    entry = {
      date: day, sessions: 0, cards: 0, missions: 0, leftEarly: 0,
      guesses: 0, audioPlays: 0, gameRounds: 0, retells: 0, writes: 0,
      skillsDone: 0, reminders: 0, goodTurns: 0,
    };
    ledger.push(entry);
  }
  entry.sessions += delta.sessions ?? 0;
  entry.cards += delta.cards ?? 0;
  entry.missions += delta.missions ?? 0;
  entry.leftEarly += delta.leftEarly ?? 0;
  entry.guesses += delta.guesses ?? 0;
  entry.audioPlays += delta.audioPlays ?? 0;
  entry.gameRounds += delta.gameRounds ?? 0;
  entry.retells += delta.retells ?? 0;
  entry.writes += delta.writes ?? 0;
  entry.skillsDone += delta.skillsDone ?? 0;
  entry.reminders += delta.reminders ?? 0;
  entry.goodTurns += delta.goodTurns ?? 0;

  // YYYY-MM-DD compares correctly as a string
  const cutoff = today(addDays(now, -(KEEP_DAYS - 1)));
  const pruned = ledger
    .filter((e) => e.date >= cutoff)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  await AsyncStorage.setItem(KEY, JSON.stringify(pruned));
}

/** A feed session was served, carrying this many content cards. */
export const recordSession = (cards: number, now = new Date()) =>
  record({ sessions: 1, cards }, now);

/** A field trip was marked done. */
export const recordMission = (now = new Date()) => record({ missions: 1 }, now);

/** The visitor tapped Leave while a drift was still available. */
export const recordLeftEarly = (now = new Date()) =>
  record({ leftEarly: 1 }, now);

/** The visitor committed to a guess on a card before its reveal. */
export const recordGuess = (now = new Date()) => record({ guesses: 1 }, now);

/** The visitor actually pressed play on an audio card (first play only). */
export const recordAudioPlay = (now = new Date()) =>
  record({ audioPlays: 1 }, now);

/** A game run reached its natural end — not merely opened and abandoned. */
export const recordGameRound = (now = new Date()) =>
  record({ gameRounds: 1 }, now);

/** The visitor signed the guestbook: named a card they would retell. */
export const recordRetell = (now = new Date()) => record({ retells: 1 }, now);

/** The visitor wrote something on a writing card. */
export const recordWrite = (now = new Date()) => record({ writes: 1 }, now);

/** A Try This card was taken to its "I did it". */
export const recordSkillDone = (now = new Date()) =>
  record({ skillsDone: 1 }, now);

/** A Gentle Reminder was taken to its "Done. That's it.". */
export const recordReminderDone = (now = new Date()) =>
  record({ reminders: 1 }, now);

/** A Moral Compass card was taken to its done-tap. */
export const recordGoodTurn = (now = new Date()) =>
  record({ goodTurns: 1 }, now);

/**
 * Recap of the last finished Monday–Sunday week, or null when that week
 * had fewer than two active days — a card of zeros helps nobody.
 */
export async function lastWeekRecap(now = new Date()): Promise<WeekRecap | null> {
  const prevMonday = addDays(mondayOf(now), -7);
  const weekDays = new Set(
    Array.from({ length: 7 }, (_, i) => today(addDays(prevMonday, i)))
  );
  const entries = (await readLedger()).filter((e) => weekDays.has(e.date));
  const visited = entries.filter(
    (e) => e.sessions > 0 || e.missions > 0 || e.leftEarly > 0
  );
  if (visited.length < 2) return null;

  const sum = (
    f: 'sessions' | 'cards' | 'missions' | 'leftEarly' | 'guesses' | 'audioPlays' | 'gameRounds' | 'retells' | 'writes' | 'skillsDone' | 'reminders' | 'goodTurns'
  ) =>
    entries.reduce((acc, e) => acc + e[f], 0);
  return {
    weekStart: today(prevMonday),
    weekEnd: today(addDays(prevMonday, 6)),
    daysVisited: visited.length,
    sessions: sum('sessions'),
    cards: sum('cards'),
    missions: sum('missions'),
    leftEarly: sum('leftEarly'),
    guesses: sum('guesses'),
    audioPlays: sum('audioPlays'),
    gameRounds: sum('gameRounds'),
    retells: sum('retells'),
    writes: sum('writes'),
    skillsDone: sum('skillsDone'),
    reminders: sum('reminders'),
    goodTurns: sum('goodTurns'),
  };
}

/**
 * The recap that should ride into the feed now: the last finished week's,
 * once, on the first session of the new week — whichever day that is, so
 * a skipped Monday doesn't swallow the recap. Call markRecapShown after
 * actually inserting it.
 */
export async function dueRecap(now = new Date()): Promise<WeekRecap | null> {
  const recap = await lastWeekRecap(now);
  if (!recap) return null;
  try {
    const shown = await AsyncStorage.getItem(SHOWN_KEY);
    if (shown === recap.weekStart) return null;
  } catch {
    // If the flag is unreadable, showing twice beats never showing.
  }
  return recap;
}

export async function markRecapShown(weekStart: string): Promise<void> {
  await AsyncStorage.setItem(SHOWN_KEY, weekStart);
}
