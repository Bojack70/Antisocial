"""
Seventh seed batch: the last 18 cards, closing the measured gap to a clean
nine repeat-free days.

Sizing came from simulation, not arithmetic: after the sixth batch, a ten-day
run (2 sessions/day x 12 cards, marking only what a session shows) put the
remaining shortfall at mini_game -10 and fast_weird -8. This batch is exactly
that, and mini_game is capped at 10 new cards per the user's instruction.

The ten quiz cards carry no new research risk by construction: every one
restates a claim already verified for another card in this session. Four of
them deliberately target myths the feed debunks elsewhere — aircraft lift,
Swiss cheese holes, the Hundred Years' War, and the order of email vs the
mobile phone — so a reader who met the explainer gets the reward of knowing.

The eight fast_weird cards were verified 2026-08-27. Three of them are myth
corrections rather than trivia, which suits this feed better than the myth
would have: Napoleon was not short, the Great Wall is not visible from orbit,
and Manhattan was not bought for $24.
"""
import asyncio
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

FAST_WEIRD = [
    {
        "headline": "The oldest written complaint on Earth is about a bad copper delivery",
        "facts": [
            "It was pressed into clay in Ur, in what is now southern Iraq, around 1750 BC.",
            "A customer named Nanni is furious with a merchant, Ea-nasir, over inferior copper ore and the way his messenger was treated.",
            "The tone suggests this was not their first argument. Four thousand years later, the tablet survives, and Ea-nasir is internationally known solely for having provided bad service.",
        ],
        "tags": ["history", "language"],
    },
    {
        "headline": "The Guinness Book of Records exists because two men argued in a pub and couldn't settle it",
        "facts": [
            "Sir Hugh Beaver, running the Guinness Brewery, was at a shooting party in County Wexford when the group fell out over Europe's fastest game bird.",
            "No reference book on hand could answer it, and he realised the same argument must be happening in every pub in Ireland.",
            "He commissioned the twins Norris and Ross McWhirter, and the first edition appeared in 1955. The original question's answer is the red-breasted merganser, at about 130 km/h.",
        ],
        "tags": ["history", "books"],
    },
    {
        "headline": "In 18th-century England you could rent a pineapple for the evening",
        "facts": [
            "Growing one in that climate took years and enormous expense; a single fruit could cost the equivalent of thousands today.",
            "So they were hired out for parties, carried under the arm, displayed as the centrepiece — and pointedly not eaten.",
            "The same pineapple would go back to the shop and out again to the next host, doing the rounds until it finally rotted.",
        ],
        "tags": ["history", "food"],
    },
    {
        "headline": "The United States bought Alaska for about two cents an acre, and was mocked for it",
        "facts": [
            "Congress approved the $7.2 million purchase from Russia in 1867.",
            "The press called it Seward's Folly and Seward's Icebox, after the Secretary of State who pushed it through.",
            "It works out at roughly two cents per acre. The gold, oil and strategic position arrived later, by which point nobody was calling it a folly.",
        ],
        "tags": ["history", "money"],
    },
    {
        "headline": "Napoleon was not short — an inch changed length",
        "facts": [
            "His height was recorded in French inches, which were about 2.71 cm, not the 2.54 cm inch used now.",
            "Converted properly he stood around 5 foot 6 or 7 — perfectly ordinary, and slightly above average for a Frenchman of his day.",
            "The short-tempered little man is largely the invention of British cartoonist James Gillray. Napoleon said Gillray had done more to bring him down than all the armies of Europe.",
        ],
        "tags": ["history", "myths"],
    },
    {
        "headline": "Saturn is less dense than water",
        "facts": [
            "Its average density is about 0.7 grams per cubic centimetre; water is 1.0.",
            "The planet is overwhelmingly hydrogen and helium, and enormous — which spreads not very much mass across a great deal of volume.",
            "The bathtub image is a comparison, not a plan. Assemble enough water to float Saturn and its own gravity would crush the tub, the water and the joke together.",
        ],
        "tags": ["space", "physics"],
    },
    {
        "headline": "You cannot see the Great Wall of China from space",
        "facts": [
            "It is thousands of kilometres long but only metres wide, and made of the same material as the ground beside it.",
            "NASA says it is not visible to the naked eye from orbit. China's first astronaut, Yang Liwei, looked for it in 2003 and reported he could not see it either.",
            "The claim predates spaceflight entirely — a version appears in a Ripley's cartoon in 1932, decades before anyone could go and check.",
        ],
        "tags": ["space", "myths"],
    },
    {
        "headline": "Manhattan was not bought for $24",
        "facts": [
            "The 1626 transaction was recorded as 60 guilders — worth over a thousand dollars in today's money, not twenty-four.",
            "The $24 figure comes from a history book published in 1846 and has been copied ever since without anyone rechecking it.",
            "There is a deeper problem with the story: the Lenape appear to have understood the agreement as temporary shared use, closer to a lease, with the goods a ceremonial gift sealing it. Two parties signed entirely different deals.",
        ],
        "tags": ["history", "myths"],
    },
]

