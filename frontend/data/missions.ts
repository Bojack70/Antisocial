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
  // Completion-button label, specific to the trip ("Tree touched") — same
  // voice rules as the text: deadpan past tense, no cheerleading. Omitted
  // means the button reads "Done".
  cta?: string;
}

export const MISSIONS: MissionDefinition[] = [
  // ── Outside ──────────────────────────────────────────────────────────
  { id: 'outside-tree', minutes: 2, category: 'outside', text: 'Go outside and touch a tree. That’s it. That’s the whole trip.', cta: 'Tree touched' },
  { id: 'outside-doors', minutes: 5, category: 'outside', text: 'Walk to the end of your street and back. Count the front doors.', cta: 'Doors counted' },
  { id: 'outside-older', minutes: 5, category: 'outside', text: 'Find three things outside that are older than you.', cta: 'All three found' },
  { id: 'outside-sky', minutes: 2, category: 'outside', text: 'Step outside and look at the sky for one minute. It’s doing something. It always is.', cta: 'Sky watched' },
  { id: 'outside-wrong-way', minutes: 5, category: 'outside', text: 'Walk for three minutes in a direction you don’t usually go. Then come back.', cta: 'Walked and back' },
  { id: 'outside-old-tree', minutes: 5, category: 'outside', text: 'Find the oldest tree you can see. Guess its age. You will be wrong, but guess.', cta: 'Age guessed' },
  { id: 'outside-sounds', minutes: 2, category: 'outside', text: 'Stand outside your door until you’ve counted five different sounds.', cta: 'Five heard' },
  { id: 'outside-red', minutes: 2, category: 'outside', text: 'Find something red outside. Not a car. Cars are cheating.', cta: 'Red found' },
  { id: 'outside-bird', minutes: 5, category: 'outside', text: 'Watch for a bird. However long it takes. They’re always around when you’re not looking.', cta: 'Bird seen' },
  { id: 'outside-block', minutes: 5, category: 'outside', text: 'Walk around the block without the phone. It will still be here.', cta: 'Block walked' },
  { id: 'outside-stone', minutes: 2, category: 'outside', text: 'Find a stone you like. Keep it or don’t. The choosing is the point.', cta: 'Stone considered' },
  { id: 'outside-air', minutes: 2, category: 'outside', text: 'Step outside and work out what the air smells like today. Be specific.', cta: 'Air named' },

  // ── Observe ──────────────────────────────────────────────────────────
  { id: 'observe-sounds', minutes: 2, category: 'observe', text: 'List five sounds you can hear right now. The fifth one is the interesting one.', cta: 'Five listed' },
  { id: 'observe-window', minutes: 2, category: 'observe', text: 'Look out the nearest window for two minutes. Nothing else. Harder than it sounds.', cta: 'Two minutes looked' },
  { id: 'observe-photo', minutes: 2, category: 'observe', text: 'Photograph something you pass every day and have never looked at.', cta: 'Photographed' },
  { id: 'observe-oldest', minutes: 2, category: 'observe', text: 'Find the oldest object in the room. Consider where it’s been.', cta: 'Found it' },
  { id: 'observe-quiet', minutes: 2, category: 'observe', text: 'Sit still for one minute and hear what the room sounds like when you’re not making noise.', cta: 'Minute sat' },
  { id: 'observe-hands', minutes: 2, category: 'observe', text: 'Look at your hands for thirty seconds. They’ve done everything you’ve ever done.', cta: 'Hands seen' },
  { id: 'observe-ten-years', minutes: 2, category: 'observe', text: 'Find something you’ve owned for ten years. Remember buying it.', cta: 'Remembered' },
  { id: 'observe-color', minutes: 2, category: 'observe', text: 'Pick a color. Find seven things in that color before you stop.', cta: 'Seven found' },
  { id: 'observe-ceiling', minutes: 2, category: 'observe', text: 'Look up. Ceilings are the least observed surface in any home. Find one thing.', cta: 'Ceiling checked' },
  { id: 'observe-cloud', minutes: 5, category: 'observe', text: 'Watch one cloud until it stops being the shape it was.', cta: 'Cloud outlasted' },

  // ── Make ─────────────────────────────────────────────────────────────
  { id: 'make-cat', minutes: 2, category: 'make', text: 'Draw a cat as badly as you can. Genuinely try to make it worse.', cta: 'Cat ruined' },
  { id: 'make-plane', minutes: 2, category: 'make', text: 'Fold a paper airplane. Test flight mandatory.', cta: 'Flight tested' },
  { id: 'make-sentences', minutes: 2, category: 'make', text: 'Write three sentences about today. Paper, if any exists nearby.', cta: 'Three written' },
  { id: 'make-tea', minutes: 5, category: 'make', text: 'Make tea or coffee the slow way. Watch the water do its thing.', cta: 'Brewed slowly' },
  { id: 'make-hum', minutes: 2, category: 'make', text: 'Hum a tune you haven’t heard in years. See how much of it is still in there.', cta: 'Hummed' },
  { id: 'make-shoe', minutes: 5, category: 'make', text: 'Draw your shoe. Look at the shoe, not the paper.', cta: 'Shoe drawn' },
  { id: 'make-idea', minutes: 2, category: 'make', text: 'Write down one idea you’ve been carrying around. It doesn’t have to be good. It has to be down.', cta: 'Idea down' },
  { id: 'make-shelf', minutes: 5, category: 'make', text: 'Rearrange one shelf until it pleases you. You’ll know when.', cta: 'Shelf settled' },
  { id: 'make-sandwich', minutes: 5, category: 'make', text: 'Make a sandwich you’ve never made before. Ambition optional.', cta: 'Sandwich made' },
  { id: 'make-pet-name', minutes: 2, category: 'make', text: 'Decide on a name for the next pet you may never get. Write it down somewhere official.', cta: 'Name decided' },

  // ── Move ─────────────────────────────────────────────────────────────
  { id: 'move-squats', minutes: 2, category: 'move', text: 'Do twenty squats, slower than necessary.', cta: 'Twenty done' },
  { id: 'move-stretch', minutes: 2, category: 'move', text: 'Stretch your arms up until your shoulders object. Hold for five more seconds.', cta: 'Stretched' },
  { id: 'move-far-wall', minutes: 2, category: 'move', text: 'Stand up and touch the farthest wall from where you’re sitting. Come back a different way.', cta: 'Wall touched' },
  { id: 'move-balance', minutes: 2, category: 'move', text: 'Balance on one foot while you think about nothing. Switch feet. Compare.', cta: 'Both feet tried' },
  { id: 'move-stairs', minutes: 2, category: 'move', text: 'Walk up and down the nearest stairs twice, unhurried.', cta: 'Stairs climbed' },
  { id: 'move-shoulders', minutes: 2, category: 'move', text: 'Roll your shoulders ten times. They’ve been up near your ears for hours.', cta: 'Ten rolled' },
  { id: 'move-pushups', minutes: 2, category: 'move', text: 'Ten slow push-ups. Knees allowed. Nobody is watching.', cta: 'Ten done' },
  { id: 'move-fold', minutes: 2, category: 'move', text: 'Hang your arms and fold slowly toward your toes. Stop where your body says stop.', cta: 'Folded and up' },
  { id: 'move-water', minutes: 2, category: 'move', text: 'Drink a full glass of water. Standing. Start to finish.', cta: 'Glass emptied' },

  // ── Tidy ─────────────────────────────────────────────────────────────
  { id: 'tidy-surface', minutes: 2, category: 'tidy', text: 'Clear one surface completely. Just the one.', cta: 'Surface cleared' },
  { id: 'tidy-rearrange', minutes: 2, category: 'tidy', text: 'Rearrange one thing in your room. See if anyone notices.', cta: 'Rearranged' },
  { id: 'tidy-garbage', minutes: 5, category: 'tidy', text: 'Throw away five things that are technically garbage. You know the ones.', cta: 'Five gone' },
  { id: 'tidy-bed', minutes: 2, category: 'tidy', text: 'Make the bed. Even now. Especially now.', cta: 'Bed made' },
  { id: 'tidy-crooked', minutes: 2, category: 'tidy', text: 'Fix the one crooked thing. You know which one.', cta: 'Straightened' },
  { id: 'tidy-drawer', minutes: 5, category: 'tidy', text: 'Empty one pocket, one bag, or one drawer. Archaeology counts as tidying.', cta: 'Excavated' },
  { id: 'tidy-plant', minutes: 2, category: 'tidy', text: 'Water the plant. If there is no plant, consider why.', cta: 'Plant watered' },
  { id: 'tidy-cup', minutes: 2, category: 'tidy', text: 'Take one cup back to the kitchen. There’s always a cup.', cta: 'Cup returned' },
  { id: 'tidy-unsubscribe', minutes: 5, category: 'tidy', text: 'Unsubscribe from three emails you never read. A different kind of tidying.', cta: 'Three fewer' },

  // ── Connect ──────────────────────────────────────────────────────────
  { id: 'connect-month', minutes: 2, category: 'connect', text: 'Message someone you haven’t spoken to in a month. One sentence is plenty.', cta: 'Message sent' },
  { id: 'connect-call', minutes: 5, category: 'connect', text: 'Call a parent or an old friend. Ask what they had for dinner. Stay for the tangent.', cta: 'Call made' },
  { id: 'connect-voice', minutes: 2, category: 'connect', text: 'Send a voice note instead of a text. To anyone. Voices carry more.', cta: 'Voice note sent' },
  { id: 'connect-retell', minutes: 2, category: 'connect', text: 'Tell someone about the last thing you read here. Retelling is the test.', cta: 'Retold' },
  { id: 'connect-thanks', minutes: 5, category: 'connect', text: 'Write a two-line thank you to someone who won’t expect it.', cta: 'Thanks sent' },
  { id: 'connect-ask', minutes: 5, category: 'connect', text: 'Ask someone what they’re reading or watching. Actually listen to the answer.', cta: 'Asked and listened' },
  { id: 'connect-compliment', minutes: 5, category: 'connect', text: 'Compliment someone on something specific. Specific is the hard part.', cta: 'Compliment landed' },
  { id: 'connect-plan', minutes: 5, category: 'connect', text: 'Make a plan with someone. A real one, with a day attached.', cta: 'Plan made' },
  { id: 'connect-photo', minutes: 2, category: 'connect', text: 'Find a photo from more than a year ago and send it to someone who was there.', cta: 'Photo sent' },
  { id: 'connect-listen', minutes: 5, category: 'connect', text: 'Ask the nearest person about their current small problem. Offer no solution. Just hear it.', cta: 'Heard it out' },
];
