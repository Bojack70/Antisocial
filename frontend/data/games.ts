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
    color: '#6366f1',
    title: 'The Timeline',
    description:
      'Which came first? Chain correct answers into a streak. The year gaps shrink as you go.',
    cta: 'Start a run',
    statKey: 'timeline_best_streak',
    statLabel: (value) => `Best streak ${value}`,
  },
  {
    id: 'board',
    route: '/board',
    label: 'Game',
    icon: 'dice-outline',
    color: '#ec4899',
    title: 'Shortcuts & Rabbit Holes',
    description:
      'Race Time across the board. Shortcuts jump you ahead, rabbit holes pull you under — every one hides a fact.',
    cta: 'Roll the dice',
    statKey: 'board_wins',
    statLabel: (value) => `${value} win${value === 1 ? '' : 's'} against Time`,
  },
  {
    id: 'bricks',
    route: '/bricks',
    label: 'Game',
    icon: 'grid-outline',
    color: '#0ea5e9',
    title: 'Brick Breaker',
    description:
      'Steer the paddle, clear the wall. Where the ball hits the paddle decides where it goes next — and every cleared level hands you a fact.',
    cta: 'Break some bricks',
    statKey: 'bricks_best_score',
    statLabel: (value) => `Best score ${value}`,
  },
];
