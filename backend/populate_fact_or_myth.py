"""
Fact or Myth — the quiz card, rebuilt.

Replaces the ten quiz cards from the previous batch, which restated claims
already used by fast_weird / explainer / incident cards. Guessing a card you
read forty minutes ago is not a game. Everything here is original to this card
type and appears nowhere else in the feed.

Three rules this set is built on:

1. **The answer must not be obvious.** Every card is either something most
   people are confident is true and isn't, or something that sounds invented
   and is documented. "The holes in Swiss cheese are made by mice" — the kind
   of card that was in the last batch — gives itself away.
2. **The answer must not be predictable.** 11 of 18 are Myth and 7 are Fact.
   If every card resolved to Myth the game would be won by pattern, not
   thought.
3. **Every card carries a `reveal`.** Being told you were wrong is worth
   nothing on its own; the "oh" comes from finding out where the belief came
   from — a Wagner opera, a wartime radar cover story, a mistranslated German
   paper from 1901. The reveal is the card, the question is just the setup.

All 18 verified against live sources 2026-08-27.
"""
import asyncio
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# Believed true by most people. Isn't.
MYTHS = [
    {
        "prompt": "Different parts of your tongue detect different tastes, sweet at the tip, bitter at the back.",
        "reveal": "The whole tongue detects all five tastes more or less equally. The map comes from a German paper of 1901 that found tiny differences in sensitivity; a textbook illustrator turned those into hard zones, and the diagram outlived the evidence by a century.",
        "tags": ["body", "science"],
    },
    {
        "prompt": "Vikings wore helmets with horns on them.",
        "reveal": "No horned helmet has ever been found in a Viking grave. They arrived in 1876, in the costumes Carl Emil Doepler designed for Wagner's Ring cycle. Within 25 years the invention had attached itself permanently to a people who died a thousand years earlier.",
        "tags": ["history"],
    },
    {
        "prompt": "Eating carrots improves your night vision.",
        "reveal": "It was wartime misdirection. Britain had radar and needed to explain how its pilots were finding German bombers in the dark, so it briefed the press that they were eating a lot of carrots. Vitamin A can reverse night blindness caused by deficiency, but it will not sharpen eyes that already work.",
        "tags": ["food", "history"],
    },
    {
        "prompt": "You have to wait 24 hours before you can report someone missing.",
        "reveal": "There is no such rule anywhere, no law, no policy, no state. It came from television, where the delay was a convenient way to build tension. It is the rare myth that does real damage: the first hours are the ones that matter most.",
        "tags": ["life", "myths"],
    },
    {
        "prompt": "Sugar makes children hyperactive.",
        "reveal": "A meta-analysis of 23 controlled trials found no effect on behaviour at all. A separate study told mothers their children had been given sugar when they hadn't, those mothers rated their children as noticeably more hyperactive, and were observed hovering and correcting them more. The effect is real. It is just happening in the adult.",
        "tags": ["body", "science"],
    },
    {
        "prompt": "Humans have five senses.",
        "reveal": "Nowhere near. Alongside the famous five you run proprioception (where your limbs are without looking), balance, temperature, pain, hunger, thirst and your sense of elapsed time. Touching your nose with your eyes shut uses a sense Aristotle never listed.",
        "tags": ["body", "science"],
    },
    {
        "prompt": "Your blood is blue inside your body and turns red when it hits the air.",
        "reveal": "It is never blue. Oxygen-rich blood is bright red, oxygen-poor blood is dark red, and that is the whole range. Veins look blue because of how skin scatters light before it reaches them. The illusion is in the tissue on top, not the liquid underneath.",
        "tags": ["body", "science"],
    },
    {
        "prompt": "Bats are blind.",
        "reveal": "Not one of the 1,000-plus bat species is blind. Several see better than we do in low light, some see ultraviolet, and many fruit bats don't echolocate at all. Given the choice, plenty of bats hunt by eye.",
        "tags": ["animals"],
    },
    {
        "prompt": "The Sahara is the largest desert on Earth.",
        "reveal": "Antarctica is, and by a wide margin, roughly twice the Sahara. A desert is defined by how little falls from the sky, not by heat or sand. Parts of the Antarctic interior have had no meaningful precipitation for something like two million years.",
        "tags": ["earth", "geography"],
    },
    {
        "prompt": "Chameleons change colour to blend into their surroundings.",
        "reveal": "They mostly change colour to talk and to manage heat, signalling mood, dominance, and readiness to mate. The most dramatic colour shifts a chameleon produces are the ones that make it far more visible, not less.",
        "tags": ["animals"],
    },
    {
        "prompt": "Lightning never strikes the same place twice.",
        "reveal": "The Empire State Building is hit around 25 times a year. Tall, sharp, well-earthed things get struck repeatedly and predictably, which is exactly why lightning rods work.",
        "tags": ["weather", "myths"],
    },
]

