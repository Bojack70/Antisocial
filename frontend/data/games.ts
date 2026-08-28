import { Ionicons } from '@expo/vector-icons';

// One source of truth for the games: the feed cards and the Game Room hub
// both read from here, so a new game shows up in both places at once.
export interface GameDefinition {
  id: string;
  route: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  title: string;
  description: string;
  cta: string;
  // Anchor framing (session-depth spec item 2): when the game rides in the
  // feed as the session's anchor, the invitation names a bounded arc with a
  // natural end — a run, a life, a race — rather than an open-ended game.
  // The Game Room hub keeps the full description; the feed card uses these.
  arcDescription: string;
  arcCta: string;
  // AsyncStorage key holding the player's personal best, shown as microtext
  // on the feed card once they have one.
  statKey: string;
  statLabel: (value: number) => string;
}

export const GAMES: GameDefinition[] = [
  {
    id: 'timeline',
    route: '/timeline',
    label: 'Game',
    icon: 'hourglass-outline',
    color: '#D9AD6A',
    title: 'The Timeline',
    description:
      'Which came first? Chain correct answers into a streak. The year gaps shrink as you go.',
    cta: 'Start a run',
    arcDescription:
      'One run. Which came first? The run ends the first time you\u2019re wrong.',
    arcCta: 'Start the run',
    statKey: 'timeline_best_streak',
    statLabel: (value) => `Best streak ${value}`,
  },
  {
    id: 'board',
    route: '/board',
    label: 'Game',
    icon: 'dice-outline',
    color: '#C27B5E',
    title: 'Shortcuts & Rabbit Holes',
    description:
      'Race Time across the board. Shortcuts jump you ahead, rabbit holes pull you under — every one hides a fact.',
    cta: 'Roll the dice',
    arcDescription:
      'One race against Time. Shortcuts jump you ahead, rabbit holes pull you under \u2014 someone reaches the end.',
    arcCta: 'Roll the dice',
    statKey: 'board_wins',
    statLabel: (value) => `${value} win${value === 1 ? '' : 's'} against Time`,
  },
  {
    id: 'bricks',
    route: '/bricks',
    label: 'Game',
    icon: 'grid-outline',
    color: '#8BA087',
    title: 'Brick Breaker',
    description:
      'Steer the paddle, clear the wall. Where the ball hits the paddle decides where it goes next — and every cleared level hands you a fact.',
    cta: 'Break some bricks',
    arcDescription:
      'One life, one paddle. See how much of the wall comes down before the ball gets past you.',
    arcCta: 'Take the one life',
    statKey: 'bricks_best_score',
    statLabel: (value) => `Best score ${value}`,
  },
];
