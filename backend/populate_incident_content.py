"""
Fifth seed batch: incident — named true stories, told in four beats.

Every name, date and number below was checked against a live source on
2026-08-27. Nothing here is a "they say" story: where a detail is disputed
(what actually caused the Strasbourg dancing plague) the card says it is
disputed rather than picking the tidiest answer.

Shape that works for this type, taken from the Victor Lustig seed the user
liked: hook is the whole story in one line, then setup, escalation, and a
last beat that lands sideways rather than summarising.

Eight cards, not the nine the ratio wants — see the note in the commit. Every
candidate that would have made nine failed verification or duplicated a story
already used as a fast_weird card, and padding the pool with a weak ninth
would cost more than being one short.
"""
import asyncio
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

INCIDENT = [
    {
        "hook": "He survived Hiroshima, went home, and arrived in time for Nagasaki.",
        "story": [
            "Tsutomu Yamaguchi was in Hiroshima on a business trip for Mitsubishi when the first bomb detonated on 6 August 1945.",
            "Burned and half deaf, he made his way home to Nagasaki and reported for work on 9 August.",
            "He was in his supervisor's office being told he was insane — describing how a single bomb had destroyed an entire city — when the light came through the window again.",
            "Japan did not officially recognise him as a survivor of both bombings until 2009. He died the following year, aged 93.",
        ],
        "tags": ["history", "war"],
    },
    {
        "hook": "One man decided the computer was wrong, and was right.",
        "story": [
            "Just after midnight on 26 September 1983, Soviet early-warning satellites reported a US missile launch. Then another. Five in total.",
            "Stanislav Petrov's job was to pass the alert up the chain, where it would likely have triggered a retaliatory strike.",
            "He reasoned that a real American first strike would not consist of five missiles, and reported a system malfunction instead — with no corroborating evidence either way.",
            "The satellites had mistaken sunlight glinting off high cloud for rocket exhaust. The incident stayed secret for years, and the world never noticed the evening it nearly ended.",
        ],
        "tags": ["history", "cold war"],
    },
    {
        "hook": "The 1904 Olympic marathon was won by a man in a car, then by a man on poison.",
        "story": [
            "Fred Lorz cramped at nine miles, accepted a lift, and waved at runners as the car passed them. It broke down eleven miles later, so he jogged the rest and was met at the stadium as champion.",
            "The real leader, Thomas Hicks, was seven miles out when his handlers gave him strychnine mixed with egg white — a stimulant in small doses, a poison in slightly larger ones.",
            "They topped it up with brandy. By the finish he was hallucinating and could no longer run.",
            "His team carried him across the line, holding him up while his feet moved in the air. The judges reviewed this and awarded him the gold medal.",
        ],
        "tags": ["sport", "history"],
    },
    {
        "hook": "She went over Niagara Falls in a barrel to fix her retirement, on her 63rd birthday.",
        "story": [
            "Annie Edson Taylor was a widowed schoolteacher facing poverty in 1901, and decided fame was the way out.",
            "On 24 October — her 63rd birthday — she was sealed into a padded oak barrel and set adrift above Horseshoe Falls.",
            "She came out with a gash on her scalp and no broken bones, the first person to survive the drop.",
            "The fame paid almost nothing. She spent her remaining years scraping a living from the stunt and died poor, having told people not to attempt what she had just done.",
        ],
        "tags": ["history", "daredevils"],
    },
    {
        "hook": "In 1518 a woman started dancing in the street, and within weeks hundreds had joined her.",
        "story": [
            "On 14 July 1518, Frau Troffea stepped into a Strasbourg street and began to dance. She did not stop.",
            "Her husband pleaded with her. She danced through the day, collapsed, and started again the next morning on bleeding feet.",
            "Within weeks somewhere between 50 and 400 people were dancing with her. Some are recorded as dancing until they died.",
            "The city's response was to build a stage and hire musicians, on the theory that the afflicted should dance it out of their systems. Historians still argue about the cause; stress-induced mass hysteria is the leading explanation, not a settled one.",
        ],
        "tags": ["history", "mystery"],
    },
    {
        "hook": "A flight attendant fell 10,160 metres without a parachute and survived.",
        "story": [
            "On 26 January 1972, a bomb tore apart a Yugoslav Airlines DC-9 over Czechoslovakia.",
            "Vesna Vulović was 22, and was not even scheduled to be on that flight.",
            "She fell more than ten kilometres inside a section of the fuselage and was found alive in the wreckage — the only person aboard who was.",
            "She spent four weeks in a coma and close to eighteen months in hospital. It remains the highest fall ever survived without a parachute, and she said afterwards she had no memory of any of it.",
        ],
        "tags": ["survival", "aviation"],
    },
    {
        "hook": "A bear was formally enlisted in the Polish army so he could board the ship.",
        "story": [
            "Soldiers of the Polish II Corps adopted an orphaned bear cub in Iran in 1942 and named him Wojtek.",
            "He grew up in camp, ate cigarettes, and wrestled the men for entertainment.",
            "When the unit shipped to Italy, regulations barred animals — so Wojtek was given a name, a serial number and the rank of private.",
            "At Monte Cassino in 1944 he carried crates of artillery shells alongside the men, and by the accounts of those there, never dropped one.",
        ],
        "tags": ["history", "animals"],
    },
    {
        "hook": "They were told the glowing paint was harmless, and to point the brush with their lips.",
        "story": [
            "In the 1910s and 20s, young women painted luminous radium dials onto watches, a job that paid unusually well.",
            "To keep a fine tip, they were instructed to draw the brush between their lips after every stroke — a practice the trade called lip-pointing.",
            "As their jaws began to disintegrate, the companies insisted radium was safe and blamed the illnesses on the women themselves.",
            "Grace Fryer and four colleagues sued — the papers called them 'the Case of the Five Women Doomed to Die'. They won little money and changed American workplace safety law permanently.",
        ],
        "tags": ["history", "science"],
    },
]


async def populate():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    try:
        hooks = [item["hook"] for item in INCIDENT]
        removed = await db.incident_content.delete_many({"hook": {"$in": hooks}})
        for data in INCIDENT:
            await db.incident_content.insert_one({
                **data,
                "id": str(uuid.uuid4()),
                "type": "incident",
                "rarity": data.get("rarity", "common"),
                "tags": data.get("tags", []),
                "created_at": datetime.utcnow(),
            })
        total = await db.incident_content.count_documents({})
        print(f"  incident_content                +{len(INCIDENT):3d} new "
              f"(replaced {removed.deleted_count}) -> {total} total")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(populate())