# Sounds invented. Documented.
FACTS = [
    {
        "prompt": "Octopus blood is blue.",
        "reveal": "It carries oxygen with hemocyanin, which is built around copper rather than the iron in our haemoglobin, and copper-based blood runs blue. It works better than ours in cold, low-oxygen water, which is where they live.",
        "tags": ["animals", "chemistry"],
    },
    {
        "prompt": "Butterflies taste with their feet.",
        "reveal": "They have chemical receptors on their feet, and a female uses them before laying, standing on a leaf to check it is the right plant and not poisonous for caterpillars that haven't hatched yet.",
        "tags": ["animals", "senses"],
    },
    {
        "prompt": "A banana is a berry. A strawberry is not.",
        "reveal": "Botanically a berry grows from one flower with a single ovary, which the banana does and the strawberry doesn't. A strawberry forms from many ovaries in one flower, and the things everyone calls its seeds are the actual fruit.",
        "tags": ["food", "biology"],
    },
    {
        "prompt": "The Moon is slowly moving away from Earth.",
        "reveal": "About 3.8 centimetres a year, driven by the tides it raises in our oceans. It is stealing orbital energy from our spin as it goes, so Earth's day is lengthening by roughly 1.7 milliseconds a century.",
        "tags": ["space"],
    },
    {
        "prompt": "Scotland's national animal is the unicorn.",
        "reveal": "Officially, and since the 1300s. Two unicorns supported the Scottish coat of arms until James VI became James I of England and swapped one out for the English lion. The unicorn on the royal arms is chained, a mythical beast considered too dangerous to leave loose.",
        "tags": ["history"],
    },
    {
        "prompt": "A sloth can hold its breath longer than a dolphin can.",
        "reveal": "Around 40 minutes, against roughly 10 to 15 for a dolphin. A sloth can drop its heart rate to a third of normal, which is the same trick that makes it slow on land, the animal built for hanging in a tree beats the one built for the sea.",
        "tags": ["animals"],
    },
    {
        "prompt": "Sea otters hold hands while they sleep.",
        "reveal": "They sleep floating on their backs, and even gentle currents would separate them, so they link paws in groups called rafts. A typical raft is around 50 otters; more than 200 have been seen together off Monterey.",
        "tags": ["animals"],
    },
]


# The four Fact-or-Myth cards that predate this rebuild had no reveal, so they
# would have scored the reader and said nothing. Backfilled here rather than
# rewritten — the questions were already good, they were just missing the payoff.
LEGACY_REVEALS = {
    "Glass is technically a slow-moving liquid, even at room temperature.":
        "Glass is an amorphous solid and does not flow. Old cathedral windows are thicker at the bottom because of how panes were spun and blown before modern manufacturing, and because builders sensibly installed the heavy edge downwards.",
    "Goldfish have a memory span of only a few seconds.":
        "Their memories run to months. Researchers at the University of Michigan showed in 1966 that goldfish got steadily better at avoiding a shock across trials spread over days. They were learning, and remembering that they had learned.",
    "Humans only use 10 percent of their brains.":
        "Brain imaging finds essentially all of it in use, most of the time. The claim seems to have grown out of 1890s Harvard theories about untapped 'reserve energy', a point about unrealised potential that got mangled into an anatomical fact.",
    "Bulls become aggressive specifically because of the color red.":
        "Bulls are red-green colour blind, so the cape barely registers as red at all. What provokes the charge is the movement. The colour is tradition, and it hides the blood.",
}


