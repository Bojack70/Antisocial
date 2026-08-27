"""
Populate the AI-generated text content types with a hand-written seed set,
so the feed works fully without an OpenAI key. Mirrors populate_videos.py:
static curated data inserted directly into MongoDB. The AI generator in
server.py still tops these up automatically once a real key is configured.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime

load_dotenv()

FAST_WEIRD = [
    {
        "headline": "Wombats produce cube-shaped droppings",
        "facts": [
            "Their intestines have varying elasticity that molds waste into cubes.",
            "The shape keeps it from rolling away once stacked as a scent marker.",
        ],
        "tags": ["animals", "biology"],
    },
    {
        "headline": "A bolt of lightning is hotter than the sun's surface",
        "facts": [
            "Lightning can reach roughly 30,000 kelvin.",
            "The sun's surface is about 5,800 kelvin by comparison.",
        ],
        "tags": ["physics", "weather"],
    },
    {
        "headline": "Honey never spoils",
        "facts": [
            "Archaeologists have found 3,000-year-old honey in Egyptian tombs, still edible.",
            "Its low moisture and natural acidity keep bacteria from surviving in it.",
        ],
        "tags": ["food", "chemistry"],
    },
    {
        "headline": "Bananas are naturally slightly radioactive",
        "facts": [
            "They contain potassium-40, a radioactive isotope of potassium.",
            "The dose is far too small to pose any health risk.",
        ],
        "tags": ["food", "physics"],
    },
    {
        "headline": "Octopuses have three hearts",
        "facts": [
            "Two pump blood to the gills, one pumps it to the rest of the body.",
            "The main heart actually stops beating while the octopus swims.",
        ],
        "tags": ["animals", "biology"],
    },
    {
        "headline": "The Eiffel Tower grows taller in summer",
        "facts": [
            "Heat expands the iron structure, adding up to 15 cm of height.",
            "It also leans slightly away from the sun as the metal expands unevenly.",
        ],
        "tags": ["engineering", "physics"],
    },
    {
        "headline": "There are more possible chess games than atoms in the universe",
        "facts": [
            "The number of unique game sequences is estimated far beyond 10^120.",
            "Estimates of atoms in the observable universe sit around 10^80.",
        ],
        "tags": ["math", "games"],
    },
    {
        "headline": "Sea otters hold hands while sleeping",
        "facts": [
            "It keeps them from drifting apart on the open water.",
            "Some also wrap themselves in kelp for the same reason.",
        ],
        "tags": ["animals", "nature"],
    },
    {
        "headline": "A group of flamingos is called a flamboyance",
        "facts": [
            "Collective animal names like this are called 'terms of venery'.",
            "Other examples: a parliament of owls, a murder of crows.",
        ],
        "tags": ["language", "animals"],
    },
    {
        "headline": "Hot water can freeze faster than cold water",
        "facts": [
            "This is called the Mpemba effect, observed for centuries.",
            "Scientists still debate the exact combination of causes.",
        ],
        "tags": ["physics", "science"],
    },
    {
        "headline": "Venus spins backwards compared to most planets",
        "facts": [
            "A day on Venus is longer than its year around the sun.",
            "One theory blames an ancient, massive collision.",
        ],
        "tags": ["space", "science"],
    },
    {
        "headline": "Some clouds can weigh over a million pounds",
        "facts": [
            "The water droplets are so small they stay suspended in rising air.",
            "A typical cumulus cloud can weigh around 1.1 million pounds.",
        ],
        "tags": ["weather", "physics"],
    },
    {
        "headline": "Sharks existed before trees",
        "facts": [
            "Sharks appeared roughly 400 million years ago.",
            "The earliest tree-like plants show up about 350 million years ago.",
        ],
        "tags": ["biology", "history"],
    },
    {
        "headline": "Your stomach gets an entirely new lining every few days",
        "facts": [
            "Stomach acid would otherwise digest the stomach itself.",
            "The mucus lining regenerates roughly every 3-4 days.",
        ],
        "tags": ["biology", "human body"],
    },
    {
        "headline": "The shortest war in recorded history lasted under 40 minutes",
        "facts": [
            "The Anglo-Zanzibar War of 1896 ended in about 38 minutes.",
            "It remains the shortest war by most historical accounts.",
        ],
        "tags": ["history"],
    },
]

EXPLAINER = [
    {
        "question": "How do noise-cancelling headphones work?",
        "steps": [
            "A microphone picks up the incoming ambient sound wave.",
            "The circuit generates an inverted copy of that wave.",
            "The two waves cancel each other out before reaching your ear.",
        ],
        "interaction": "Which step surprised you?",
        "tags": ["technology", "audio"],
    },
    {
        "question": "How does a zipper actually work?",
        "steps": [
            "Each tooth has a small hook shaped to interlock with its neighbor.",
            "The slider forces two rows of teeth together at an angle.",
            "That angle locks the teeth in place until pulled apart the same way.",
        ],
        "interaction": "Did you expect it to be this mechanical?",
        "tags": ["design", "everyday objects"],
    },
    {
        "question": "How do submarine cables cross entire oceans?",
        "steps": [
            "Cable-laying ships unspool armored fiber-optic lines along the seabed.",
            "Repeaters every 40-60 miles boost the light signal along the way.",
            "Landing stations on each coast convert the signal back into internet traffic.",
        ],
        "interaction": "Which step felt least likely?",
        "tags": ["infrastructure", "internet"],
    },
    {
        "question": "How does a thermos keep drinks hot or cold?",
        "steps": [
            "Two walls with a vacuum between them block heat conduction.",
            "A reflective inner surface reflects radiant heat back inward or outward.",
            "A tight seal stops warm or cool air from escaping.",
        ],
        "interaction": "Which layer matters most, in your view?",
        "tags": ["everyday objects", "physics"],
    },
    {
        "question": "How do elevators avoid free-falling if a cable snaps?",
        "steps": [
            "Multiple independent cables share the load, not just one.",
            "A governor senses overspeed and triggers mechanical safety brakes.",
            "The brakes clamp directly onto the guide rails to stop the car.",
        ],
        "interaction": "Did you know elevators had backup brakes?",
        "tags": ["engineering", "safety"],
    },
    {
        "question": "How does autocomplete guess your next word?",
        "steps": [
            "It looks at the words you've already typed as context.",
            "A language model ranks likely next words by probability.",
            "The highest-ranked options get shown or typed for you.",
        ],
        "interaction": "How often is it actually right for you?",
        "tags": ["technology", "software"],
    },
    {
        "question": "How does a lock and key actually work?",
        "steps": [
            "Pins of different heights sit inside the lock cylinder.",
            "The correct key pushes each pin to exactly the right height.",
            "Aligned pins let the cylinder rotate freely and open the lock.",
        ],
        "interaction": "Which step felt most surprising?",
        "tags": ["everyday objects", "mechanics"],
    },
    {
        "question": "How do ATMs restock cash without ever running out?",
        "steps": [
            "Armored couriers refill cash cassettes on a set schedule.",
            "The machine tracks withdrawal patterns to predict demand.",
            "Low-cash alerts trigger an early refill before it empties.",
        ],
        "interaction": "Have you ever hit an empty ATM?",
        "tags": ["infrastructure", "finance"],
    },
    {
        "question": "How does a microwave heat food but not the plate?",
        "steps": [
            "Microwaves excite water molecules inside the food directly.",
            "Most plates contain little to no water to absorb that energy.",
            "The plate only warms slightly from contact with the hot food.",
        ],
        "interaction": "Which step changes how you think about microwaves?",
        "tags": ["physics", "everyday objects"],
    },
    {
        "question": "How does traffic-light timing get decided?",
        "steps": [
            "Sensors or cameras measure vehicle flow at the intersection.",
            "Timing plans are modeled to minimize total waiting time.",
            "Signals adjust by time of day as traffic patterns shift.",
        ],
        "interaction": "Does your commute ever feel oddly timed?",
        "tags": ["infrastructure", "cities"],
    },
]

INCIDENT = [
    {
        "hook": "FedEx once gambled its last $5,000 in Las Vegas to survive.",
        "story": [
            "In the early 1970s, FedEx was days from running out of fuel money.",
            "Founder Fred Smith flew to Las Vegas with the company's last funds.",
            "He won just enough at blackjack to cover a critical fuel bill.",
            "The company stabilized soon after and grew into a global carrier.",
        ],
        "tags": ["business", "history"],
    },
    {
        "hook": "The airline industry standardized seats to fit statistical averages.",
        "story": [
            "Early cockpit and seat designs were built around a single 'average' body.",
            "Almost no real pilot matched that average across every measurement.",
            "Engineers moved to adjustable seats and controls instead.",
            "That shift became a founding case study in ergonomic design.",
        ],
        "tags": ["design", "aviation"],
    },
    {
        "hook": "A postal error once delivered an entire prefabricated house.",
        "story": [
            "In the early 1900s, US parcel post had no size limit for a brief window.",
            "Some buyers shipped bricks, and even whole kit houses, by mail.",
            "Postal workers effectively became furniture and building movers.",
            "Regulators soon added weight limits to stop the practice.",
        ],
        "tags": ["history", "logistics"],
    },
    {
        "hook": "Australia once deployed the military against emus, and lost.",
        "story": [
            "In 1932, emus were destroying wheat crops in Western Australia.",
            "Soldiers were sent with machine guns to cull the population.",
            "The emus scattered too quickly for the guns to be effective.",
            "The operation was called off, remembered as the Great Emu War.",
        ],
        "tags": ["history", "animals"],
    },
    {
        "hook": "A vending machine on a moon mission delayed astronauts, sort of.",
        "story": [
            "During early spaceflight planning, engineers debated snack logistics for hours.",
            "Simple food storage decisions became surprisingly complex under weightlessness.",
            "Even crumbs posed a real risk to sensitive onboard equipment.",
            "NASA eventually developed specialized sealed food packaging as a result.",
        ],
        "tags": ["space", "history"],
    },
    {
        "hook": "A single typo once took down a major stock exchange system.",
        "story": [
            "In 2005, a Mizuho Securities trader meant to sell 1 share for 610,000 yen.",
            "The order was entered as 610,000 shares for 1 yen instead.",
            "The mistake cost the firm hundreds of millions of dollars.",
            "It prompted major reforms in trade-error safeguards across Japan.",
        ],
        "tags": ["finance", "history"],
    },
    {
        "hook": "Coca-Cola's formula change caused a public backlash so strong it reversed course in 79 days.",
        "story": [
            "In 1985, the company replaced its original recipe with 'New Coke'.",
            "Consumer complaints flooded in at a scale the company hadn't planned for.",
            "Within under three months, the original formula was brought back.",
            "It remains one of the most cited product-reversal cases in business.",
        ],
        "tags": ["business", "history"],
    },
    {
        "hook": "A lighthouse keeper's letter once accidentally started a legal doctrine.",
        "story": [
            "Maritime law historically leaned on lighthouse keepers' logged observations.",
            "One keeper's detailed notes on a shipwreck became key courtroom evidence.",
            "The case helped shape how eyewitness maritime records are treated in law.",
            "Lighthouse logs are still referenced in some admiralty cases today.",
        ],
        "tags": ["history", "law"],
    },
]

MINI_GAME = [
    {
        "game_type": "fact_vs_fiction",
        "prompt": "Glass is technically a slow-moving liquid, even at room temperature.",
        "options": ["Fact", "Fiction"],
        "correct_answer": "Fiction",
        "tags": ["science", "myths"],
    },
    {
        "game_type": "fact_vs_fiction",
        "prompt": "Goldfish have a memory span of only a few seconds.",
        "options": ["Fact", "Fiction"],
        "correct_answer": "Fiction",
        "tags": ["animals", "myths"],
    },
    {
        "game_type": "guess_scale",
        "prompt": "About how many miles of blood vessels are in an adult human body?",
        "options": ["6,000 miles", "60,000 miles", "600,000 miles"],
        "correct_answer": "60,000 miles",
        "tags": ["biology", "human body"],
    },
    {
        "game_type": "guess_scale",
        "prompt": "How many Earths could fit inside the sun?",
        "options": ["about 13,000", "about 130,000", "about 1,300,000"],
        "correct_answer": "about 1,300,000",
        "tags": ["space", "science"],
    },
    {
        "game_type": "predict_outcome",
        "prompt": "A penny is dropped from the top of the Empire State Building onto a sidewalk below. What actually happens?",
        "options": [
            "It embeds in the concrete",
            "It reaches a harmless terminal velocity",
            "It shatters on impact",
        ],
        "correct_answer": "It reaches a harmless terminal velocity",
        "tags": ["physics", "myths"],
    },
    {
        "game_type": "arrange_steps",
        "prompt": "Put these steps of how a rainbow forms in the correct order.",
        "options": [
            "Sunlight enters a raindrop",
            "Light bends and separates into colors",
            "Light reflects off the inside of the droplet",
            "Separated colors exit toward your eye",
        ],
        "correct_answer": "Sunlight enters a raindrop",
        "tags": ["nature", "physics"],
    },
    {
        "game_type": "fact_vs_fiction",
        "prompt": "Humans only use 10 percent of their brains.",
        "options": ["Fact", "Fiction"],
        "correct_answer": "Fiction",
        "tags": ["biology", "myths"],
    },
    {
        "game_type": "guess_scale",
        "prompt": "Roughly how many species of insects have been identified so far?",
        "options": ["about 10,000", "about 1 million", "about 10 million"],
        "correct_answer": "about 1 million",
        "tags": ["biology", "nature"],
    },
    {
        "game_type": "predict_outcome",
        "prompt": "You microwave a grape cut almost in half. What happens?",
        "options": [
            "Nothing unusual",
            "It produces a small plasma spark",
            "It instantly dries out",
        ],
        "correct_answer": "It produces a small plasma spark",
        "tags": ["science", "physics"],
    },
    {
        "game_type": "fact_vs_fiction",
        "prompt": "Bulls become aggressive specifically because of the color red.",
        "options": ["Fact", "Fiction"],
        "correct_answer": "Fiction",
        "tags": ["animals", "myths"],
    },
]

ALMOST_NOTHING = [
    {"text": "Silence."},
    {"text": "Just whitespace."},
    {"text": "A quiet space."},
    {"text": "Nothing happened here."},
    {"text": "This page is intentionally still."},
    {"text": "A pause, on purpose."},
    {"text": "Breathe. That's it."},
    {"text": "There is nothing to solve here."},
    {"text": "An empty room, kept clean."},
    {"text": "You can just look."},
    {"text": "This is the whole thing."},
    {"text": "Rest here for a moment."},
]

QUIET_CONTRADICTION = [
    {
        "statement1": "Nothing you do will matter in a trillion years, when the universe fades into cold darkness.",
        "statement2": "The fact that you cared about anything today is the only meaning that ever existed.",
        "tags": ["philosophy"],
    },
    {
        "statement1": "Almost everyone you meet is the main character of their own life, just like you.",
        "statement2": "Almost no one you meet will remember you a year from now.",
        "tags": ["philosophy", "people"],
    },
    {
        "statement1": "Most of what you own will be thrown away or forgotten within a generation.",
        "statement2": "The objects you keep are still where most of your memories quietly live.",
        "tags": ["philosophy"],
    },
    {
        "statement1": "You are a different collection of cells than you were seven years ago.",
        "statement2": "You still feel like exactly the same person who started reading this.",
        "tags": ["biology", "identity"],
    },
    {
        "statement1": "Every choice you make closes off every other version of your life.",
        "statement2": "You rarely notice any of those other versions were ever possible.",
        "tags": ["philosophy"],
    },
    {
        "statement1": "Most conversations are forgotten within days by everyone involved.",
        "statement2": "A single sentence from a stranger can be remembered for decades.",
        "tags": ["memory", "people"],
    },
    {
        "statement1": "The universe is unimaginably vast, and you occupy almost none of it.",
        "statement2": "As far as anyone can prove, you are the only place experience actually happens.",
        "tags": ["philosophy", "space"],
    },
    {
        "statement1": "Progress has made most physical labor easier than it was a century ago.",
        "statement2": "Most people report feeling busier now than that century ago.",
        "tags": ["society"],
    },
    {
        "statement1": "You can only ever directly experience the present moment.",
        "statement2": "Almost all of your attention is spent on the past or the future.",
        "tags": ["philosophy", "mind"],
    },
]

# Real, freely usable placeholder photography (Lorem Picsum, backed by Unsplash
# photographers) - seeded so each item gets a stable image across reloads.
PONDER = [
    {
        "image_url": "https://picsum.photos/seed/ponder-escalator/800/600",
        "question": "Is this designed for humans, or for schedules?",
        "options": ["For humans", "For schedules", "Neither, really"],
        "tags": ["design", "systems"],
    },
    {
        "image_url": "https://picsum.photos/seed/ponder-factory/800/600",
        "question": "Does this count as labor, if no one is watching?",
        "options": ["Yes", "No", "Depends who benefits"],
        "tags": ["labor", "philosophy"],
    },
    {
        "image_url": "https://picsum.photos/seed/ponder-highway/800/600",
        "question": "Is this progress, or just maintenance dressed up as progress?",
        "options": ["Progress", "Maintenance", "Impossible to tell"],
        "tags": ["infrastructure", "philosophy"],
    },
    {
        "image_url": "https://picsum.photos/seed/ponder-office/800/600",
        "question": "Who is this room actually built to serve?",
        "options": ["The people in it", "The organization", "No one in particular"],
        "tags": ["design", "society"],
    },
    {
        "image_url": "https://picsum.photos/seed/ponder-bridge/800/600",
        "question": "Does connecting two places change what happens in between?",
        "options": ["Always", "Sometimes", "Rarely"],
        "tags": ["infrastructure", "philosophy"],
    },
    {
        "image_url": "https://picsum.photos/seed/ponder-server/800/600",
        "question": "Is this closer to a machine, or to a memory?",
        "options": ["A machine", "A memory", "Both, somehow"],
        "tags": ["technology", "philosophy"],
    },
    {
        "image_url": "https://picsum.photos/seed/ponder-crowd/800/600",
        "question": "Is a crowd one thing, or many things at once?",
        "options": ["One thing", "Many things", "It depends on the moment"],
        "tags": ["society", "philosophy"],
    },
    {
        "image_url": "https://picsum.photos/seed/ponder-warehouse/800/600",
        "question": "Does a space like this feel empty, or simply waiting?",
        "options": ["Empty", "Waiting", "Both"],
        "tags": ["design", "philosophy"],
    },
    {
        "image_url": "https://picsum.photos/seed/ponder-clock/800/600",
        "question": "Do we keep time, or does time keep us?",
        "options": ["We keep it", "It keeps us", "Neither"],
        "tags": ["philosophy", "time"],
    },
]

CONTENT_MAP = {
    "fast_weird": (FAST_WEIRD, "common"),
    "explainer": (EXPLAINER, "common"),
    "incident": (INCIDENT, "common"),
    "mini_game": (MINI_GAME, "common"),
    "almost_nothing": (ALMOST_NOTHING, "uncommon"),
    "quiet_contradiction": (QUIET_CONTRADICTION, "uncommon"),
    "ponder": (PONDER, "common"),
}


async def populate_text_content():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]

    try:
        for content_type, (items, default_rarity) in CONTENT_MAP.items():
            collection_name = f"{content_type}_content"
            await db[collection_name].delete_many({})
            print(f"Cleared existing {collection_name}")

            for data in items:
                doc = {
                    **data,
                    "id": str(uuid.uuid4()),
                    "type": content_type,
                    "rarity": data.get("rarity", default_rarity),
                    "tags": data.get("tags", []),
                    "created_at": datetime.utcnow(),
                }
                await db[collection_name].insert_one(doc)

            print(f"Added {len(items)} items to {collection_name}")

        print("\nDone seeding text content types.")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(populate_text_content())
