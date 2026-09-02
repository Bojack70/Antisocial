"""
Illusions — the guess card that renders its own proof.

Unlike every other visual card in the app, these need no licence, no
click-verify and no image host: the figures are geometry drawn by
`frontend/components/IllusionCard.tsx`, so a row here is a question, three
options, and which renderer to use. That is why this pool can grow when
look_closer cannot.

Rules the batch follows:

1. **Phone-survivable only.** The renderer must hold up on a 6-inch screen at
   arm's length, in whatever brightness the reader happens to have. GEOMETRIC
   illusions qualify — length, size, straightness, parallelism — because they
   survive any scale and any contrast. DELIBERATELY EXCLUDED, and not to be
   added without a device test: anything depending on absolute size (Delboeuf
   at small scale), on viewing distance, on fine colour or brightness
   calibration (simultaneous contrast, Adelson's checker shadow, White's
   illusion), on peripheral vision holding still (Troxler fading, the
   scintillating grid), or on sustained motion (motion aftereffects, Akiyoshi
   rotating snakes) — the last group also fights the app's no-animation-bait
   posture.

2. **The card must be able to PROVE it.** Every kind here has a reveal that
   removes the context and leaves the truth visible: fins fade, rings vanish,
   rails go, rows snap into column. If a figure can only be asserted, it is a
   fact card, not an illusion card.

3. **No claim before the guess.** The question is asked cold. Copy never says
   "these are the same length" up front — being told kills the guess.

4. **Roughly a quarter carry a real delta.** If the answer is always "they're
   identical", the card teaches you to pick that by the third encounter and
   stops being a guess. `delta` makes the figures genuinely differ, with the
   illusion still wrapped around them, so the honest answer is sometimes
   "the top one" and the reader has to actually look.

5. **Deadpan explanations, and only what is established.** Name the mechanism,
   don't editorialise about it, and don't claim more than perception research
   actually agrees on — several of these have contested explanations, so the
   copy describes what happens rather than settling why.

Idempotent: keyed by `key`, $set on match, insert when missing.
"""
import asyncio
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

ILLUSIONS = [
    {
        "key": "muller_lyer_classic",
        "kind": "muller_lyer",
        "question": "Which line is longer?",
        "options": ["The top one", "The bottom one", "They're identical"],
        "answer": "They're identical",
        "explain": "The fins are the whole trick. Outward fins read as a near corner, "
                   "inward ones as a far corner, and the eye corrects for a depth that "
                   "was never in the picture.",
        "delta": 0,
        "tags": ["perception", "classic"],
    },
    {
        "key": "muller_lyer_honest",
        "kind": "muller_lyer",
        "question": "Which line is longer?",
        "options": ["The top one", "The bottom one", "They're identical"],
        # Rule 4: this one is telling the truth. The bottom line really is longer.
        "answer": "The bottom one",
        "explain": "This time the bottom line really is longer, by about a tenth. "
                   "The fins were pushing you toward it anyway, which is the awkward "
                   "part: the illusion and the answer agreed by accident.",
        "delta": 0.10,
        "tags": ["perception"],
    },
    {
        "key": "ebbinghaus_classic",
        "kind": "ebbinghaus",
        "question": "Which orange circle is bigger?",
        "options": ["The left one", "The right one", "They're the same"],
        "answer": "They're the same",
        "explain": "Size is judged against neighbours, never on its own. Surround a "
                   "thing with small things and it grows.",
        "delta": 0,
        "tags": ["perception", "classic"],
    },
    {
        "key": "ebbinghaus_honest",
        "kind": "ebbinghaus",
        "question": "Which orange circle is bigger?",
        "options": ["The left one", "The right one", "They're the same"],
        # Rule 4: the LEFT circle is genuinely smaller here, and the big
        # surrounding ring makes it look smaller still — so "the right one" is
        # both the illusion's answer and the true one.
        "answer": "The right one",
        "explain": "The right one genuinely is bigger, by about an eighth. Worth "
                   "noticing how little that mattered to your eye compared with what "
                   "was sitting around it.",
        "delta": 0.12,
        "tags": ["perception"],
    },
    {
        "key": "ponzo_classic",
        "kind": "ponzo",
        "question": "Which bar is longer?",
        "options": ["The top bar", "The bottom bar", "They're identical"],
        "answer": "They're identical",
        "explain": "Converging lines read as distance. The upper bar looks further "
                   "away, and anything further away that takes up the same width has "
                   "to be bigger, so the eye makes it bigger.",
        "delta": 0,
        "tags": ["perception", "depth"],
    },
    {
        "key": "vertical_horizontal_classic",
        "kind": "vertical_horizontal",
        "question": "Which stroke is longer?",
        "options": ["The upright", "The base", "They're identical"],
        "answer": "They're identical",
        "explain": "Uprights read longer than flats at equal length. The effect "
                   "survives rotating the page, which is what rules out the simple "
                   "explanations.",
        "delta": 0,
        "tags": ["perception", "classic"],
    },
    {
        "key": "hering_classic",
        "kind": "hering",
        "question": "The two red lines, are they straight?",
        "options": ["They bow outward", "They bow inward", "Both are straight"],
        "answer": "Both are straight",
        "explain": "The fan behind them reads as a vanishing point, and lines crossing "
                   "a vanishing point get bent to fit the depth the eye has decided is "
                   "there. Reported by Ewald Hering in 1861.",
        "delta": 0,
        "tags": ["perception", "classic"],
    },
    {
        "key": "cafe_wall_classic",
        "kind": "cafe_wall",
        "question": "Are the rows of tiles level?",
        "options": ["They slope", "Alternate rows slope", "Every row is level"],
        "answer": "Every row is level",
        "explain": "A café at the bottom of St Michael's Hill in Bristol had a wall "
                   "tiled like this. In 1979 someone in Richard Gregory's lab noticed "
                   "the mortar lines sloping, and the illusion ended up named after the "
                   "café. The half-tile offset does it; the tiles are square.",
        "delta": 0,
        "tags": ["perception", "classic"],
    },
]


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    col = db.illusion_content

    written = 0
    for item in ILLUSIONS:
        doc = dict(item)
        doc["type"] = "illusion"
        existing = await col.find_one({"key": doc["key"]})
        if existing:
            await col.update_one({"key": doc["key"]}, {"$set": doc})
        else:
            import uuid
            from datetime import datetime
            doc["id"] = str(uuid.uuid4())
            doc["created_at"] = datetime.utcnow()
            doc["rarity"] = "common"
            await col.insert_one(doc)
        written += 1

    total = await col.count_documents({})
    deltas = await col.count_documents({"delta": {"$gt": 0}})
    print(f"illusion_content: {written} written, {total} total, {deltas} with a real delta")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
