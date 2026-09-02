"""
Look Closer — the photo-guess card (Wave 2, item 3).

One striking photograph, three options before any caption, then the
reveal. Rules the batch follows:

1. **Public domain, uniformly.** Every image is from the NASA Image and
   Video Library (images-assets.nasa.gov) — NASA media is not copyrighted;
   the card still carries the full credit line and links the source.
2. **Click-verified.** Every URL was HEAD-checked (200, image/jpeg) AND
   eyeballed on 2026-08-28 to confirm the picture matches the claim.
   Composites with annotation overlays were rejected — labels answer the
   guess for you.
3. **The wrong options must be the honest first impression.** Jupiter's
   clouds genuinely read as marbled paint; the Lena delta as a tree. The
   card works because the wrong answer is the reasonable one.
4. **Facts are conservative.** Only well-established claims; no precision
   theatre. Where a specific storm or date is unverified, the card
   doesn't name one.

Idempotent: keyed by image_url, $set on match, insert when missing.
The script re-verifies every URL before writing.
"""
import asyncio
import os
import urllib.request

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

NASA_PAGE = "https://images.nasa.gov/details/"

IMAGES = [
    {
        "image_url": "https://images-assets.nasa.gov/image/PIA18244/PIA18244~medium.jpg",
        "options": ["Ripples in a chocolate glaze", "Sand dunes on Mars", "Skin under a microscope"],
        "answer": "Sand dunes on Mars",
        "facts": [
            "Dunes in Nili Patera, photographed from orbit by the Mars Reconnaissance Orbiter.",
            "Repeat images show these dunes migrating. Mars is not finished changing.",
        ],
        "credit": "NASA/JPL-Caltech/Univ. of Arizona",
        "source_link": NASA_PAGE + "PIA18244",
        "tags": ["mars", "space"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/PIA25691/PIA25691~medium.jpg",
        "options": ["Paint marbled in water", "A satellite view of ocean currents", "The clouds of Jupiter"],
        "answer": "The clouds of Jupiter",
        "facts": [
            "Storm swirls photographed by the Juno spacecraft; the frame spans thousands of kilometres.",
            "What reads as oil paint is ammonia cloud, stirred by winds that outrun any hurricane on Earth.",
        ],
        "credit": "NASA/JPL-Caltech/SwRI/MSSS",
        "source_link": NASA_PAGE + "PIA25691",
        "tags": ["jupiter", "space"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002160/GSFC_20171208_Archive_e002160~medium.jpg",
        "options": ["The veins of a leaf", "A river delta from orbit", "Coral, magnified"],
        "answer": "A river delta from orbit",
        "facts": [
            "The Lena River fanning into the Arctic Ocean, in false-colour Landsat imagery.",
            "One of Earth's largest deltas, and frozen solid for about seven months of the year.",
        ],
        "credit": "NASA/USGS Landsat",
        "source_link": NASA_PAGE + "GSFC_20171208_Archive_e002160",
        "tags": ["earth", "rivers"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/PIA22645/PIA22645~medium.jpg",
        "options": ["A wildfire filmed from above", "Molten gold being poured", "The surface of the Sun"],
        "answer": "The surface of the Sun",
        "facts": [
            "Coronal loops over an active region, seen in extreme ultraviolet by the Solar Dynamics Observatory.",
            "Each glowing arch is plasma tracing a magnetic field line. Many are taller than several Earths stacked.",
        ],
        "credit": "NASA/GSFC/Solar Dynamics Observatory",
        "source_link": NASA_PAGE + "PIA22645",
        "tags": ["sun", "space"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/carina_nebula/carina_nebula~medium.jpg",
        "options": ["Mountains at dusk", "A nursery where stars are born", "Smoke from a volcanic vent"],
        "answer": "A nursery where stars are born",
        "facts": [
            "The 'Cosmic Cliffs' of the Carina Nebula, one of the James Webb Space Telescope's first images.",
            "The 'mountains' are walls of gas and dust light-years tall, being eaten away by newborn stars above them.",
        ],
        "credit": "NASA/ESA/CSA/STScI",
        "source_link": NASA_PAGE + "carina_nebula",
        "tags": ["nebula", "space"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/PIA17122/PIA17122~orig.jpg",
        "options": ["The head of a bolt, magnified", "A storm with six straight sides", "Honeycomb in silhouette"],
        "answer": "A storm with six straight sides",
        "facts": [
            "Saturn's north polar hexagon, photographed by the Cassini spacecraft.",
            "A six-sided jet stream wider than Earth, holding its shape for decades. Nobody fully knows why.",
        ],
        "credit": "NASA/JPL-Caltech/Space Science Institute",
        "source_link": NASA_PAGE + "PIA17122",
        "tags": ["saturn", "space"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/PIA20213/PIA20213~orig.jpg",
        "options": ["Frost on a windowpane", "The mountains and ice plains of Pluto", "Dried and cracked seabed"],
        "answer": "The mountains and ice plains of Pluto",
        "facts": [
            "From the New Horizons flyby: mountains of water ice beside the pale cells of Sputnik Planitia.",
            "The cells are churning nitrogen ice. Pluto's surface is slowly boiling in extreme slow motion.",
        ],
        "credit": "NASA/JHUAPL/SwRI",
        "source_link": NASA_PAGE + "PIA20213",
        "tags": ["pluto", "space"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002163/GSFC_20171208_Archive_e002163~medium.jpg",
        "options": ["A meteor crater", "A fossilised eye", "A bullseye of eroded rock"],
        "answer": "A bullseye of eroded rock",
        "facts": [
            "The Richat Structure in the Sahara, roughly forty kilometres across, and not a crater.",
            "It is a dome of rock layers worn flat by erosion; astronauts have used it as a landmark from orbit.",
        ],
        "credit": "NASA/USGS Landsat",
        "source_link": NASA_PAGE + "GSFC_20171208_Archive_e002163",
        "tags": ["earth", "desert"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000840/GSFC_20171208_Archive_e000840~medium.jpg",
        "options": ["A close-up of an opal", "Ink dropped into water", "Trillions of living things, from space"],
        "answer": "Trillions of living things, from space",
        "facts": [
            "A phytoplankton bloom in the Bering Sea, swirling around the Pribilof Islands.",
            "Each swirl is water clouded by single-celled life, small enough to be invisible, numerous enough to be seen from orbit.",
        ],
        "credit": "NASA/USGS Landsat",
        "source_link": NASA_PAGE + "GSFC_20171208_Archive_e000840",
        "tags": ["earth", "ocean"],
    },
    {
        "image_url": "https://images-assets.nasa.gov/image/iss040e045408/iss040e045408~medium.jpg",
        "options": ["Wool pulled into a funnel", "The eye of a typhoon, from above", "A whirlpool in shallow water"],
        "answer": "The eye of a typhoon, from above",
        "facts": [
            "Photographed by an astronaut on the International Space Station, looking straight down the eye.",
            "Inside the wall: near calm. The wall itself is a rotating cliff of cloud, kilometres tall.",
        ],
        "credit": "NASA/ISS",
        "source_link": NASA_PAGE + "iss040e045408",
        "tags": ["earth", "weather"],
    },
]


def verify(url: str) -> bool:
    req = urllib.request.Request(url, method="HEAD")
    try:
        r = urllib.request.urlopen(req, timeout=20)
        return r.status == 200 and "image" in r.headers.get("Content-Type", "")
    except Exception:
        return False


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ.get("DB_NAME", "antisocial_db")]

    import uuid
    from datetime import datetime

    inserted = updated = 0
    for item in IMAGES:
        assert item["answer"] in item["options"], f"{item['image_url']}: answer not in options"
        if not verify(item["image_url"]):
            print(f"DEAD URL, skipped: {item['image_url']}")
            continue
        doc = {**item, "type": "look_closer", "prompt": "What is this?",
               "rarity": item.get("rarity", "common")}
        existing = await db.look_closer_content.find_one(
            {"image_url": item["image_url"]}, {"id": 1}
        )
        if existing:
            await db.look_closer_content.update_one(
                {"image_url": item["image_url"]}, {"$set": doc}
            )
            updated += 1
        else:
            doc["id"] = str(uuid.uuid4())
            doc["created_at"] = datetime.utcnow()
            await db.look_closer_content.insert_one(doc)
            inserted += 1

    total = await db.look_closer_content.count_documents({})
    print(f"{inserted} inserted, {updated} updated; {total} look_closer cards in the collection")


if __name__ == "__main__":
    asyncio.run(main())
