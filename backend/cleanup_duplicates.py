"""
Removes seven duplicated facts and one off-brand video.

Why this exists: the 2026-08-27 fast_weird batches were written without first
reading the 14 headlines already seeded, so seven facts got told twice in
different words — Cleopatra, sharks, Nintendo, the Anglo-Zanzibar war, the
last guillotine, Venus, and the chess/atoms comparison.

This matters more than ordinary duplication because the no-repeat ledger
dedupes by **id, not by meaning**. Two cards carrying the same fact are two
different ids, so a reader would have been shown the same thing twice inside
the window the ledger exists to protect. The audit that catches this is
"read what's already in the collection before writing new rows" — it was run
for incident hooks and skipped for fast_weird.

Which copy survives: the newer one in each pair, because they carry the
specifics the content bar asks for (named people, exact dates, real figures)
and were verified against live sources. Two of the retired cards had further
problems — the old shark card's middle fact is garbled ("350 million years
later in the fossil record's terms"), and its claim about Saturn's rings is
genuinely contested.

Also drops one video: a US election explainer. The content bar rules out
politics, and a feed meant to be calm should not open on an election result.
"""
import asyncio
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# Retired headline -> the card that says the same thing better.
RETIRE_FAST_WEIRD = {
    "Cleopatra lived closer to the Moon landing than to the Great Pyramid":
        "Cleopatra lived closer to the Moon landing than to the building of the Great Pyramid",
    "Sharks are older than trees":
        "Sharks are older than the dinosaurs, and outlasted them",
    "Nintendo was founded in 1889":
        "Nintendo was founded in 1889, and its first product was a hand-painted playing card",
    "The shortest war in history lasted under 40 minutes":
        "The shortest war in history was over in 38 minutes",
    "France was still executing people by guillotine when Star Wars premiered":
        "France was still beheading people by guillotine in 1977",
    "Venus spins backwards, and its day is longer than its year":
        "A day on Venus is longer than a year on Venus",
    "There are more possible chess games than atoms in the universe":
        "There are more possible chess games than atoms in the observable universe",
}

RETIRE_VIDEO_TITLES = [
    "How Donald Trump Won. Breaking Down The Votes - sciBRIGHT Politics",
]

# Same mistake, same fix, in two more collections. Here the newer explainers win
# on the same grounds — they carry a fourth step that lands a consequence rather
# than restating the mechanism.
RETIRE_EXPLAINER = {
    "How does a lock and key actually work?": "How does a key open a lock?",
    "How does a microwave heat food but not the plate?":
        "Why does a microwave heat the food but not the plate?",
    "How do noise-cancelling headphones work?":
        "How do noise-cancelling headphones erase an aeroplane?",
}

# The one case where the ORIGINAL is better and mine goes: "Give them a horizon"
# is a closing line, and the replacement I wrote was just an observation.
RETIRE_ALMOST_NOTHING = {
    "Look at something far away for a moment.\nYour eyes have been at arm's length for hours.":
        "Look at something far away.\nYour eyes have been focused up close for hours. Give them a horizon.",
}


async def cleanup():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    try:
        removed = 0
        for old, keeper in RETIRE_FAST_WEIRD.items():
            # Never delete a card unless the one replacing it is actually present.
            if not await db.fast_weird_content.find_one({"headline": keeper}):
                print(f"  SKIP (keeper missing): {old[:60]}")
                continue
            res = await db.fast_weird_content.delete_many({"headline": old})
            removed += res.deleted_count
        total = await db.fast_weird_content.count_documents({})
        print(f"  fast_weird: retired {removed} duplicates -> {total} unique")

        for coll, field, mapping in (
            ("explainer_content", "question", RETIRE_EXPLAINER),
            ("almost_nothing_content", "text", RETIRE_ALMOST_NOTHING),
        ):
            removed = 0
            for old, keeper in mapping.items():
                if not await db[coll].find_one({field: keeper}):
                    print(f"  SKIP (keeper missing): {old[:50]}")
                    continue
                res = await db[coll].delete_many({field: old})
                removed += res.deleted_count
            total = await db[coll].count_documents({})
            print(f"  {coll.replace('_content',''):16s}: retired {removed} duplicates -> {total} unique")

        res = await db.video_content.delete_many({"title": {"$in": RETIRE_VIDEO_TITLES}})
        vtotal = await db.video_content.count_documents({})
        print(f"  video: removed {res.deleted_count} off-brand -> {vtotal}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(cleanup())
