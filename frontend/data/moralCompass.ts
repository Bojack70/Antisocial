// Moral Compass: one outward act per session — something done for someone
// else, where nothing comes back to you and nobody in this app finds out.
//
// The axis that keeps this from being a second Field Trip: a Field Trip is
// for YOU (touch a tree, count the doors), and the `connect` trips maintain
// your OWN relationships (call a parent, send a photo). A Moral Compass
// entry costs you something and returns nothing — a stranger, a debt, a
// name you never learned, a thing given away.
//
// The bar, inherited from the missions bar and sharpened:
//   1. Specific beats worthy. "Be kind to one person today" is a slogan,
//      not an act — it ships as "let someone in more of a hurry go first".
//      Nothing in this file may be satisfied by feeling a way about it.
//   2. No reason attached. Stating WHY you should be decent is moralising,
//      and moralising is the thing users left Opal over (docs/user-evidence
//      §6.2). The card names the act and stops. Where a second line exists
//      it is a dry practical note, never a lesson.
//   3. Nothing political, religious, or cause-specific. Where an entry
//      involves giving, the recipient is the visitor's choice, never ours.
//   4. Honour system, no proof, no recipient inside the app. If an act
//      could be performed FOR the app, it doesn't belong here.
//   5. Voice rules as everywhere: deadpan, no exclamation marks, no emoji,
//      no cheerleading. If a line sounds pleased with itself, it's cut.

export interface MoralCompassDefinition {
  id: string;
  // How far out the act reaches in time. Rendered as the card's one piece
  // of meta, because "donate clothes" and "hold a door" are not the same
  // size of ask and pretending otherwise makes the big ones get skipped.
  scale: 'now' | 'today' | 'week';
  text: string;
  // A dry second line — practical, never instructive. Optional; most
  // entries are stronger without one.
  note?: string;
  // Completion label, deadpan past tense. Omitted means "Done".
  cta?: string;
}

export const MORAL_COMPASS: MoralCompassDefinition[] = [
  // ── Now: doable before the next card ─────────────────────────────────
  {
    id: 'mc-ahead',
    scale: 'now',
    text: 'Let someone go ahead of you: a queue, a junction, a doorway. Pick the one in more of a hurry than you.',
    cta: 'Waved through',
  },
  {
    id: 'mc-litter',
    scale: 'now',
    text: 'Pick up three pieces of litter that are not yours.',
    note: 'Three, because three is small enough to actually happen.',
    cta: 'Three picked',
  },
  {
    id: 'mc-unseen',
    scale: 'now',
    text: 'Do one thing for someone you will never see again. No thanks required, and none expected.',
    cta: 'Done, unwitnessed',
  },
  {
    id: 'mc-argument',
    scale: 'now',
    text: 'Think of the last argument you won. Work out which part of it the other person had right.',
    note: 'You don’t have to tell them. This one stays in your head.',
    cta: 'Worked out',
  },
  {
    id: 'mc-bin',
    scale: 'now',
    text: 'Take in the neighbour’s bin, or move their parcel off the step. Mention it to nobody.',
    cta: 'Done quietly',
  },

  // ── Today: needs a person, or a decision ─────────────────────────────
  {
    id: 'mc-pending-call',
    scale: 'today',
    text: 'There is a call you have been meaning to make. You already know whose. Make it today.',
    note: 'Waiting doesn’t make it easier. It only makes it longer to explain.',
    cta: 'Call made',
  },
  {
    id: 'mc-credit',
    scale: 'today',
    text: 'Say out loud, to the person who can act on it, who actually did the work.',
    note: 'Particularly if it wasn’t you.',
    cta: 'Credit given',
  },
  {
    id: 'mc-apology',
    scale: 'today',
    text: 'Apologise for the small thing you decided was too small to apologise for.',
    cta: 'Said it',
  },
  {
    id: 'mc-absent',
    scale: 'today',
    text: 'The next time someone is discussed badly while absent, say the one true good thing you know about them.',
    cta: 'Said',
  },
  {
    id: 'mc-name',
    scale: 'today',
    text: 'Ask the name of someone you see every week and have never asked. The shop, the desk, the gate.',
    note: 'Then use it, which is the harder half.',
    cta: 'Name learned',
  },
  {
    id: 'mc-finish',
    scale: 'today',
    text: 'Ask someone how they are, and then do nothing else at all until they have finished answering.',
    cta: 'Heard out',
  },
  {
    id: 'mc-review',
    scale: 'today',
    text: 'Leave a good review for a small place that has never asked you for one.',
    cta: 'Review left',
  },
  {
    id: 'mc-no-solution',
    scale: 'today',
    text: 'Help with something you have no stake in and no opinion about. Do it their way.',
    cta: 'Helped',
  },

  // ── This week: the ones with a real cost ─────────────────────────────
  {
    id: 'mc-clothes',
    scale: 'week',
    text: 'Find five things in your wardrobe you have not worn in a year. Take them somewhere that will give them away.',
    note: 'The ones you are unsure about are the ones.',
    cta: 'Bag dropped',
  },
  {
    id: 'mc-extra',
    scale: 'week',
    text: 'Buy one extra thing at the shop and leave it in the food donation box on your way out.',
    cta: 'Extra left',
  },
  {
    id: 'mc-anonymous',
    scale: 'week',
    text: 'Give something away without your name attached to it.',
    note: 'The anonymity is the entire exercise.',
    cta: 'Given',
  },
  {
    id: 'mc-teach',
    scale: 'week',
    text: 'Teach someone something you know and they don’t. Give them the whole of it, not the outline.',
    cta: 'Taught',
  },
  {
    id: 'mc-elder',
    scale: 'week',
    text: 'Ask an older relative one question about their life you have never asked. Write the answer down somewhere it will survive.',
    cta: 'Asked and written',
  },
  {
    id: 'mc-borrowed',
    scale: 'week',
    text: 'Return the small thing you borrowed that both of you have stopped mentioning.',
    cta: 'Returned',
  },
  {
    id: 'mc-blood',
    scale: 'week',
    text: 'Find out where the nearest place to donate blood is, and what its hours are.',
    note: 'Whether you go is a separate question, asked later.',
    cta: 'Found out',
  },
  {
    id: 'mc-standing',
    scale: 'week',
    text: 'Set up one small monthly donation to something you already believe in. Small enough that you will never cancel it.',
    cta: 'Set up',
  },
];
