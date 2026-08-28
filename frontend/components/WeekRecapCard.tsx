import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import CardHeader from './CardHeader';
import { cards, colors, type } from '../lib/theme';
import { WeekRecap } from '../lib/weekLedger';
import { entryBetween, NotebookEntry } from '../lib/notebook';

interface WeekRecapCardProps {
  recap: WeekRecap;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// "2026-08-18".."2026-08-24" -> "Aug 18 – 24" (or "Aug 30 – Sep 5")
function formatRange(start: string, end: string): string {
  const [, sm, sd] = start.split('-').map(Number);
  const [, em, ed] = end.split('-').map(Number);
  const from = `${MONTHS[sm - 1]} ${sd}`;
  return sm === em ? `${from} – ${ed}` : `${from} – ${MONTHS[em - 1]} ${ed}`;
}

// The week in review, on the dark surface: four honest numbers, nothing
// the app can't actually measure. Positive ledger only — what you did,
// never what you "wasted". The left-early stat is the one to share.
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function dayName(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return DAY_NAMES[new Date(y, m - 1, d).getDay()];
}

export default function WeekRecapCard({ recap }: WeekRecapCardProps) {
  // The notebook's payoff: the freshest line written that week, quoted
  // back. Local read, may come up empty — the card renders fine without.
  const [entry, setEntry] = useState<NotebookEntry | null>(null);
  useEffect(() => {
    let active = true;
    entryBetween(recap.weekStart, recap.weekEnd).then((e) => {
      if (active) setEntry(e);
    });
    return () => {
      active = false;
    };
  }, [recap.weekStart, recap.weekEnd]);

  const stats = [
    { value: recap.daysVisited, label: 'Days visited' },
    { value: recap.missions, label: 'Field trips' },
    { value: recap.leftEarly, label: 'Left before closing' },
    { value: recap.cards, label: 'Cards seen' },
  ];

  const voiceLine =
    recap.leftEarly > 0
      ? `Left before closing, ${recap.leftEarly === 1 ? 'once' : `${recap.leftEarly} times`}. The museum approves.`
      : 'A quiet week at the museum.';

  return (
    <View style={cards.dark}>
      <CardHeader
        icon="stats-chart-outline"
        color="#14b8a6"
        label="The Week in Review"
        tone="dark"
      />

      <Text style={styles.title}>Your week at the museum.</Text>
      <Text style={styles.range}>{formatRange(recap.weekStart, recap.weekEnd)}</Text>

      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.cell}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.voiceLine}>{voiceLine}</Text>

      {/* The guestbook feeding back: how many cards passed the retell test. */}
      {recap.retells > 0 && (
        <Text style={styles.voiceLine}>
          {recap.retells === 1
            ? 'One card was worth retelling. You signed for it.'
            : `${recap.retells} cards were worth retelling. You signed for them.`}
        </Text>
      )}

      {/* The notebook feeding back: your own line, returned. */}
      {entry && (
        <View style={styles.entryBlock}>
          <Text style={styles.entryText}>“{entry.text}”</Text>
          <Text style={styles.entryAttribution}>
            — you, {dayName(entry.date)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.titleOnDark,
  },
  range: {
    ...type.micro,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    rowGap: 18,
  },
  cell: {
    width: '50%',
  },
  value: {
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 36,
    color: '#FFFFFF',
  },
  statLabel: {
    ...type.micro,
    marginTop: 3,
  },
  voiceLine: {
    ...type.bodyOnDark,
    marginTop: 20,
  },
  entryBlock: {
    marginTop: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.darkLine,
  },
  entryText: {
    ...type.bodyOnDark,
    fontStyle: 'italic',
  },
  entryAttribution: {
    ...type.micro,
    marginTop: 6,
  },
});
