"""
Second seed batch: the reflective card types — ponder, quiet_contradiction and
almost_nothing.

Split from populate_text_content.py on purpose. These three make no factual
claims, so they can be written and shipped without the verification pass that
fast_weird / explainer / incident need. Everything here is a question, a
tension, or a nudge.

Sizing: at 2 sessions/day x 9-12 cards and the backend's slate ratio, nine
repeat-free days needs roughly 31 ponder, 12 almost_nothing and 12
quiet_contradiction. This brings all three above that line.

Content bar (see the ponder/contradiction seeds in populate_text_content.py):
- A ponder must be answerable by anyone, about their own life, with no
  research and no right answer. If every reader picks the same option, cut it.
- Options are real positions, not a gradient of agreement. No "maybe" filler
  unless the hedge is itself a genuine stance.
- A contradiction needs both halves to be true. A half that is merely
  surprising is a fast_weird, not a contradiction.
- almost_nothing addresses the body reading the screen right now. No advice,
  no health claims, no exclamation marks.

Insert-only and idempotent: existing rows with the same question / statement1 /
text are removed first, so re-running edits in place rather than duplicating.
"""
import asyncio
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

PONDER = [
    {
        "question": "If you could know the exact date you'll die, would you look?",
        "options": [
            "Yes — I'd finally stop postponing things",
            "No — I'd count backwards from it every day",
            "Only if I could still change it",
            "I'd look, then wish I hadn't",
        ],
        "tags": ["mortality", "philosophy"],
    },
    {
        "question": "Would you rather be forgotten completely, or remembered wrongly?",
        "options": [
            "Forgotten — at least that's honest",
            "Remembered wrongly — being remembered at all is the point",
            "Depends who's doing the remembering",
            "I'd want one person to get it right and no one else to know",
        ],
        "tags": ["memory", "legacy"],
    },
    {
        "question": "If you could relive one completely ordinary day, which would you pick?",
        "options": [
            "A childhood weekday — nothing happening",
            "A day with someone I can't see anymore",
            "Last Tuesday, honestly, I wasn't paying attention",
            "I don't think I could name one, and that bothers me",
        ],
        "tags": ["memory", "time"],
    },
    {
        "question": "Would you rather have more time, or more attention?",
        "options": [
            "Time — I'd figure out the focus",
            "Attention — I waste the time I already have",
            "Attention, but only for the things I choose",
            "They're the same thing and I've been pretending otherwise",
        ],
        "tags": ["time", "attention"],
    },
    {
        "question": "If everyone could hear your thoughts for one hour a year, would you think differently the rest of it?",
        "options": [
            "Yes — I'd start editing myself permanently",
            "No — my thoughts are duller than people imagine",
            "I'd schedule the hour for while I slept",
            "It might make me kinder, which is uncomfortable to admit",
        ],
        "tags": ["mind", "privacy"],
    },
    {
        "question": "Would you want to know which of your current friendships won't survive the next ten years?",
        "options": [
            "Yes — I'd fight for the ones worth it",
            "No — I'd start grieving them early",
            "I think I already know",
            "Only if I could be told I was wrong",
        ],
        "tags": ["friendship", "time"],
    },
    {
        "question": "If you could send one sentence to yourself ten years ago, would you warn or reassure?",
        "options": [
            "Warn — there's something specific I'd stop",
            "Reassure — I needed that more than information",
            "Neither, I'd send something useless and funny",
            "I wouldn't send anything; I'd have ignored it",
        ],
        "tags": ["time", "regret"],
    },
    {
        "question": "Would you rather be the person others call at 3am, or the person who has someone to call?",
        "options": [
            "The one called — I'd rather be needed",
            "The one calling — I'd rather not be alone with it",
            "I've only ever been one of these",
            "Both, and I suspect you can't be",
        ],
        "tags": ["friendship", "solitude"],
    },
    {
        "question": "If your pet could talk for one day, would you let it?",
        "options": [
            "Yes — I need to know if it's happy",
            "No — I'd find out what it really thinks of me",
            "Yes, but I'd ask nothing and just listen",
            "I'd rather keep the version I've invented",
        ],
        "tags": ["animals", "hypothetical"],
    },
    {
        "question": "Would you accept a perfect memory if it meant never being able to forget anything painful?",
        "options": [
            "Yes — forgetting has cost me more than remembering",
            "No — forgetting is the only mercy the mind offers",
            "Only if I could choose the resolution",
            "I'd take it, then spend years trying to give it back",
        ],
        "tags": ["memory", "mind"],
    },
    {
        "question": "If you had to broadcast one hour of your life publicly, which hour would you least mind?",
        "options": [
            "Something at work — dull and defensible",
            "Cooking alone, badly, with music on",
            "Any hour, honestly — I'd survive the embarrassment",
            "There isn't one, and that's a strange thing to learn",
        ],
        "tags": ["privacy", "self"],
    },
    {
        "question": "Would you rather your children inherit your talents or your temperament?",
        "options": [
            "Talents — the temperament cost me",
            "Temperament — it's what actually got me through",
            "Neither, let them start clean",
            "I'd want them to inherit the doubt, it kept me honest",
        ],
        "tags": ["family", "self"],
    },
    {
        "question": "If you could un-send every message you regret, would you?",
        "options": [
            "Yes, immediately, without reading them again",
            "No — some of them were the only honest thing I said",
            "Only the ones sent after midnight",
            "I'd keep them but make them unreadable to everyone else",
        ],
        "tags": ["regret", "communication"],
    },
    {
        "question": "Would you rather do work you love badly, or work you're excellent at but don't care about?",
        "options": [
            "Love it badly — the caring is the point",
            "Excellent and indifferent — competence is its own peace",
            "I've done both and one of them nearly broke me",
            "Badly, but only if no one depended on the result",
        ],
        "tags": ["work", "meaning"],
    },
    {
        "question": "If you could feel someone else's pain for sixty seconds to finally understand them, would you?",
        "options": [
            "Yes — there's one person I'd choose instantly",
            "No — I'd never be able to unfeel it",
            "Yes, if they could feel mine too",
            "I'd want to, and I think I'd flinch at the last moment",
        ],
        "tags": ["empathy", "hypothetical"],
    },
    {
        "question": "Would you swap the memory of your happiest day for a guarantee of a happier one ahead?",
        "options": [
            "Yes — I'd rather have it in front of me",
            "No — I've been living off that memory",
            "Only if I got to keep knowing it happened",
            "The trade assumes I could tell which day was happiest",
        ],
        "tags": ["memory", "happiness"],
    },
    {
        "question": "If you could keep only ten photographs, would you choose people or places?",
        "options": [
            "People — the places are still there",
            "Places — I remember faces better than rooms",
            "The accidental ones, blurred, with someone half in frame",
            "I'd choose ten I've never looked at closely",
        ],
        "tags": ["memory", "photography"],
    },
    {
        "question": "Would you take a pill that removed your fear of death, knowing it also removed your urgency?",
        "options": [
            "Yes — the fear has shaped too much",
            "No — the urgency is the only reason I finish anything",
            "Only in the last year of my life",
            "I'd want to try it for a week and then decide",
        ],
        "tags": ["mortality", "hypothetical"],
    },
    {
        "question": "If a stranger described you accurately in one sentence, would you want to hear it?",
        "options": [
            "Yes — I've wondered my whole life",
            "No — accurate isn't the same as kind",
            "Only from a stranger, never from someone who knows me",
            "I'd hear it and then argue with it for a year",
        ],
        "tags": ["self", "perception"],
    },
    {
        "question": "Would you give up music forever to keep every other sense sharp into old age?",
        "options": [
            "Yes — sight and taste outrank it",
            "No — music is how I've processed everything",
            "Only if I could keep the songs already in my head",
            "This is the cruellest question I've been asked today",
        ],
        "tags": ["senses", "music"],
    },
    {
        "question": "If your future self appeared and seemed disappointed, would you ask why?",
        "options": [
            "Yes — better to know now",
            "No — I'd assume they'd forgotten how hard this part was",
            "I'd ask what they'd have done instead",
            "I'd notice they came back at all, and take that as good news",
        ],
        "tags": ["self", "time"],
    },
    {
        "question": "Would you rather know every lie ever told to you, or never learn a single one?",
        "options": [
            "Every one — I'd rather see clearly",
            "None — most of them were load-bearing",
            "Only the ones still being told",
            "Knowing would turn every kindness into a question",
        ],
        "tags": ["truth", "relationships"],
    },
    {
        "question": "If you had to delete one app from the world permanently, which one goes?",
        "options": [
            "The one I opened before this one",
            "Something I don't use but everyone else does",
            "Email — and I'd take the consequences",
            "None; I'd delete the notifications instead",
        ],
        "tags": ["technology", "attention"],
    },
    {
        "question": "Would you want a transcript of everything you said last year?",
        "options": [
            "Yes — I'd learn something uncomfortable and useful",
            "No — I'd read it once and never speak again",
            "Only the parts where I was listening",
            "I'd want it for one specific conversation",
        ],
        "tags": ["memory", "self"],
    },
    {
        "question": "If doing nothing were rewarded the way being busy is, would you be good at it?",
        "options": [
            "Yes — I've been waiting for permission",
            "No — I'd invent a project within a week",
            "I'd be good at it and feel guilty the whole time",
            "I don't know what I'd do with my hands",
        ],
        "tags": ["rest", "attention"],
    },
]

