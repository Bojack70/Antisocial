"""
Fourth seed batch: explainer — the childhood "how do they actually do that?"
questions, answered in steps.

Two rules shaped this list beyond the usual content bar:

1. Where the popular explanation is WRONG, the card corrects it. Three here
   were checked specifically because the common answer is a myth: aircraft
   lift (NASA is explicit that equal-transit-time is incorrect), Swiss cheese
   holes (bacteria alone don't do it — hay particles are the nucleation
   points, per Agroscope's 2015 study), and general anaesthesia (still
   genuinely unsettled, so the honest card says so).
2. No number goes in unless it earns its place and was checked. Several
   drafts lost a precise figure — microwave frequency, chocolate particle
   size — rather than assert one from memory.

Verified 2026-08-27 alongside the seedless-watermelon triploid mechanism.
"""
import asyncio
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

EXPLAINER = [
    {
        "question": "How do noise-cancelling headphones erase an aeroplane?",
        "steps": [
            "A microphone on the outside listens to the noise arriving at your ear.",
            "The headphone generates the same wave turned upside down — every peak matched with a trough.",
            "The two waves meet and largely cancel, leaving much less to hear.",
            "It works best on steady, low, droning sound. A sudden voice or a clattering tray arrives too unpredictably to be inverted in time.",
        ],
        "interaction": "That's why the engine vanishes but the baby doesn't.",
        "tags": ["sound", "everyday mysteries"],
    },
    {
        "question": "How do they get the lead into a pencil?",
        "steps": [
            "There is no lead, and never was — it's graphite mixed with clay.",
            "The mixture is extruded as a long thin rod and fired in a kiln. More clay makes a harder, fainter pencil.",
            "A slat of wood is cut with a groove, the rod laid in, and a second grooved slat glued on top.",
            "The block is then shaped and painted. The pencil is built around the core, not drilled and filled.",
        ],
        "interaction": "Did you picture someone threading it down a hole?",
        "tags": ["craft", "everyday mysteries"],
    },
    {
        "question": "How does a zipper actually hold shut?",
        "steps": [
            "Every tooth has a small hook on one face and a hollow on the other.",
            "Inside the slider is a Y-shaped channel that forces the two rows together at a precise angle.",
            "Each tooth drops into the hollow of the tooth opposite and locks there.",
            "Pull the slider the other way and the same wedge prises them apart. The zip is not gripping — it is a chain of tiny hooks, each held by its neighbour.",
        ],
        "tags": ["design", "everyday mysteries"],
    },
    {
        "question": "How do they make a mirror?",
        "steps": [
            "A sheet of glass is polished until it is optically flat — the hard part.",
            "A thin layer of metal, usually aluminium, is deposited onto the back in a vacuum.",
            "Coats of protective paint seal the metal from air and scratching.",
            "The glass isn't the mirror. It's a window protecting the real mirror, which is the metal film behind it.",
        ],
        "interaction": "Which is why a chipped mirror goes black, not clear.",
        "tags": ["materials", "everyday mysteries"],
    },
    {
        "question": "Why does a microwave heat the food but not the plate?",
        "steps": [
            "Microwaves are tuned to a frequency that water molecules absorb strongly.",
            "The molecules are flipped back and forth billions of times a second, and that agitation is heat.",
            "Ceramic and glass hold almost no free water, so the radiation passes through them.",
            "When the plate is hot anyway, it was warmed by the food sitting on it — not by the oven.",
        ],
        "tags": ["physics", "everyday mysteries"],
    },
    {
        "question": "Why does Swiss cheese have holes?",
        "steps": [
            "Bacteria in the cheese give off carbon dioxide as they feed.",
            "But gas alone doesn't make a hole — it needs somewhere to start collecting.",
            "In 2015 Swiss researchers found the trigger: microscopic specks of hay that fall into the milk during milking.",
            "As dairies got cleaner, less hay fell in, and the famous holes started shrinking. The holes were an accident of a dirtier process.",
        ],
        "interaction": "Nobody put them there on purpose.",
        "tags": ["food", "science"],
    },
    {
        "question": "How does a plane actually stay up?",
        "steps": [
            "Not the way most of us were taught. The story about air splitting and having to 'meet up' at the back is wrong — NASA says so explicitly.",
            "The wing throws a large mass of air downwards, and the air pushes the wing up in return.",
            "The curved shape and the tilt of the wing both help it deflect more air, more efficiently.",
            "A plane flies for the same reason a hand out of a car window lifts when you angle it. It is pushing air down.",
        ],
        "interaction": "The version taught in school predicts far less lift than planes actually produce.",
        "tags": ["physics", "flight"],
    },
    {
        "question": "How do they get the stripes into striped toothpaste?",
        "steps": [
            "The tube holds the pastes in separate compartments, already coloured.",
            "They meet only at the very end, inside the nozzle, where narrow channels feed the coloured paste around the white.",
            "Toothpaste is thick enough that the colours don't blend in the second they travel together.",
            "Squeeze the tube at the bottom and the stripes still appear. They are being assembled at the exit, every time.",
        ],
        "tags": ["design", "everyday mysteries"],
    },
    {
        "question": "If watermelons are seedless, where do the next ones come from?",
        "steps": [
            "They can't reproduce. Every seedless watermelon is grown from seed produced by other plants.",
            "Growers treat a normal plant with colchicine, which lets chromosomes copy but stops them separating — doubling the set.",
            "That doubled plant is crossed with a normal one, giving offspring with three sets of chromosomes.",
            "Three sets can't divide evenly into pollen and eggs, so the fruit never develops seeds. The plant is sterile, and that sterility is the product.",
        ],
        "tags": ["biology", "food"],
    },
    {
        "question": "How does anaesthesia switch off consciousness?",
        "steps": [
            "Honestly: nobody is certain, and that is the interesting part.",
            "We know anaesthetics disrupt how neurons signal, shifting the ions that let cells fire.",
            "Beyond that, researchers still argue between a 'bottom-up' account — the drugs hijack the brain's own sleep circuitry — and a 'top-down' one, where they break the cortex's ability to integrate information.",
            "Millions of people are safely rendered unconscious every year using a mechanism we can reliably produce and cannot fully explain.",
        ],
        "interaction": "It works. We're still arguing about why.",
        "tags": ["medicine", "mind"],
    },
    {
        "question": "How does a fridge make things cold?",
        "steps": [
            "It doesn't make cold. There is no such thing to make — it moves heat out.",
            "A liquid refrigerant is allowed to expand and evaporate inside the fridge, and evaporating takes heat from its surroundings.",
            "The gas is pumped outside and compressed, which forces that heat back out through the coils at the back.",
            "Your kitchen is very slightly warmer because your food is colder. A fridge is a heat pump pointed inwards.",
        ],
        "interaction": "Feel the back of yours. That's your dinner's heat.",
        "tags": ["physics", "everyday mysteries"],
    },
    {
        "question": "How does soap actually clean anything?",
        "steps": [
            "A soap molecule has two ends that want opposite things: one is drawn to water, the other to oil.",
            "Dropped into greasy water, the oil-loving ends bury themselves in the grease and the water-loving ends face out.",
            "The grease ends up trapped inside a ball of soap molecules, with a water-friendly surface.",
            "Rinsing carries the whole package away. Soap doesn't dissolve dirt — it wraps it in something water can hold on to.",
        ],
        "tags": ["chemistry", "everyday mysteries"],
    },
    {
        "question": "How do they get the fizz into a fizzy drink?",
        "steps": [
            "Carbon dioxide is forced into the liquid under pressure. Under enough pressure, far more gas will dissolve than the liquid would normally hold.",
            "The bottle is sealed while still pressurised, and the gas has nowhere to go.",
            "Opening it drops the pressure instantly, and the liquid can no longer keep all that gas dissolved.",
            "The bubbles you see are the drink returning to normal. Flat cola isn't spoiled — it's finished.",
        ],
        "tags": ["chemistry", "food"],
    },
    {
        "question": "How does a touchscreen know it's your finger and not your glove?",
        "steps": [
            "Under the glass is a grid of transparent electrodes holding a small electrical charge.",
            "Your body conducts electricity, so bringing a finger close distorts the field at that point.",
            "The phone reads which row and column changed, and calls that a touch.",
            "A woollen glove doesn't conduct, so nothing changes and nothing happens. Touchscreen gloves have conductive thread sewn into the fingertips.",
        ],
        "interaction": "The screen never feels pressure. It feels you.",
        "tags": ["technology", "everyday mysteries"],
    },
    {
        "question": "How does your phone know where you are?",
        "steps": [
            "Satellites overhead each broadcast the same thing: an extremely precise statement of the current time.",
            "Your phone compares how long each signal took to arrive. Longer means further away.",
            "One satellite puts you on a sphere, two on a circle, three on a couple of points. Four pins you down and fixes your clock.",
            "The satellites' clocks run measurably fast compared to ours because of relativity. If that weren't corrected for, the system would drift wrong within a day.",
        ],
        "tags": ["technology", "space"],
    },
    {
        "question": "How does a compass find north?",
        "steps": [
            "The needle is a small magnet, balanced so it can turn freely.",
            "Earth's molten outer core generates a magnetic field, and the needle swings until it lines up with it.",
            "It points to magnetic north, which is not the north pole on the map — the two can be a long way apart.",
            "Magnetic north also wanders. Charts have to be updated as it moves, which it has been doing rather briskly.",
        ],
        "tags": ["earth", "navigation"],
    },
    {
        "question": "How does bread rise?",
        "steps": [
            "Yeast is alive. Fed with the sugars in flour, it gives off carbon dioxide.",
            "Kneading develops gluten into a stretchy network, which traps those bubbles instead of letting them escape.",
            "Warmth speeds the yeast up; the dough inflates from thousands of tiny pockets of gas.",
            "The oven kills the yeast early on, but the trapped gas expands in the heat and the crumb sets around it. The holes in a slice are a fossil record of the gas.",
        ],
        "tags": ["food", "biology"],
    },
    {
        "question": "How do fireworks make specific colours?",
        "steps": [
            "The colour is chemistry, not dye. Different metal salts are packed into the shell.",
            "Heat excites the electrons in those metals to a higher energy level.",
            "When they fall back, they release the surplus as light — and each metal releases it at its own wavelength.",
            "Strontium gives red, copper blue, sodium yellow, barium green. Blue is notoriously the hardest to get bright, which is why it's the one that always looks a bit thin.",
        ],
        "tags": ["chemistry", "light"],
    },
    {
        "question": "How does a battery push electricity?",
        "steps": [
            "Two different materials sit in an electrolyte, and one of them holds its electrons more loosely than the other.",
            "Chemistry wants to even that out, but the electrolyte lets ions through while blocking electrons.",
            "The only route left for the electrons is the long way around — out of the battery, through your device, and back in.",
            "A flat battery isn't empty. The chemistry has simply reached the balance it was trying to reach all along.",
        ],
        "tags": ["chemistry", "technology"],
    },
    {
        "question": "How do they know how old a fossil is?",
        "steps": [
            "Certain elements decay into others at a rate that nothing — heat, pressure, chemistry — meaningfully changes.",
            "Measure how much of the original remains against how much of the product has built up.",
            "The ratio gives the elapsed time, because the decay rate is known.",
            "Different clocks suit different ages: carbon runs out after tens of thousands of years, so anything older is dated from the rock around it, not the bone.",
        ],
        "tags": ["science", "time"],
    },
    {
        "question": "How does a key open a lock?",
        "steps": [
            "Inside the lock is a row of small pin stacks, each cut into two pieces at a different height.",
            "With no key in, the pins straddle the gap between the barrel and its housing, jamming it.",
            "The ridges on the key lift each stack by exactly the right amount, so every split lines up with that gap.",
            "Now nothing crosses the boundary, and the barrel turns. The key isn't unlocking anything — it's making a straight line out of a row of interruptions.",
        ],
        "tags": ["design", "everyday mysteries"],
    },
    {
        "question": "How does Wi-Fi get through a wall?",
        "steps": [
            "Wi-Fi is radio — the same kind of wave as light, just far longer and far lower in energy.",
            "Plaster and wood are effectively see-through at that wavelength, in the way glass is see-through to visible light.",
            "Water and metal are not. They absorb or reflect the signal, which is why a fish tank, a mirror or a foil-lined wall kills a connection dead.",
            "A router struggling across your flat isn't weak. It's being eaten by the specific things in the way.",
        ],
        "tags": ["technology", "physics"],
    },
    {
        "question": "How do they dig a tunnel under a river without it flooding?",
        "steps": [
            "A boring machine works with its cutting face sealed and pressurised, pushing back against the water and soil ahead of it.",
            "The pressure at the front is balanced against what the ground is pushing in with — too little and it floods, too much and the riverbed lifts.",
            "Spoil is carried back through the machine while it inches forward.",
            "Concrete segments are bolted into a ring immediately behind the cutter, so the tunnel is permanently lined before anyone stands in it.",
        ],
        "tags": ["engineering", "everyday mysteries"],
    },
    {
        "question": "How does a barcode hold information in some lines?",
        "steps": [
            "The digits are encoded in the widths — of the bars and equally of the white gaps between them.",
            "The scanner sweeps a beam across and measures how the reflection changes, dark to light and back.",
            "Guard patterns at each end tell the reader where the code starts, stops, and which way round it is — which is why direction doesn't matter.",
            "The last digit is calculated from the others. If they disagree, the scanner refuses rather than guessing, which is the beep you don't hear.",
        ],
        "tags": ["technology", "design"],
    },
    {
        "question": "Why is glass transparent when sand isn't?",
        "steps": [
            "Light passes through a material only if its photons can't hand their energy to the electrons inside.",
            "In glass, the available energy steps are too big for visible light to climb, so the photons carry straight on through.",
            "Ultraviolet has enough energy to be absorbed, which is why you don't tan through a window.",
            "Sand is the same substance, but a heap of tiny grains scatters light at every surface. Melting it removes the surfaces, not the chemistry.",
        ],
        "interaction": "Crush glass fine enough and it goes white again.",
        "tags": ["materials", "light"],
    },
    {
        "question": "How does a plant know which way is up?",
        "steps": [
            "Special cells in the root and shoot contain dense starch grains heavy enough to sink.",
            "Whichever way the plant is turned, the grains settle to the bottom of those cells within minutes.",
            "The cell registers where they've landed and redistributes growth hormone accordingly.",
            "One side then grows faster than the other, bending the plant. Lay a seedling on its side in total darkness and it still turns upward — it is feeling gravity, not looking for light.",
        ],
        "tags": ["biology", "nature"],
    },
    {
        "question": "How do they make chocolate smooth instead of gritty?",
        "steps": [
            "Raw ground cocoa and sugar are coarse enough for your tongue to register every particle.",
            "The mixture goes into a conche, which rolls and grinds it for hours, sometimes days.",
            "The particles are worn down until they fall below the size your mouth can detect, and the whole mass turns fluid.",
            "The long grind also drives off harsh volatile compounds. Cheap chocolate is often just chocolate that wasn't conched for long enough.",
        ],
        "tags": ["food", "craft"],
    },
]


async def populate():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    try:
        questions = [item["question"] for item in EXPLAINER]
        removed = await db.explainer_content.delete_many({"question": {"$in": questions}})
        for data in EXPLAINER:
            await db.explainer_content.insert_one({
                **data,
                "id": str(uuid.uuid4()),
                "type": "explainer",
                "rarity": data.get("rarity", "common"),
                "tags": data.get("tags", []),
                "created_at": datetime.utcnow(),
            })
        total = await db.explainer_content.count_documents({})
        print(f"  explainer_content               +{len(EXPLAINER):3d} new "
              f"(replaced {removed.deleted_count}) -> {total} total")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(populate())
