"""
Try This — the micro-skill card (Wave 2, item 2).

A real thing learnable in two or three minutes, taught step by step, done
with the hands right now. The batch follows five rules:

1. **Solo.** No skill needs a second person — this is Antisocial.
2. **Common objects only.** A coin, a sheet of paper, a pencil, an egg, a
   door frame. Nothing anyone has to go buy.
3. **Doable from the steps alone.** Every skill is a well-documented
   classic whose written steps are sufficient — no video required. Skills
   with high failure rates from text (finger whistling) were cut.
4. **The why is the reveal.** Like Fact-or-Myth's reveal line: doing the
   trick is good, knowing why it works is the part that gets retold.
5. **No comeback hooks.** The card ends when the hands have done it.
   "Practice daily" and "come back tomorrow" language is banned.

Idempotent: keyed by title, $set on match, insert when missing.
"""
import asyncio
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

SKILLS = [
    {
        "title": "Vanish a coin",
        "hook": "The French Drop: the oldest coin vanish there is, and it still works.",
        "needs": "A coin.",
        "steps": [
            "Hold the coin at your left fingertips, palm up, as if offering it for inspection.",
            "Reach over with your right hand (thumb under the coin, fingers over it) exactly as if you were taking it.",
            "As the right fingers close, let the coin quietly drop into your left palm. Close the right hand as though it took the coin.",
            "Watch your right fist as it moves away. Let the left hand, coin inside, fall naturally to your side.",
            "Open the right hand one finger at a time.",
        ],
        "why": "The audience follows your eyes, not the coin. Look at the empty hand as if it were full and everyone else will too.",
        "duration": 180,
        "tags": ["sleight", "classic"],
    },
    {
        "title": "The number that always answers 1089",
        "hook": "A three-digit number walks in; 1089 walks out. Every time.",
        "needs": "Pen and paper, or a patient head.",
        "steps": [
            "Pick any three-digit number whose first and last digits differ by at least two, say 852.",
            "Reverse it: 258. Subtract the smaller from the larger: 852 − 258 = 594.",
            "Reverse that result: 495.",
            "Add the last two numbers: 594 + 495 = 1089. Try a different starting number. It doesn't matter.",
        ],
        "why": "The subtraction always produces a 9 in the middle and outer digits that sum to 9, so the final addition is fixed before you start.",
        "duration": 120,
        "tags": ["numbers", "trick"],
    },
    {
        "title": "Split your thumb",
        "hook": "The uncle trick. Two bent thumbs, one seam, one small horror.",
        "needs": "Your hands and a mirror to rehearse in.",
        "steps": [
            "Bend your left thumb at the knuckle and hold the hand palm-side toward you.",
            "Bend your right thumb the same way and butt the two knuckles together, so the two half-thumbs line up as one thumb.",
            "Lay your right index finger flat across the join to hide the seam.",
            "Slide the right hand away an inch and back again. From two steps away, the tip comes off.",
        ],
        "why": "The index finger covers the seam and the brain completes one continuous thumb, until it slides.",
        "duration": 120,
        "tags": ["illusion", "classic"],
    },
    {
        "title": "Bend a pencil without bending it",
        "hook": "The rubber pencil: solid wood, visibly wobbling like rubber.",
        "needs": "A pencil or pen.",
        "steps": [
            "Hold the pencil loosely near one end, between thumb and index finger.",
            "Keep the grip loose and bounce your whole hand up and down, about twice a second.",
            "Let the pencil seesaw as the hand moves. Watch its middle, not your hand.",
        ],
        "why": "Your eyes hold onto the blurred endpoints while the middle lags, motion blur reads as flex. The pencil never bends; your visual system does.",
        "duration": 60,
        "tags": ["illusion", "physics"],
    },
    {
        "title": "Cut a loop that refuses to become two",
        "hook": "A paper ring with one twist breaks the scissors rule.",
        "needs": "A strip of paper, tape, scissors, a pen.",
        "steps": [
            "Cut a strip of paper a few centimetres wide.",
            "Give one end a half twist, then tape the two ends into a loop.",
            "Draw a line down the middle of the strip without lifting the pen. Keep going. The line comes back to its start having covered 'both' sides.",
            "Cut along the line, all the way round.",
            "One big loop. Not two.",
        ],
        "why": "The half twist turns two sides into one side and two edges into one edge, a Möbius strip. Cutting the middle of one side never separates anything.",
        "duration": 180,
        "tags": ["maths", "paper"],
    },
    {
        "title": "Fold a paper banger",
        "hook": "One sheet of paper, one whipcrack. Reloadable.",
        "needs": "A full sheet of paper, the bigger the better.",
        "steps": [
            "Fold the sheet in half the long way, crease hard, open it flat again.",
            "Fold all four corners in to that centre crease.",
            "Fold in half along the crease, so the folded corners are inside.",
            "Fold point to point to make a centre line, open, then fold both long points down along it to make a triangle. Grip the two loose points at the bottom.",
            "Raise it high and snap it downward, hard, like cracking a whip. The inner fold bursts out with a bang. Tuck it back in to reload.",
        ],
        "why": "The snap forces air into the inner pocket faster than it can leak; the fold blows open and slaps the air, a tiny sonic clap.",
        "duration": 180,
        "tags": ["paper", "physics"],
    },
    {
        "title": "A memory palace for four things",
        "hook": "The two-thousand-year-old memory trick, sized for a shopping list.",
        "steps": [
            "Pick four things to remember, say milk, stamps, batteries, lemons.",
            "In your head, walk the entrance of your home: the door, the shoe rack, the hallway light, the kitchen tap. Four fixed spots, in order.",
            "Put one item at each spot and make it absurd: milk pouring down the door, stamps papering the shoes, the light running on visible batteries, a lemon jammed on the tap.",
            "To recall, walk the route again. The spots hand the items back in order.",
        ],
        "why": "Spatial memory is far older and stronger than list memory, and absurdity is the glue. Orators ran entire speeches through their houses this way.",
        "duration": 180,
        "tags": ["memory", "classic"],
    },
    {
        "title": "The two-breath reset",
        "hook": "The fastest documented way to bring your own pulse down.",
        "steps": [
            "Inhale through the nose. When you feel full, sneak in one more short sip of air on top.",
            "Exhale slowly through the mouth, longer than the whole inhale took.",
            "Do it twice more. Notice the drop.",
        ],
        "why": "The second sip pops open air sacs that had collapsed, and the long exhale slows the heart through the same wiring that makes sighing involuntary. Your body already does this about every five minutes; this is just doing it on purpose.",
        "duration": 60,
        "tags": ["body", "calm"],
    },
    {
        "title": "Measure the daylight with your fingers",
        "hook": "How long until sunset? Your hand knows.",
        "steps": [
            "Stretch one arm out fully toward the sun, no staring at it.",
            "Bend your wrist so your fingers stack horizontally, and count how many finger-widths fit between the sun and the horizon.",
            "Each finger is roughly fifteen minutes. Four fingers, about an hour of light left.",
        ],
        "why": "The sun crosses the sky at a fixed pace about one finger-width at arm's length every quarter hour, for everyone, because arm length and finger width scale together.",
        "duration": 60,
        "tags": ["outdoors", "estimation"],
    },
    {
        "title": "Separate pepper from salt without touching either",
        "hook": "A spoon, a sleeve, and some quiet electrostatics.",
        "needs": "Salt, pepper, a plastic spoon, a wool sleeve or your hair.",
        "steps": [
            "Mix a pinch of salt and a pinch of pepper on a plate.",
            "Rub the plastic spoon on wool or through your hair for twenty seconds.",
            "Hover it an inch above the mix. The pepper leaps up and clings; the salt mostly stays.",
        ],
        "why": "Rubbing charges the spoon, which attracts both, but pepper flakes are far lighter than salt crystals, so only the pepper can make the jump.",
        "duration": 120,
        "tags": ["physics", "kitchen"],
    },
    {
        "title": "Keep a name for once",
        "hook": "You don't forget names. You never store them.",
        "steps": [
            "When you hear a name, say it back within five seconds: 'Good to meet you, Sana.'",
            "Silently attach it to the first concrete thing you notice, Sana, green scarf.",
            "Use the name once more when you part. Three retrievals beats thirty rehearsals.",
        ],
        "why": "Memory keeps what it has to fetch, not what it merely hears, retrieval is the storage mechanism. The scarf is just a handle.",
        "duration": 60,
        "tags": ["memory", "people"],
    },
    {
        "title": "Lose a fight with a piece of paper",
        "hook": "Fold anything in half seven times. Anything. Try it.",
        "needs": "Any sheet of paper.",
        "steps": [
            "Fold the sheet in half. Again. Keep count.",
            "Somewhere around fold six or seven, the paper stops cooperating, regardless of how big or thin the sheet is.",
            "Look at the brick you've made and count its layers: two, four, eight… doubling every fold.",
        ],
        "why": "Seven folds is 128 layers; each fold also halves the area. The thickness grows exponentially and the paper runs out of room to bend around itself.",
        "duration": 60,
        "tags": ["maths", "paper"],
    },
    {
        "title": "Tie a shoelace that stays tied",
        "hook": "One extra wrap, borrowed from surgeons, ends the retying.",
        "needs": "A shoe with laces.",
        "steps": [
            "Start the knot as usual, but pass the lace around and through twice instead of once before pulling snug.",
            "Tie the bow on top exactly as you always do.",
            "Pull the loops to test. The base wrap bites and the bow stops working loose.",
        ],
        "why": "The doubled first crossing is a surgeon's knot: twice the wraps, several times the friction, so the bow above it never gets the slack it needs to slip.",
        "duration": 60,
        "tags": ["knots", "everyday"],
    },
    {
        "title": "Summon the floating sausage",
        "hook": "Two fingers, crossed eyes, one impossible object.",
        "steps": [
            "Point your two index fingers at each other, tips a centimetre apart, about ten centimetres from your eyes.",
            "Look past them at the far wall, keep the eyes focused on the distance.",
            "A small finger-sausage with two rounded ends floats between your fingertips. Pull the fingers slowly apart and it hangs in the air alone.",
        ],
        "why": "Each eye sees a different, misaligned image of your fingers, and the brain fuses the overlap into an object that isn't there.",
        "duration": 60,
        "tags": ["illusion", "body"],
    },
    {
        "title": "Interrogate an egg",
        "hook": "Boiled or raw, without cracking it. The egg confesses in two seconds.",
        "needs": "An egg of uncertain status.",
        "steps": [
            "Spin the egg on its side on a flat surface.",
            "Stop it dead with one fingertip, then lift the finger straight off.",
            "If it stays stopped, it's boiled. If it slowly starts turning again on its own, it's raw.",
        ],
        "why": "A raw egg is liquid inside; the shell stopped but the liquid kept its momentum and drags the shell back around. A boiled egg is one solid piece and stops all at once.",
        "duration": 60,
        "tags": ["kitchen", "physics"],
    },
    {
        "title": "Make your arm float",
        "hook": "Thirty seconds of pushing and your arm develops opinions of its own.",
        "needs": "A door frame.",
        "steps": [
            "Stand in a doorway. Press the back of one wrist hard against the frame, as if trying to raise the arm out sideways.",
            "Keep pressing, hard, for a slow count of thirty.",
            "Step out of the doorway and let the arm hang loose. It rises by itself.",
        ],
        "why": "Your motor cortex kept sending 'lift' for thirty seconds; when the frame vanishes the signal keeps firing for a while with nothing left to resist it. It's called the Kohnstamm phenomenon.",
        "duration": 90,
        "tags": ["body", "illusion"],
    },
]


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ.get("DB_NAME", "antisocial_db")]

    import uuid
    from datetime import datetime

    inserted = updated = 0
    for skill in SKILLS:
        assert 3 <= len(skill["steps"]) <= 6, f"{skill['title']}: step count"
        doc = {
            **skill,
            "type": "try_this",
            "rarity": skill.get("rarity", "common"),
        }
        existing = await db.try_this_content.find_one({"title": skill["title"]}, {"id": 1})
        if existing:
            await db.try_this_content.update_one({"title": skill["title"]}, {"$set": doc})
            updated += 1
        else:
            doc["id"] = str(uuid.uuid4())
            doc["created_at"] = datetime.utcnow()
            await db.try_this_content.insert_one(doc)
            inserted += 1

    total = await db.try_this_content.count_documents({})
    print(f"{inserted} inserted, {updated} updated; {total} try_this cards in the collection")


if __name__ == "__main__":
    asyncio.run(main())