QUIET_CONTRADICTION = [
    {
        "statement1": "A second is defined by 9,192,631,770 oscillations of a caesium-133 atom — the most precisely measured quantity in all of science.",
        "statement2": "You have never once experienced a second as the same length twice.",
        "tags": ["time", "perception"],
    },
    {
        "statement1": "Any two humans are about 99.9% identical in their DNA.",
        "statement2": "No one has ever met anyone quite like you, and no one ever will.",
        "tags": ["biology", "identity"],
    },
    {
        # Deliberately not "every atom came from a star" — the hydrogen didn't.
        # It is primordial, from the first minutes after the Big Bang, which
        # makes the true version older and stranger than the popular one.
        "statement1": "The oxygen and carbon in you were forged inside stars that exploded before the Sun existed. The hydrogen is older still — it has been here since the universe's first few minutes.",
        "statement2": "You are, in every way that matters to you, temporary.",
        "tags": ["cosmos", "mortality"],
    },
    {
        "statement1": "You cannot tickle yourself — your brain predicts the sensation and cancels it before you feel it.",
        "statement2": "You are constantly surprised by your own thoughts, which come from the same brain.",
        "tags": ["mind", "body"],
    },
]

ALMOST_NOTHING = [
    {
        "text": "Your jaw is probably clenched.\nIt has been for a while.",
        "rarity": "uncommon",
        "tags": [],
    },
    {
        "text": "When did you last drink water?\nNot coffee. Not tea. Water.",
        "rarity": "uncommon",
        "tags": [],
    },
    {
        "text": "Look at something far away for a moment.\nYour eyes have been at arm's length for hours.",
        "rarity": "uncommon",
        "tags": [],
    },
    {
        "text": "Both feet on the floor.\nYou've been sitting on one of them, haven't you?",
        "rarity": "uncommon",
        "tags": [],
    },
    {
        "text": "You're holding your breath slightly.\nMost people do while reading.",
        "rarity": "uncommon",
        "tags": [],
    },
    {
        "text": "Your shoulders are somewhere near your ears.\nThey don't need to be up there.",
        "rarity": "uncommon",
        "tags": [],
    },
]

BATCHES = [
    ("ponder_content", "ponder", "question", PONDER),
    ("quiet_contradiction_content", "quiet_contradiction", "statement1", QUIET_CONTRADICTION),
    ("almost_nothing_content", "almost_nothing", "text", ALMOST_NOTHING),
]


async def populate():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    try:
        for collection_name, content_type, dedupe_field, items in BATCHES:
            keys = [item[dedupe_field] for item in items]
            # Insert-only: clear just these rows so a re-run edits in place and
            # leaves everything seeded elsewhere untouched.
            removed = await db[collection_name].delete_many({dedupe_field: {"$in": keys}})
            for data in items:
                await db[collection_name].insert_one({
                    **data,
                    "id": str(uuid.uuid4()),
                    "type": content_type,
                    "rarity": data.get("rarity", "common"),
                    "tags": data.get("tags", []),
                    "created_at": datetime.utcnow(),
                })
            total = await db[collection_name].count_documents({})
            print(f"  {collection_name:30s} +{len(items):3d} new "
                  f"(replaced {removed.deleted_count}) -> {total} total")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(populate())