def build():
    rows = []
    for m in MYTHS:
        rows.append({**m, "correct_answer": "Myth"})
    for f in FACTS:
        rows.append({**f, "correct_answer": "Fact"})
    return rows


ALL = build()
assert sum(1 for r in ALL if r["correct_answer"] == "Fact") >= 6, \
    "needs enough Fact answers that the game can't be won by always guessing Myth"


async def populate():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    try:
        # Retire the derived quiz cards from the previous batch — each restated
        # a claim already told by another card in the feed.
        derived = [
            "A day on Venus lasts longer than a year on Venus.",
            "The Hundred Years' War lasted exactly one hundred years.",
            "Sudan has more ancient pyramids than Egypt does.",
            "The first mobile phone call was made before the first email was sent.",
            "Bubble wrap was originally invented to be sold as wallpaper.",
            "Planes fly because air going over the top of the wing has further to travel, so it speeds up to meet the air underneath at the back.",
            "Pluto has completed a full orbit of the Sun since astronomers discovered it.",
            "The United States once made it illegal to sell sliced bread.",
            "The holes in Swiss cheese are made by mice.",
            "Marie Curie's notebooks are still too radioactive to handle safely.",
        ]
        gone = await db.mini_game_content.delete_many({"prompt": {"$in": derived}})
        print(f"  retired {gone.deleted_count} derived quiz cards")

        # "Fiction" -> "Myth" on everything that predates this card type, so the
        # older cards match the new label instead of offering a stale option.
        migrated = 0
        async for doc in db.mini_game_content.find({"game_type": "fact_vs_fiction"}):
            opts = ["Myth" if o == "Fiction" else o for o in doc.get("options", [])]
            ans = "Myth" if doc.get("correct_answer") == "Fiction" else doc.get("correct_answer")
            if opts != doc.get("options") or ans != doc.get("correct_answer"):
                await db.mini_game_content.update_one(
                    {"_id": doc["_id"]}, {"$set": {"options": opts, "correct_answer": ans}}
                )
                migrated += 1
        print(f"  migrated {migrated} existing cards from Fiction to Myth")

        backfilled = 0
        for prompt, reveal in LEGACY_REVEALS.items():
            res = await db.mini_game_content.update_many(
                {"prompt": prompt}, {"$set": {"reveal": reveal}}
            )
            backfilled += res.modified_count
        print(f"  backfilled reveals on {backfilled} legacy cards")

        prompts = [r["prompt"] for r in ALL]
        removed = await db.mini_game_content.delete_many({"prompt": {"$in": prompts}})
        for data in ALL:
            await db.mini_game_content.insert_one({
                **data,
                "id": str(uuid.uuid4()),
                "type": "mini_game",
                "game_type": "fact_vs_fiction",
                "options": ["Fact", "Myth"],
                "rarity": data.get("rarity", "common"),
                "tags": data.get("tags", []),
                "created_at": datetime.utcnow(),
            })
        total = await db.mini_game_content.count_documents({})
        n_fact = sum(1 for r in ALL if r["correct_answer"] == "Fact")
        print(f"  added {len(ALL)} Fact-or-Myth cards "
              f"({n_fact} Fact / {len(ALL) - n_fact} Myth, replaced {removed.deleted_count})"
              f" -> {total} mini_game total")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(populate())
