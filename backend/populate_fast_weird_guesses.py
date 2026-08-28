"""
Guess-before-reveal backfill for fast_weird cards (session-depth spec, item 1).

Adds an optional `guess` field — prompt, 3 tappable options, answer — to the
cards whose facts contain a specific figure the headline does not give away.
The card hides its facts until the reader commits to a range; committing is
what makes the fact stick.

Authoring rules this set follows:

1. **The answer already lives in the card.** Every answer is drawn verbatim
   from the card's own facts, which were verified when the card shipped.
   Nothing here introduces a new claim.
2. **The headline must not answer the prompt.** Cards whose headline contains
   the number ("...was over in 38 minutes") either ask about a different
   figure from the facts or get no guess at all.
3. **Wrong options have to be genuinely tempting.** Each distractor is the
   answer a reasonable person might give — the plutonium half-life next to
   radium's, the modest tree count next to the absurd real one.

Cards without a strong figure (microwave, Velcro, Play-Doh — the story
cards) are deliberately left alone; a bolted-on guess would be quiz filler.

Idempotent: keyed by exact headline (ids are NOT stable across databases —
local was re-seeded after the 2026-08-27 Atlas migration, so 16 of these 19
cards carry different UUIDs in prod). $set only, so re-running just rewrites
the same values. Run with the venv python against MONGO_URL.
"""
import asyncio
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

GUESSES = {
    # There are more trees on Earth than stars in the Milky Way
    "There are more trees on Earth than stars in the Milky Way": {
        "prompt": "A 2015 study actually counted them. Roughly how many trees is that?",
        "options": ["3 billion", "300 billion", "3 trillion"],
        "answer": "3 trillion",
    },
    # Woolly mammoths were still alive when the Great Pyramid was built
    "Woolly mammoths were still alive when the Great Pyramid was built": {
        "prompt": "The last mammoths died out roughly how long ago?",
        "options": ["40,000 years ago", "12,000 years ago", "4,000 years ago"],
        "answer": "4,000 years ago",
    },
    # The world's shortest scheduled flight lasts about 90 seconds
    "The world's shortest scheduled flight lasts about 90 seconds": {
        "prompt": "With a good tailwind, the record for the full flight is —",
        "options": ["Under a minute", "About 75 seconds", "Just under the scheduled 90"],
        "answer": "Under a minute",
    },
    # The shortest war in history was over in 38 minutes
    "The shortest war in history was over in 38 minutes": {
        "prompt": "Around 2,800 defenders were in the palace. How many were killed or wounded before it ended?",
        "options": ["About 50", "About 500", "Over 1,500"],
        "answer": "About 500",
    },
    # Pluto has not finished a single lap since we found it
    "Pluto has not finished a single lap since we found it": {
        "prompt": "One Pluto year takes how many Earth years?",
        "options": ["25", "96", "248"],
        "answer": "248",
    },
    # A day on Venus is longer than a year on Venus
    "A day on Venus is longer than a year on Venus": {
        "prompt": "One full rotation of Venus takes about how many Earth days?",
        "options": ["10", "100", "243"],
        "answer": "243",
    },
    # The country with the most pyramids is not Egypt
    "The country with the most pyramids is not Egypt": {
        "prompt": "Which country has the most?",
        "options": ["Sudan", "Mexico", "Peru"],
        "answer": "Sudan",
    },
    # The Eiffel Tower is taller in summer than in winter
    "The Eiffel Tower is taller in summer than in winter": {
        "prompt": "How much height does it gain on the hottest days?",
        "options": ["About a centimetre", "12 to 15 centimetres", "Nearly a metre"],
        "answer": "12 to 15 centimetres",
    },
    # The United States bought Alaska for about two cents an acre
    "The United States bought Alaska for about two cents an acre, and was mocked for it": {
        "prompt": "What did the whole territory cost in 1867?",
        "options": ["$720,000", "$7.2 million", "$72 million"],
        "answer": "$7.2 million",
    },
    # Manhattan was not bought for $24
    "Manhattan was not bought for $24": {
        "prompt": "The recorded price was 60 guilders. In today's money, that is —",
        "options": ["Around $200", "Over $1,000", "About $1 million"],
        "answer": "Over $1,000",
    },
    # There are more possible chess games than atoms in the observable universe
    "There are more possible chess games than atoms in the observable universe": {
        "prompt": "How much bigger is the number of chess games?",
        "options": ["About 40 times", "A million times", "10^40 times"],
        "answer": "10^40 times",
    },
    # Marie Curie's notebooks are still too radioactive to handle
    "Marie Curie's notebooks are still too radioactive to handle": {
        "prompt": "The radium in them has a half-life of —",
        "options": ["16 years", "1,600 years", "24,000 years"],
        "answer": "1,600 years",
    },
    # The Slinky was a failed attempt to stop naval instruments shaking
    "The Slinky was a failed attempt to stop naval instruments shaking": {
        "prompt": "How much wire coils into one Slinky?",
        "options": ["8 feet", "30 feet", "80 feet"],
        "answer": "80 feet",
    },
    # Everest is taller than when it was first measured, and still rising
    "Everest is taller than when it was first measured, and still rising": {
        "prompt": "How fast is the summit rising?",
        "options": ["4 millimetres a year", "4 centimetres a year", "Half a metre a year"],
        "answer": "4 millimetres a year",
    },
    # The Guinness Book of Records exists because two men argued in a pub
    "The Guinness Book of Records exists because two men argued in a pub and couldn't settle it": {
        "prompt": "Europe's fastest game bird — the argument that started the book — flies at about —",
        "options": ["70 km/h", "130 km/h", "210 km/h"],
        "answer": "130 km/h",
    },
    # The oldest written complaint on Earth is about a bad copper delivery
    "The oldest written complaint on Earth is about a bad copper delivery": {
        "prompt": "How old is the complaint?",
        "options": ["About 1,200 years", "About 2,300 years", "Nearly 4,000 years"],
        "answer": "Nearly 4,000 years",
    },
    # The United States banned sliced bread in 1943
    "The United States banned sliced bread in 1943": {
        "prompt": "How long did the ban survive?",
        "options": ["Less than two months", "Just over a year", "Until the war ended"],
        "answer": "Less than two months",
    },
    # Napoleon was not short — an inch changed length
    "Napoleon was not short — an inch changed length": {
        "prompt": "Converted to modern units, how tall did he stand?",
        "options": ["About 5 foot 2", "About 5 foot 6", "About 6 foot"],
        "answer": "About 5 foot 6",
    },
    # Sharks are older than the dinosaurs, and outlasted them
    "Sharks are older than the dinosaurs, and outlasted them": {
        "prompt": "How long have sharks been around?",
        "options": ["150 million years", "250 million years", "450 million years"],
        "answer": "450 million years",
    },
}


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ.get("DB_NAME", "antisocial_db")]

    set_count = 0
    for headline, guess in GUESSES.items():
        assert guess["answer"] in guess["options"], f"{headline[:30]}: answer not in options"
        result = await db.fast_weird_content.update_one(
            {"headline": headline}, {"$set": {"guess": guess}}
        )
        if result.matched_count == 0:
            print(f"MISSING  {headline[:60]}")
            continue
        set_count += 1
        print(f"set      {headline[:60]}")

    total = await db.fast_weird_content.count_documents({})
    with_guess = await db.fast_weird_content.count_documents(
        {"guess": {"$exists": True}}
    )
    print(f"\n{set_count} written this run; {with_guess}/{total} fast_weird cards now carry a guess")


if __name__ == "__main__":
    asyncio.run(main())
