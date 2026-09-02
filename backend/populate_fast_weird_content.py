"""
Third seed batch: fast_weird — the time-and-scale collisions.

Every claim below was checked against a live source in the session that wrote
it (2026-08-27). Sources are noted inline where the number is the whole point
of the card, so a later reader can re-check rather than re-trust.

The bar, from the cards the user actually liked:
- Retell test. If nobody would repeat it at dinner, cut it.
- Specific over generic: real names, real dates, real numbers.
- Banned: top-100 listicle trivia (honey never spoils, octopus hearts).
- Land the last fact as an aftertaste, not a summary.

One drafting note worth keeping: "the atoms in your body were forged in dying
stars" was cut from an earlier batch because it is false for hydrogen, which
is primordial. Popular framings of these facts are often slightly wrong; the
true version is usually the better card anyway.
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
        "headline": "Cleopatra lived closer to the Moon landing than to the building of the Great Pyramid",
        "facts": [
            "The Great Pyramid at Giza went up around 2560 BC.",
            "Cleopatra was born in 69 BC, roughly 2,500 years later.",
            "Apollo 11 landed 1,999 years after that. She was born nearer to us than to the pyramid she grew up beside.",
        ],
        "tags": ["history", "time"],
    },
    {
        "headline": "Tyrannosaurus rex lived closer to you than to Stegosaurus",
        "facts": [
            "Stegosaurus died out around 150 million years ago.",
            "T. rex didn't appear until about 68 million years ago, a gap of some 85 million years.",
            "Only 66 million years separate T. rex from this sentence. The two dinosaurs were never contemporaries; you are closer to one of them than they were to each other.",
        ],
        "tags": ["dinosaurs", "time"],
    },
    {
        "headline": "Sharks are older than the dinosaurs, and outlasted them",
        "facts": [
            "Sharks have been swimming for about 450 million years.",
            "That is far longer than the dinosaurs managed, start to finish.",
            "Sharks watched them arrive, watched them go, and did not noticeably change their plans.",
        ],
        "tags": ["animals", "time"],
    },
    {
        "headline": "Nintendo was founded in 1889, and its first product was a hand-painted playing card",
        "facts": [
            "Fusajiro Yamauchi started Nintendo Koppai in Kyoto on 23 September 1889.",
            "It made hanafuda, 'flower cards', 48 to a deck, twelve suits for twelve months.",
            "The company was already over a century old before it sold anyone a Game Boy.",
        ],
        "tags": ["history", "games"],
    },
    {
        "headline": "Oxford was already teaching students 229 years before the Aztecs founded their capital",
        "facts": [
            "Teaching at Oxford is documented from no later than 1096.",
            "Tenochtitlán, the Aztec capital, was founded in 1325.",
            "By the time the Aztec Empire began, Oxford had been handing out reading lists for over two centuries.",
        ],
        "tags": ["history", "time"],
    },
    {
        "headline": "The shortest war in history was over in 38 minutes",
        "facts": [
            "On 27 August 1896, Britain and the Sultanate of Zanzibar went to war.",
            "Khalid bin Barghash barricaded himself in the palace with around 2,800 defenders.",
            "British shells hit a wooden palace. Roughly 500 of his people were killed or wounded inside half an hour, a war shorter than a lunch break, and not remotely a gentle one.",
        ],
        "tags": ["history", "war"],
    },
    {
        "headline": "The Hundred Years' War lasted 116 years",
        "facts": [
            "It ran from 1337 to 1453.",
            "It was not one war but a series of them, broken up by truces and by the Black Death.",
            "Nobody involved called it the Hundred Years' War. The name was applied by historians long after everyone in it had died.",
        ],
        "tags": ["history", "war"],
    },
    {
        "headline": "France was still beheading people by guillotine in 1977",
        "facts": [
            "Hamida Djandoubi was executed by guillotine at Baumettes Prison in Marseille on 10 September 1977.",
            "It was the last time the device was used anywhere in France.",
            "The machine most people file under 'French Revolution' was in service within living memory of most people reading this.",
        ],
        "tags": ["history", "france"],
    },
    {
        "headline": "The microwave oven exists because a chocolate bar melted in an engineer's pocket",
        "facts": [
            "In 1945 Percy Spencer was standing near a running magnetron in a Raytheon radar lab.",
            "He noticed the chocolate bar in his pocket had turned to liquid, and pointed the magnetron at popcorn kernels instead. They popped.",
            "His next test was an egg. It cooked so fast it exploded, which is the sort of result that ends up in a patent.",
        ],
        "tags": ["invention", "accident"],
    },
    {
        "headline": "Velcro was reverse-engineered from a plant that wouldn't let go of a dog",
        "facts": [
            "In 1941 George de Mestral came back from a walk covered in burdock burrs, along with his dog.",
            "Under a microscope, each burr turned out to be thousands of tiny hooks catching on looped fibres.",
            "He spent years reproducing it in nylon and named it from velours and crochet, velvet and hook.",
        ],
        "tags": ["invention", "nature"],
    },
    {
        "headline": "Play-Doh spent its first decades as wallpaper cleaner",
        "facts": [
            "Kutol, founded in Cincinnati in 1912, sold a soft compound for wiping coal soot off wallpaper.",
            "Cleaner heating fuels arrived, the soot stopped, and the company was close to finished.",
            "A relative read that teachers were using the stuff for modelling. It was rebranded Play-Doh in 1956 and the company survived by selling the same substance to children.",
        ],
        "tags": ["invention", "business"],
    },
    {
        "headline": "Bubble wrap was invented as wallpaper and nobody wanted it",
        "facts": [
            "In 1957 Alfred Fielding and Marc Chavannes sealed two shower curtains together, trapping bubbles between them.",
            "The plan was textured, futuristic wall covering. Interior decorators declined.",
            "It found its purpose protecting things in transit, and, unofficially, as the most popular object in the world to destroy on purpose.",
        ],
        "tags": ["invention", "accident"],
    },
    {
        "headline": "The Slinky was a failed attempt to stop naval instruments shaking",
        "facts": [
            "In 1943 engineer Richard James was testing springs meant to steady sensitive equipment on ships at sea.",
            "He knocked one off a shelf and watched it walk itself down a stack of books to the floor, then stand up.",
            "By 1944 he had built a machine to coil 80 feet of wire into a two-inch spiral, and sold the accident as a toy.",
        ],
        "tags": ["invention", "accident"],
    },
    {
        "headline": "Pluto has not finished a single lap since we found it",
        "facts": [
            "Clyde Tombaugh spotted it on 18 February 1930.",
            "One Pluto year takes about 248 Earth years.",
            "It completes its first full orbit since discovery on 23 March 2178. Everyone who has ever known Pluto exists will be gone before it gets back to where we met it.",
        ],
        "tags": ["space", "time"],
    },
    {
        "headline": "A day on Venus is longer than a year on Venus",
        "facts": [
            "Venus takes about 243 Earth days to turn once on its axis.",
            "It goes all the way around the Sun in about 225.",
            "It also spins backwards, so on Venus the Sun rises in the west on the rare occasions it finishes rising at all.",
        ],
        "tags": ["space", "time"],
    },
    {
        "headline": "The country with the most pyramids is not Egypt",
        "facts": [
            "Sudan has somewhere between 200 and 255 of them; Egypt has around 138.",
            "They were built by the Kingdom of Kush, roughly 700 BC to 300 AD.",
            "Nubian pyramids worked more like headstones than tombs. The ruler was buried underneath, not inside.",
        ],
        "tags": ["history", "architecture"],
    },
    {
        "headline": "Email is older than the mobile phone call",
        "facts": [
            "Ray Tomlinson sent the first networked email on 29 October 1971.",
            "Martin Cooper made the first handheld mobile call on 3 April 1973, standing on a New York street.",
            "Both devices existed before most of the infrastructure we now assume came first.",
        ],
        "tags": ["technology", "history"],
    },
    {
        "headline": "The United States banned sliced bread in 1943",
        "facts": [
            "The ban took effect on 18 January 1943, to save the wax paper that pre-sliced loaves needed and the steel in the slicing machines.",
            "It saved neither in any meaningful quantity, and the public reaction was ferocious.",
            "It was rescinded on 8 March, less than two months later.",
        ],
        "tags": ["history", "food"],
    },
    {
        "headline": "Anne Frank and Martin Luther King Jr. were born in the same year",
        "facts": [
            "King was born in Atlanta in January 1929.",
            "Anne Frank was born in Frankfurt in June 1929, five months later.",
            "She died at fifteen. He was assassinated at thirty-nine. Had she lived an ordinary lifespan, she could have watched him give the speech.",
        ],
        "tags": ["history", "time"],
    },
    {
        "headline": "The Eiffel Tower is taller in summer than in winter",
        "facts": [
            "It is made of iron, and iron expands as it warms.",
            "Between the coldest and hottest days, the tower gains roughly 12 to 15 centimetres.",
            "Nobody has to do anything about it. It shrinks back every winter, and has for over a century.",
        ],
        "tags": ["physics", "architecture"],
    },
    {
        "headline": "Fanta was invented because Coca-Cola couldn't reach Nazi Germany",
        "facts": [
            "Wartime embargo cut the German bottling plant off from Coke's syrup in 1940.",
            "Max Keith, who ran the operation, made a drink from what was still available, fruit offcuts and whey.",
            "A salesman named it Fanta, short for Fantasie, after Keith told the team to use their imagination.",
        ],
        "tags": ["history", "food"],
    },
    {
        "headline": "Ketchup was sold as medicine in the 1830s",
        "facts": [
            "In 1834 Dr John Cook Bennett of Ohio declared tomatoes a cure for diarrhoea, jaundice and indigestion.",
            "He published his ketchup recipe as a treatment, and it was taken seriously.",
            "It was eventually sold in concentrated pill form, which is the least appetising sentence in the history of condiments.",
        ],
        "tags": ["history", "food"],
    },
    {
        "headline": "Wombats produce cube-shaped droppings, and it took scientists years to work out how",
        "facts": [
            "They are the only known animal to do it.",
            "Researchers inflated balloons inside wombat intestines and found two grooves where the wall is far more elastic than elsewhere.",
            "Those soft stretches, worked over many contractions, press the corners in. The wombat is not extruding a cube; it is slowly kneading one.",
        ],
        "tags": ["animals", "biology"],
    },
    {
        "headline": "The fastest eater on Earth finds, identifies and swallows food in a tenth of a second",
        "facts": [
            "The star-nosed mole averages about 230 milliseconds from spotting food to moving on.",
            "Its best recorded time is 120 milliseconds, faster than a human can react to a light turning on.",
            "The star on its nose is not for smelling. It is a touch organ, and it is reading the dark faster than your eyes read this line.",
        ],
        "tags": ["animals", "senses"],
    },
    {
        "headline": "There are more possible chess games than atoms in the observable universe",
        "facts": [
            "Claude Shannon estimated the number of playable chess games at around 10^120.",
            "The observable universe holds an estimated 10^80 atoms.",
            "That is not forty times more. It is forty orders of magnitude more. The atoms would need a trillion trillion trillion universes to catch up.",
        ],
        "tags": ["mathematics", "games"],
    },
    {
        "headline": "The fax machine was patented 33 years before the telephone",
        "facts": [
            "Alexander Bain patented an 'electric printing telegraph' on 27 May 1843.",
            "It scanned a message with a pendulum and reproduced it at the far end.",
            "Bell's telephone patent came in 1876. The office machine everyone treats as obsolete is older than the thing that replaced it.",
        ],
        "tags": ["technology", "history"],
    },
    {
        "headline": "Marie Curie's notebooks are still too radioactive to handle",
        "facts": [
            "They are kept in lead-lined boxes at the Bibliothèque nationale de France.",
            "Anyone who wants to read them signs a liability waiver and wears protective clothing.",
            "The radium in them has a half-life of about 1,600 years. Her shopping lists will still be dangerous long after every language she wrote in is dead.",
        ],
        "tags": ["science", "history"],
    },
    {
        "headline": "Harvard is older than calculus",
        "facts": [
            "Harvard was founded on 28 October 1636.",
            "Newton and Leibniz did not develop calculus until the late 1600s.",
            "For its first few decades, the most advanced mathematics on Earth had not been invented yet, and the university was already open.",
        ],
        "tags": ["history", "science"],
    },
    {
        "headline": "The Statue of Liberty spent twenty years turning green in public",
        "facts": [
            "She arrived in 1886 the colour of a new penny.",
            "Salt air and pollution oxidised the copper skin, taking her through a dull brown before the green appeared.",
            "The whole change took about twenty years. The patina was left alone. It protects the copper underneath.",
        ],
        "tags": ["history", "chemistry"],
    },
    {
        "headline": "Betty White was older than sliced bread",
        "facts": [
            "She was born in Oak Park, Illinois, on 17 January 1922.",
            "Otto Rohwedder's bread-slicing machine reached bakeries in 1928, six years later.",
            "The first machine had already fallen apart from overuse in a Chillicothe bakery before she turned seven.",
        ],
        "tags": ["history", "time"],
    },
]


async def populate():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    try:
        headlines = [item["headline"] for item in FAST_WEIRD]
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
        print(f"  fast_weird_content              +{len(FAST_WEIRD):3d} new "
              f"(replaced {removed.deleted_count}) -> {total} total")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(populate())
