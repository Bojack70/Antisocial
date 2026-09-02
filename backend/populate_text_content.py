"""
Populate the AI-generated text content types with a hand-written seed set,
so the feed works fully without an OpenAI key. Mirrors populate_videos.py:
static curated data inserted directly into MongoDB. The AI generator in
server.py still tops these up automatically once a real key is configured.

Content bar (2026-08-27): every item should be specific — real names, dates,
numbers — and pass the "retell test": would someone repeat this to a friend
at dinner? Generic top-100 trivia (honey never spoils, octopus hearts) is out.
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
        "headline": "The inventor of the Pringles can is buried in one",
        "facts": [
            "Fredric Baur designed the iconic tube for Procter & Gamble in 1966.",
            "When he died in 2008, his children honored his request: part of his ashes rests in an Original-flavor can.",
            "They bought it at a Walgreens on the way to the funeral home.",
        ],
        "tags": ["design", "history"],
    },
    {
        "headline": "Woolly mammoths were still alive when the Great Pyramid was built",
        "facts": [
            "The pyramid went up around 2560 BC.",
            "A population of mammoths survived on Wrangel Island in the Arctic until roughly 4,000 years ago.",
            "Pharaohs and mammoths shared the planet.",
        ],
        "tags": ["history", "animals"],
    },
    {
        "headline": "There are more trees on Earth than stars in the Milky Way",
        "facts": [
            "A 2015 Nature study counted about 3 trillion trees.",
            "The Milky Way holds an estimated 100 to 400 billion stars.",
            "Trees win by roughly ten to one.",
        ],
        "tags": ["nature", "space"],
    },
    {
        "headline": "The world's shortest scheduled flight lasts about 90 seconds",
        "facts": [
            "It connects Westray and Papa Westray, two Scottish islands 1.7 miles apart.",
            "With a good tailwind it's been done in 53 seconds.",
            "The safety briefing takes longer than the flight.",
        ],
        "tags": ["travel", "aviation"],
    },
    {
        "headline": "Cleopatra lived closer to the Moon landing than to the Great Pyramid",
        "facts": [
            "The pyramid was already about 2,500 years old when she was born.",
            "Only about 2,000 years separate her from 1969.",
            "Ancient Egypt was ancient to the ancient Egyptians.",
        ],
        "tags": ["history", "time"],
    },
    {
        "headline": "Oxford University is older than the Aztec Empire",
        "facts": [
            "Teaching at Oxford existed by 1096.",
            "Tenochtitlan, the Aztec capital, was founded in 1325.",
            "Students had been complaining about exams for two centuries by then.",
        ],
        "tags": ["history", "time"],
    },
    {
        "headline": "Nintendo was founded in 1889",
        "facts": [
            "It started as a handmade playing-card company in Kyoto.",
            "The Eiffel Tower was brand new that year.",
            "The company sold cards for nearly a century before touching video games.",
        ],
        "tags": ["history", "games"],
    },
    {
        "headline": "France was still executing people by guillotine when Star Wars premiered",
        "facts": [
            "Star Wars opened in May 1977.",
            "France's last guillotine execution took place that September.",
            "The guillotine outlived the debut of the lightsaber.",
        ],
        "tags": ["history", "time"],
    },
    {
        "headline": "Scotland's national animal is the unicorn",
        "facts": [
            "It has been a Scottish heraldic symbol since the 1300s.",
            "In medieval lore the unicorn was fiercely independent and impossible to tame.",
            "It appears on the UK royal coat of arms, chained.",
        ],
        "tags": ["history", "culture"],
    },
    {
        "headline": "One whale sings at a frequency no other whale uses",
        "facts": [
            "The '52-hertz whale' has been tracked since the late 1980s.",
            "Its call is far above the range of blue and fin whales.",
            "No one knows if any other whale has ever answered.",
        ],
        "tags": ["animals", "ocean"],
    },
    {
        "headline": "Venus spins backwards, and its day is longer than its year",
        "facts": [
            "It takes Venus longer to rotate once than to orbit the sun.",
            "One theory blames an ancient, massive collision.",
        ],
        "tags": ["space", "science"],
    },
    {
        "headline": "Sharks are older than trees",
        "facts": [
            "Sharks appeared roughly 400 million years ago.",
            "The earliest tree-like plants show up about 350 million years later in the fossil record's terms, 50 million years after sharks.",
            "Sharks are also older than Saturn's rings, by some estimates.",
        ],
        "tags": ["biology", "time"],
    },
    {
        "headline": "The shortest war in history lasted under 40 minutes",
        "facts": [
            "The Anglo-Zanzibar War of 1896 ended in about 38 minutes.",
            "The sultan's palace was shelled at 9:02 am; it was over by 9:40.",
        ],
        "tags": ["history"],
    },
    {
        "headline": "There are more possible chess games than atoms in the universe",
        "facts": [
            "Unique game sequences are estimated far beyond 10^120.",
            "Atoms in the observable universe sit around 10^80.",
            "Every game you play has probably never been played before.",
        ],
        "tags": ["math", "games"],
    },
]

EXPLAINER = [
    {
        "question": "How do they get ships into bottles?",
        "steps": [
            "The ship is built outside the bottle with hinged masts that fold flat.",
            "The hull is pushed through the bottle neck carefully.",
            "Threads attached to the masts run out through the cork.",
            "Once inside, you pull the threads to raise the masts into position.",
            "The threads are cut and the bottle is sealed.",
        ],
        "interaction": "Did you always assume the bottle was built around it?",
        "tags": ["craft", "everyday mysteries"],
    },
    {
        "question": "Why do we get brain freeze?",
        "steps": [
            "Cold food touches the roof of your mouth, cooling blood vessels.",
            "Your body rapidly constricts then dilates these vessels to warm them up.",
            "This sudden change triggers pain receptors in your soft palate.",
            "Your brain interprets the signal as coming from your forehead (referred pain).",
            "Pressing your tongue to the roof of your mouth warms it and stops the pain.",
        ],
        "interaction": "Did the tongue trick ever work for you?",
        "tags": ["human body", "everyday mysteries"],
    },
    {
        "question": "Why does your voice sound different in recordings?",
        "steps": [
            "When you speak, sound reaches your ears two ways: through the air and through your skull.",
            "Bone conduction adds deep, low frequencies only you can hear.",
            "A recording captures just the air version, the voice everyone else hears.",
            "That thinner, higher voice on tape is your actual public voice.",
        ],
        "interaction": "So which one is your real voice?",
        "tags": ["human body", "sound"],
    },
    {
        "question": "How do cats always land on their feet?",
        "steps": [
            "Falling cats have a built-in 'righting reflex' that kicks in within a fraction of a second.",
            "They bend at the waist and rotate the front and back halves of their body separately.",
            "Tucking and extending their legs in sequence lets them twist mid-air without pushing off anything.",
            "A flexible spine and no functional collarbone make the maneuver possible.",
        ],
        "interaction": "Physicists studied this for decades. Worth it?",
        "tags": ["animals", "physics"],
    },
    {
        "question": "How do submarine cables cross entire oceans?",
        "steps": [
            "Cable-laying ships unspool armored fiber-optic lines along the seabed.",
            "Repeaters every 40-60 miles boost the light signal along the way.",
            "Landing stations on each coast convert the signal back into internet traffic.",
        ],
        "interaction": "This page probably crossed an ocean floor to reach you.",
        "tags": ["infrastructure", "internet"],
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
        "question": "How does a thermos keep drinks hot or cold?",
        "steps": [
            "Two walls with a vacuum between them block heat conduction.",
            "A reflective inner surface reflects radiant heat back inward or outward.",
            "A tight seal stops warm or cool air from escaping.",
        ],
        "interaction": "It doesn't know hot from cold, it just blocks change.",
        "tags": ["everyday objects", "physics"],
    },
    {
        "question": "How do noise-cancelling headphones work?",
        "steps": [
            "A microphone picks up the incoming ambient sound wave.",
            "The circuit generates an inverted copy of that wave.",
            "The two waves cancel each other out before reaching your ear.",
        ],
        "interaction": "You're hearing silence that was manufactured.",
        "tags": ["technology", "audio"],
    },
]

INCIDENT = [
    {
        "hook": "The man who sold the Eiffel Tower. Twice.",
        "story": [
            "In 1925, con artist Victor Lustig posed as a government official and told scrap metal dealers that Paris was secretly dismantling the Eiffel Tower.",
            "He 'sold' it to a dealer for the equivalent of about $70,000, then disappeared.",
            "The dealer was too embarrassed to report it to the police.",
            "A month later, Lustig came back and sold the tower again to someone else.",
        ],
        "tags": ["history", "crime"],
    },
    {
        "hook": "A world-class violinist played the subway for 43 minutes. Seven people stopped.",
        "story": [
            "Joshua Bell's concerts sell out at $100+ per seat.",
            "In 2007, he played incognito in a D.C. subway station during rush hour, performing Bach on a $3.5 million Stradivarius.",
            "Of 1,097 people who passed by, seven stopped to listen. One recognized him.",
            "He made $32 in tips.",
            "The Washington Post organized it as an experiment about perception, context, and value.",
        ],
        "tags": ["music", "psychology"],
    },
    {
        "hook": "A programmer automated his entire job, then forgot to turn it off.",
        "story": [
            "A software engineer scripted all his tasks: compiling code, sending emails, even replying to his boss.",
            "He left the company in 2012 and forgot to shut the scripts down.",
            "In 2014, his former employer discovered they were still running, completing daily tasks.",
            "The company had been paying for two years of 'work' done by robots.",
            "He kept the money. Legally, they couldn't prove he knew.",
        ],
        "tags": ["technology", "work"],
    },
    {
        "hook": "For a few weeks in 2013, there were two living popes.",
        "story": [
            "Pope Benedict XVI resigned. The first pope to do so in 600 years.",
            "For a while, two popes lived in Vatican City simultaneously.",
            "Benedict wore white. Francis wore white. Both were addressed as 'Your Holiness.'",
            "Vatican protocol had no rules for this; staff improvised etiquette daily.",
            "Benedict moved to a monastery inside the Vatican walls. They occasionally had tea.",
        ],
        "tags": ["history", "religion"],
    },
    {
        "hook": "A story told on the Kerala coast: the lighthouse keeper who refused to leave.",
        "story": [
            "As the story goes, a keeper named Vikram tended a lighthouse on a rocky island for 23 years, supplies arriving by boat every two weeks.",
            "When automation arrived in 1998, they offered him early retirement. He refused, staying on as a 'consultant' to check the machines.",
            "When the lighthouse was decommissioned entirely in 2015, he was 71. He moved to the mainland, but hired a fisherman to take him back to the island every month.",
            "He died in 2019, they say, and his family scattered his ashes near the tower.",
            "The light no longer turns, but locals still navigate by its silhouette.",
        ],
        "tags": ["people", "sea", "legend"],
    },
    {
        "hook": "A single typo cost a trading firm hundreds of millions in minutes.",
        "story": [
            "In 2005, a Mizuho Securities trader meant to sell 1 share for 610,000 yen.",
            "The order went in as 610,000 shares for 1 yen instead.",
            "The mistake cost the firm hundreds of millions of dollars.",
            "It prompted major reforms in trade-error safeguards across Japan.",
        ],
        "tags": ["finance", "history"],
    },
    {
        "hook": "Australia once deployed the military against emus. The emus won.",
        "story": [
            "In 1932, emus were destroying wheat crops in Western Australia.",
            "Soldiers were sent with machine guns to cull the population.",
            "The emus scattered too quickly for the guns to be effective.",
            "The operation was called off. It's remembered as the Great Emu War.",
        ],
        "tags": ["history", "animals"],
    },
    {
        "hook": "People used to mail entire houses through the US Post.",
        "story": [
            "In the early 1900s, US parcel post briefly had no meaningful size limit.",
            "Some buyers shipped bricks (and even whole kit houses) by mail.",
            "Postal workers effectively became building movers.",
            "Regulators soon added weight limits to stop the practice.",
        ],
        "tags": ["history", "logistics"],
    },
    {
        "hook": "FedEx was saved by a blackjack table.",
        "story": [
            "In the early 1970s, FedEx was days from running out of fuel money.",
            "Founder Fred Smith flew to Las Vegas with the company's last $5,000.",
            "He won just enough at blackjack to cover a critical fuel bill.",
            "The company stabilized soon after and grew into a global carrier.",
        ],
        "tags": ["business", "history"],
    },
    {
        "hook": "The Air Force designed a cockpit for the average pilot. He didn't exist.",
        "story": [
            "Early cockpits were built around a single 'average' body, measured across thousands of pilots.",
            "When researchers checked, almost no real pilot matched the average on every dimension.",
            "Engineers switched to adjustable seats and controls instead.",
            "It became a founding case study in ergonomic design.",
        ],
        "tags": ["design", "aviation"],
    },
]

# Read-along drifts: atmospheric true stories rendered as narration when no
# audio file exists (AudioDriftCard falls back to showing the script text).
AUDIO_DRIFT = [
    {
        "title": "The Great Molasses Flood of 1919",
        "narration_script": (
            "On January 15, 1919, a 50-foot wave of molasses burst from a storage "
            "tank in Boston's North End. 2.3 million gallons of sticky syrup flooded "
            "the streets at 35 mph, crushing buildings and killing 21 people. The "
            "cleanup took weeks. Workers used saltwater to dissolve the molasses. "
            "On hot days, locals say you can still smell it."
        ),
        "tags": ["history", "disaster"],
    },
    {
        "title": "The Island That Appears and Disappears",
        "narration_script": (
            "Sailors tell of Sarah Ann Island, a speck in the Pacific that vanishes "
            "and reappears every few years. It's made, the story goes, of pumice "
            "from underwater volcanoes, light enough to float. Ships avoid the "
            "waters where it's said to surface overnight. And no one, the legend "
            "insists, has ever set foot on it before it dissolves back into the "
            "ocean. Like all good sea stories, it lives somewhere between the "
            "charts and the telling."
        ),
        "tags": ["ocean", "legend"],
    },
    {
        "title": "The Town Buried Under Sand",
        "narration_script": (
            "Kolmanskop in Namibia was once a thriving diamond mining town. When "
            "diamonds ran out in the 1950s, residents left everything behind. The "
            "desert moved in. Sand now fills the hospital, school, and homes up to "
            "the ceiling. Photographers travel there to capture rooms half-buried, "
            "as if time stopped mid-conversation."
        ),
        "tags": ["history", "places"],
    },
    {
        "title": "The Night of the Radium Girls",
        "narration_script": (
            "In the 1920s, factory workers painted watch dials with radium paint. "
            "Supervisors told them to lick their brushes for precision. The women "
            "began glowing in the dark: their bones, their breath. When they sued, "
            "the companies denied everything. Their fight created modern workplace "
            "safety laws. Some of their graves still emit radiation."
        ),
        "tags": ["history", "science"],
    },
]

# Rendered as "Gentle Reminder" cards in the UI.
ALMOST_NOTHING = [
    {"text": "When did you last laugh?\nNot a polite chuckle. A real, unguarded laugh. Your body misses it."},
    {"text": "Check your posture.\nRoll your shoulders back. Uncross your legs. Let your spine remember what it's like to be aligned."},
    {"text": "Unclench your jaw.\nDrop your shoulders. You were holding them again."},
    {"text": "Look at something far away.\nYour eyes have been focused up close for hours. Give them a horizon."},
    {"text": "Drink some water.\nNot later. Now is fine."},
    {"text": "Take one slow breath.\nIn through the nose. Out longer than in. That's the whole exercise."},
    {"text": "There is nothing to solve here."},
    {"text": "A pause, on purpose."},
]

QUIET_CONTRADICTION = [
    {
        "statement1": "Every choice you make is shaped by genetics, environment, and physics. Free will might be an illusion.",
        "statement2": "You are reading this sentence, and you can choose to stop. That choice feels undeniably real.",
        "tags": ["philosophy", "mind"],
    },
    {
        "statement1": "You can change your habits, rewire your brain, reshape your life. Neuroplasticity proves we have agency.",
        "statement2": "You cannot choose what you want to want. The desire to change is itself something that happens to you.",
        "tags": ["philosophy", "mind"],
    },
    {
        "statement1": "You are never alone. Your body contains trillions of bacteria, your mind echoes voices you've heard, your atoms were forged in ancient stars.",
        "statement2": "No one will ever know what it's like to be you. Your consciousness is the only experience that is truly, irreducibly yours.",
        "tags": ["philosophy", "identity"],
    },
    {
        "statement1": "The past doesn't exist. It's only a chemical pattern in your neurons, rewritten every time you recall it.",
        "statement2": "Yet the past is the only thing that made you who you are. Everything you are is what already happened.",
        "tags": ["philosophy", "memory"],
    },
    {
        "statement1": "Nothing you do will matter in a trillion years. The universe will expand into cold darkness, and no trace of humanity will remain.",
        "statement2": "The fact that you cared about anything today at all is the only meaning that ever existed.",
        "tags": ["philosophy"],
    },
    {
        "statement1": "Almost everyone you meet is the main character of their own life, just like you.",
        "statement2": "Almost no one you meet will remember you a year from now.",
        "tags": ["philosophy", "people"],
    },
    {
        "statement1": "You are a different collection of cells than you were seven years ago.",
        "statement2": "You still feel like exactly the same person who started reading this.",
        "tags": ["biology", "identity"],
    },
    {
        "statement1": "Most conversations are forgotten within days by everyone involved.",
        "statement2": "A single sentence from a stranger can be remembered for decades.",
        "tags": ["memory", "people"],
    },
    {
        "statement1": "You can only ever directly experience the present moment.",
        "statement2": "Almost all of your attention is spent on the past or the future.",
        "tags": ["philosophy", "mind"],
    },
]

PONDER = [
    {
        "question": "If you could erase one memory, would you?",
        "options": [
            "Yes. There's something I want gone",
            "No, even pain shaped who I am",
            "Maybe, depends on which memory",
            "I'd rather add good memories than delete bad ones",
        ],
        "tags": ["memory", "philosophy"],
    },
    {
        "question": "Would you press a button that shows you the exact date of your death?",
        "options": [
            "Yes, I'd plan everything around it",
            "No. The countdown would ruin today",
            "I'd press it, then instantly regret it",
        ],
        "tags": ["time", "philosophy"],
    },
    {
        "question": "If you could hear what people honestly think of you, would you listen?",
        "options": [
            "Yes, truth over comfort",
            "No, some doors stay closed",
            "Only from the people I love",
        ],
        "tags": ["people", "philosophy"],
    },
    {
        "question": "Do we keep time, or does time keep us?",
        "options": ["We keep it", "It keeps us", "Neither"],
        "tags": ["philosophy", "time"],
    },
    {
        "question": "Is a crowd one thing, or many things at once?",
        "options": ["One thing", "Many things", "It depends on the moment"],
        "tags": ["society", "philosophy"],
    },
    {
        "question": "Is this designed for humans, or for schedules?",
        "options": ["For humans", "For schedules", "Neither, really"],
        "tags": ["design", "systems"],
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

        # Audio drift: insert read-along story drifts WITHOUT clearing the
        # collection — it also holds real podcast episodes seeded separately.
        drift_titles = [d["title"] for d in AUDIO_DRIFT]
        await db["audio_drift_content"].delete_many({"title": {"$in": drift_titles}})
        for data in AUDIO_DRIFT:
            doc = {
                **data,
                "id": str(uuid.uuid4()),
                "type": "audio_drift",
                "rarity": data.get("rarity", "uncommon"),
                "tags": data.get("tags", []),
                "created_at": datetime.utcnow(),
            }
            await db["audio_drift_content"].insert_one(doc)
        print(f"Added {len(AUDIO_DRIFT)} read-along drifts to audio_drift_content (podcasts kept)")

        print("\nDone seeding text content types.")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(populate_text_content())