# Every prompt restates a claim verified elsewhere in this session's batches.
MINI_GAME = [
    {"prompt": "A day on Venus lasts longer than a year on Venus.",
     "correct_answer": "Fact", "tags": ["space"]},
    {"prompt": "The Hundred Years' War lasted exactly one hundred years.",
     "correct_answer": "Fiction", "tags": ["history"]},
    {"prompt": "Sudan has more ancient pyramids than Egypt does.",
     "correct_answer": "Fact", "tags": ["history"]},
    {"prompt": "The first mobile phone call was made before the first email was sent.",
     "correct_answer": "Fiction", "tags": ["technology"]},
    {"prompt": "Bubble wrap was originally invented to be sold as wallpaper.",
     "correct_answer": "Fact", "tags": ["invention"]},
    {"prompt": "Planes fly because air going over the top of the wing has further to travel, so it speeds up to meet the air underneath at the back.",
     "correct_answer": "Fiction", "tags": ["physics", "myths"]},
    {"prompt": "Pluto has completed a full orbit of the Sun since astronomers discovered it.",
     "correct_answer": "Fiction", "tags": ["space"]},
    {"prompt": "The United States once made it illegal to sell sliced bread.",
     "correct_answer": "Fact", "tags": ["history"]},
    {"prompt": "The holes in Swiss cheese are made by mice.",
     "correct_answer": "Fiction", "tags": ["food", "myths"]},
    {"prompt": "Marie Curie's notebooks are still too radioactive to handle safely.",
     "correct_answer": "Fact", "tags": ["science"]},
]

assert len(MINI_GAME) <= 10, "mini_game is capped at 10 new cards"


async def populate():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    try:
        headlines = [i["headline"] for i in FAST_WEIRD]
        removed = await db.fast_weird_content.delete_many({"headline": {"$in": headlines}})
        for data in FAST_WEIRD:
            await db.fast_weird_content.insert_one({
                **data,
                "id": str(uuid.uuid4()),
                "type": "fast_weird",
                "rarity": data.get("rarity", "common"),
                "tags": data.get("tags", []),
                "created_at": datetime.utcnow(),
            })
        total = await db.fast_weird_content.count_documents({})
        print(f"  fast_weird_content   +{len(FAST_WEIRD):3d} (replaced {removed.deleted_count}) -> {total}")

        prompts = [g["prompt"] for g in MINI_GAME]
        removed = await db.mini_game_content.delete_many({"prompt": {"$in": prompts}})
        for data in MINI_GAME:
            await db.mini_game_content.insert_one({
                **data,
                "id": str(uuid.uuid4()),
                "type": "mini_game",
                "game_type": "fact_vs_fiction",
                "options": ["Fact", "Fiction"],
                "rarity": data.get("rarity", "common"),
                "tags": data.get("tags", []),
                "created_at": datetime.utcnow(),
            })
        total = await db.mini_game_content.count_documents({})
        print(f"  mini_game_content    +{len(MINI_GAME):3d} (replaced {removed.deleted_count}) -> {total}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(populate())
