// Field Trips: small real-world missions the feed hands out, one per
// session, as the exit ramp — the last card before the museum closes.
//
// The quality bar (sibling of the content bar's retell test): would you
// actually do it, and would you remember doing it? Specific beats worthy.
// Voice rules apply: deadpan, no exclamation marks, no cheerleading; if a
// line sounds like it knows it's funny, it doesn't ship.
//
// Categories keep the set usable at any hour — a mission at 11pm in the
// rain should still be possible, so not everything requires going outside.

export interface MissionDefinition {
  id: string;
  minutes: 2 | 5;
  category: 'outside' | 'observe' | 'make' | 'move' | 'tidy' | 'connect';
  text: string;
}

export const MISSIONS: MissionDefinition[] = [
  // ── Outside ──────────────────────────────────────────────────────────
  { id: 'outside-tree', minutes: 2, category: 'outside', text: 'Go outside and touch a tree. That’s it. That’s the whole trip.' },
  { id: 'outside-doors', minutes: 5, category: 'outside', text: 'Walk to the end of your street and back. Count the front doors.' },
  { id: 'outside-older', minutes: 5, category: 'outside', text: 'Find three things outside that are older than you.' },
  { id: 'outside-sky', minutes: 2, category: 'outside', text: 'Step outside and look at the sky for one minute. It’s doing something. It always is.' },
  { id: 'outside-wrong-way', minutes: 5, category: 'outside', text: 'Walk for three minutes in a direction you don’t usually go. Then come back.' },
  { id: 'outside-old-tree', minutes: 5, category: 'outside', text: 'Find the oldest tree you can see. Guess its age. You will be wrong, but guess.' },
  { id: 'outside-sounds', minutes: 2, category: 'outside', text: 'Stand outside your door until you’ve counted five different sounds.' },
  { id: 'outside-red', minutes: 2, category: 'outside', text: 'Find something red outside. Not a car. Cars are cheating.' },
  { id: 'outside-bird', minutes: 5, category: 'outside', text: 'Watch for a bird. However long it takes. They’re always around when you’re not looking.' },
  { id: 'outside-block', minutes: 5, category: 'outside', text: 'Walk around the block without the phone. It will still be here.' },
  { id: 'outside-stone', minutes: 2, category: 'outside', text: 'Find a stone you like. Keep it or don’t. The choosing is the point.' },
  { id: 'outside-air', minutes: 2, category: 'outside', text: 'Step outside and work out what the air smells like today. Be specific.' },

  // ── Observe ──────────────────────────────────────────────────────────
  { id: 'observe-sounds', minutes: 2, category: 'observe', text: 'List five sounds you can hear right now. The fifth one is the interesting one.' },
  { id: 'observe-window', minutes: 2, category: 'observe', text: 'Look out the nearest window for two minutes. Nothing else. Harder than it sounds.' },
  { id: 'observe-photo', minutes: 2, category: 'observe', text: 'Photograph something you pass every day and have never looked at.' },
  { id: 'observe-oldest', minutes: 2, category: 'observe', text: 'Find the oldest object in the room. Consider where it’s been.' },
  { id: 'observe-quiet', minutes: 2, category: 'observe', text: 'Sit still for one minute and hear what the room sounds like when you’re not making noise.' },
  { id: 'observe-hands', minutes: 2, category: 'observe', text: 'Look at your hands for thirty seconds. They’ve done everything you’ve ever done.' },
  { id: 'observe-ten-years', minutes: 2, category: 'observe', text: 'Find something you’ve owned for ten years. Remember buying it.' },
  { id: 'observe-color', minutes: 2, category: 'observe', text: 'Pick a color. Find seven things in that color before you stop.' },
  { id: 'observe-ceiling', minutes: 2, category: 'observe', text: 'Look up. Ceilings are the least observed surface in any home. Find one thing.' },
  { id: 'observe-cloud', minutes: 5, category: 'observe', text: 'Watch one cloud until it stops being the shape it was.' },

  // ── Make ─────────────────────────────────────────────────────────────
  { id: 'make-cat', minutes: 2, category: 'make', text: 'Draw a cat as badly as you can. Genuinely try to make it worse.' },
  { id: 'make-plane', minutes: 2, category: 'make', text: 'Fold a paper airplane. Test flight mandatory.' },
  { id: 'make-sentences', minutes: 2, category: 'make', text: 'Write three sentences about today. Paper, if any exists nearby.' },
  { id: 'make-tea', minutes: 5, category: 'make', text: 'Make tea or coffee the slow way. Watch the water do its thing.' },
  { id: 'make-hum', minutes: 2, category: 'make', text: 'Hum a tune you haven’t heard in years. See how much of it is still in there.' },
  { id: 'make-shoe', minutes: 5, category: 'make', text: 'Draw your shoe. Look at the shoe, not the paper.' },
  { id: 'make-idea', minutes: 2, category: 'make', text: 'Write down one idea you’ve been carrying around. It doesn’t have to be good. It has to be down.' },
  { id: 'make-shelf', minutes: 5, category: 'make', text: 'Rearrange one shelf until it pleases you. You’ll know when.' },
  { id: 'make-sandwich', minutes: 5, category: 'make', text: 'Make a sandwich you’ve never made before. Ambition optional.' },
  { id: 'make-pet-name', minutes: 2, category: 'make', text: 'Decide on a name for the next pet you may never get. Write it down somewhere official.' },

  // ── Move ─────────────────────────────────────────────────────────────
  { id: 'move-squats', minutes: 2, category: 'move', text: 'Do twenty squats, slower than necessary.' },
  { id: 'move-stretch', minutes: 2, category: 'move', text: 'Stretch your arms up until your shoulders object. Hold for five more seconds.' },
  { id: 'move-far-wall', minutes: 2, category: 'move', text: 'Stand up and touch the farthest wall from where you’re sitting. Come back a different way.' },
  { id: 'move-balance', minutes: 2, category: 'move', text: 'Balance on one foot while you think about nothing. Switch feet. Compare.' },
  { id: 'move-stairs', minutes: 2, category: 'move', text: 'Walk up and down the nearest stairs twice, unhurried.' },
  { id: 'move-shoulders', minutes: 2, category: 'move', text: 'Roll your shoulders ten times. They’ve been up near your ears for hours.' },
  { id: 'move-pushups', minutes: 2, category: 'move', text: 'Ten slow push-ups. Knees allowed. Nobody is watching.' },
  { id: 'move-fold', minutes: 2, category: 'move', text: 'Hang your arms and fold slowly toward your toes. Stop where your body says stop.' },
  { id: 'move-water', minutes: 2, category: 'move', text: 'Drink a full glass of water. Standing. Start to finish.' },

  // ── Tidy ─────────────────────────────────────────────────────────────
  { id: 'tidy-surface', minutes: 2, category: 'tidy', text: 'Clear one surface completely. Just the one.' },
  { id: 'tidy-rearrange', minutes: 2, category: 'tidy', text: 'Rearrange one thing in your room. See if anyone notices.' },
  { id: 'tidy-garbage', minutes: 5, category: 'tidy', text: 'Throw away five things that are technically garbage. You know the ones.' },
  { id: 'tidy-bed', minutes: 2, category: 'tidy', text: 'Make the bed. Even now. Especially now.' },
  { id: 'tidy-crooked', minutes: 2, category: 'tidy', text: 'Fix the one crooked thing. You know which one.' },
  { id: 'tidy-drawer', minutes: 5, category: 'tidy', text: 'Empty one pocket, one bag, or one drawer. Archaeology counts as tidying.' },
  { id: 'tidy-plant', minutes: 2, category: 'tidy', text: 'Water the plant. If there is no plant, consider why.' },
  { id: 'tidy-cup', minutes: 2, category: 'tidy', text: 'Take one cup back to the kitchen. There’s always a cup.' },
  { id: 'tidy-unsubscribe', minutes: 5, category: 'tidy', text: 'Unsubscribe from three emails you never read. A different kind of tidying.' },

  // ── Connect ──────────────────────────────────────────────────────────
  { id: 'connect-month', minutes: 2, category: 'connect', text: 'Message someone you haven’t spoken to in a month. One sentence is plenty.' },
  { id: 'connect-call', minutes: 5, category: 'connect', text: 'Call a parent or an old friend. Ask what they had for dinner. Stay for the tangent.' },
  { id: 'connect-voice', minutes: 2, category: 'connect', text: 'Send a voice note instead of a text. To anyone. Voices carry more.' },
  { id: 'connect-retell', minutes: 2, category: 'connect', text: 'Tell someone about the last thing you read here. Retelling is the test.' },
  { id: 'connect-thanks', minutes: 5, category: 'connect', text: 'Write a two-line thank you to someone who won’t expect it.' },
  { id: 'connect-ask', minutes: 5, category: 'connect', text: 'Ask someone what they’re reading or watching. Actually listen to the answer.' },
  { id: 'connect-compliment', minutes: 5, category: 'connect', text: 'Compliment someone on something specific. Specific is the hard part.' },
  { id: 'connect-plan', minutes: 5, category: 'connect', text: 'Make a plan with someone. A real one, with a day attached.' },
  { id: 'connect-photo', minutes: 2, category: 'connect', text: 'Find a photo from more than a year ago and send it to someone who was there.' },
  { id: 'connect-listen', minutes: 5, category: 'connect', text: 'Ask the nearest person about their current small problem. Offer no solution. Just hear it.' },
];
