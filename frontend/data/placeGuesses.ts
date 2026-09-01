// Where On Earth — one photograph of somewhere real and improbable; the
// decoys are places you could plausibly mistake it for. The reveal is the
// place's story, held to the content bar: real numbers, names and dates.
//
// Every story was verified against live sources on 2026-09-01, and every
// photo is Wikimedia Commons with the license confirmed ON THE FILE PAGE
// (the free-image tools all failed the commercial-use audit; Commons with
// credit is the one imagery source that passed). Keep the credit and
// source_link fields intact — they are the license compliance.

export interface PlaceGuess {
  id: string;
  image_url: string;
  /** The correct place, as displayed. */
  answer: string;
  decoys: string[];
  /** The payoff: the place's story. */
  story: string;
  /** Author + license, shown after the reveal. */
  credit: string;
  /** The Commons file page. */
  source_link: string;
}

export const PLACE_GUESSES: PlaceGuess[] = [
  {
    id: 'setenil',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/c/cd/Setenil_de_las_Bodegas_Cadiz_Spain.jpg',
    answer: 'Setenil de las Bodegas, Spain',
    decoys: ['Matera, Italy', 'Ronda, Spain', 'Bonifacio, France'],
    story:
      'The village runs underneath an overhanging limestone cliff — each house builds three walls and lets the rock be the roof. The name comes from the Latin septem nihil, “seven times nothing,” for the seven sieges the town shrugged off before falling on the eighth, in 1484. Under the rock it stays around 15–20°C while the street outside hits 42.',
    credit: 'Photo: Jialiang Gao · CC BY-SA 2.5 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:Setenil_de_las_Bodegas_Cadiz_Spain.jpg',
  },
  {
    id: 'spotted-lake',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Spotted_Lake_Osoyoos.JPG',
    answer: 'Spotted Lake, Canada',
    decoys: ['Laguna Colorada, Bolivia', 'Great Salt Lake, USA', 'Dead Sea, Jordan'],
    story:
      'Each summer the lake evaporates into hundreds of separate mineral pools — some of the densest Epsom-salt water on Earth. The Syilx people call it kłlilx’w, a sacred place; during the First World War its salts were mined for explosives. In 2001 the Okanagan Nation bought the lake back to protect it.',
    credit: 'Photo: Mykola Swarnyk · CC BY-SA 3.0 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:Spotted_Lake_Osoyoos.JPG',
  },
  {
    id: 'socotra',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Socotra_dragon_tree.JPG',
    answer: 'Socotra, Yemen',
    decoys: [
      'Joshua Tree National Park, USA',
      'Avenue of the Baobabs, Madagascar',
      'Wadi Rum, Jordan',
    ],
    story:
      'Dragon’s blood trees grow on this one archipelago and nowhere else on Earth. Single trees live past 300 years, and their red resin has been traded as “dragon’s blood” — dye, medicine, varnish — since antiquity. Roughly 80,000 remain.',
    credit: 'Photo: Boris Khvostichenko · CC BY-SA 4.0 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:Socotra_dragon_tree.JPG',
  },
  {
    id: 'darvaza',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/7/7f/Darvaza_gas_crater%2C_J%C3%A4hennem_derwezesi%2C_Door_to_Hell%2C_Gates_of_Hell%2C_Derweze%2C_Turkmenistan.jpg',
    answer: 'Darvaza gas crater, Turkmenistan',
    decoys: ['Danakil Depression, Ethiopia', 'Mount Yasur, Vanuatu', 'Kīlauea, USA'],
    story:
      'Soviet geologists drilling for gas hit a cavern that swallowed their rig, and lit the leak expecting it to burn off in days. The crater — 69 metres across — has now been burning for around half a century. Turkmenistan kept no official record of the accident; even the year it started is disputed.',
    credit: 'Photo: Benjamin Goetzinger · CC BY-SA 4.0 · Wikimedia Commons',
    source_link:
      'https://commons.wikimedia.org/wiki/File:Darvaza_gas_crater,_J%C3%A4hennem_derwezesi,_Door_to_Hell,_Gates_of_Hell,_Derweze,_Turkmenistan.jpg',
  },
  {
    id: 'coober-pedy',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Coober_Pedy_underground_house.jpg',
    answer: 'Coober Pedy, Australia',
    decoys: ['Cappadocia, Turkey', 'Matmata, Tunisia', 'Petra, Jordan'],
    story:
      'An opal-mining town where roughly half the population lives underground, in “dugouts” carved from old mine tunnels that hold a steady 23°C under the desert. The first opal here was found in 1915 by a fourteen-year-old. The town’s name comes from kupa-piti — “the white man’s hole.”',
    credit: 'Photo: Nachoman-au · CC BY-SA 3.0 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:Coober_Pedy_underground_house.jpg',
  },
  {
    id: 'huacachina',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Oasis_Huacachina.JPG',
    answer: 'Huacachina, Peru',
    decoys: ['Siwa Oasis, Egypt', 'Sossusvlei, Namibia', 'Chebika, Tunisia'],
    story:
      'South America’s only natural desert oasis: a two-acre lagoon ringed with palms, fed by groundwater seeping up through the dunes. Farming drew the aquifer down so far that the lagoon now has to be topped up by pump to keep existing.',
    credit: 'Photo: Charles Gadbois · CC BY 3.0 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:Oasis_Huacachina.JPG',
  },
  {
    id: 'zhangye',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/d/d8/Colourful_mountains_of_the_Zhangye_National_Geopark.jpg',
    answer: 'Zhangye Danxia, China',
    decoys: ['Vinicunca, Peru', 'Painted Hills, USA', 'Kelimutu, Indonesia'],
    story:
      'More than twenty-four million years of layered mineral sediment, buckled upward by tectonic collision and carved by wind and water into striped ridges. The red is hematite — iron, rusting in plain sight.',
    credit: 'Photo: Terry Wu · CC BY-SA 2.0 · Wikimedia Commons',
    source_link:
      'https://commons.wikimedia.org/wiki/File:Colourful_mountains_of_the_Zhangye_National_Geopark.jpg',
  },
  {
    id: 'natron',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/7/74/Flamingos_at_Lake_Natron%2C_Tanzania.jpg',
    answer: 'Lake Natron, Tanzania',
    decoys: ['Lake Bogoria, Kenya', 'Lake Magadi, Kenya', 'Laguna Colorada, Bolivia'],
    story:
      'The water reaches pH 12 and 60°C — birds that stray in can calcify. It is also where roughly 2.5 million lesser flamingos breed, protected by the same water that kills nearly everything else.',
    credit: 'Photo: Christoph Strässler · CC BY-SA 2.0 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:Flamingos_at_Lake_Natron,_Tanzania.jpg',
  },
  {
    id: 'chand-baori',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/e/e6/Chand_Baori_%28step-well%29.JPG',
    answer: 'Chand Baori, India',
    decoys: ['Rani ki Vav, India', 'Agrasen ki Baoli, India', 'Adalaj stepwell, India'],
    story:
      'A ninth-century stepwell descending thirteen storeys through roughly 3,500 symmetrical steps — a monsoon reservoir that doubled as the coolest room in the Rajasthan desert.',
    credit: 'Photo: Chetan · CC BY-SA 3.0 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:Chand_Baori_(step-well).JPG',
  },
  {
    id: 'ijen',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/f/f8/The_blue_fire_of_Kawah_Ijen_1.jpg',
    answer: 'Kawah Ijen, Indonesia',
    decoys: ['Dallol, Ethiopia', 'Mount Bromo, Indonesia', 'Poás Volcano, Costa Rica'],
    story:
      'At night, sulfur gases escaping at up to 600°C ignite on contact with air and burn electric blue — not lava, just burning gas, gone by sunrise. The crater also holds the most acidic large lake on Earth, and miners still hand-carry 90-kilo loads of sulfur up its paths.',
    credit: 'Photo: Thomas Fuhrmann · CC BY-SA 4.0 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:The_blue_fire_of_Kawah_Ijen_1.jpg',
  },
  {
    id: 'fly-geyser',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Fly_Geyser%2C_Nevada.jpg',
    answer: 'Fly Geyser, USA',
    decoys: ['Grand Prismatic Spring, USA', 'Hverir, Iceland', 'El Tatio, Chile'],
    story:
      'Not natural. A geothermal test well drilled in 1964 was left badly capped, and the escaping water has been building this mound ever since — inches of mineral deposit a year, painted red and green by heat-loving algae. The Burning Man Project bought the ranch it stands on in 2016.',
    credit: 'Photo: Ken Lund · CC BY-SA 2.0 · Wikimedia Commons',
    source_link: 'https://commons.wikimedia.org/wiki/File:Fly_Geyser,_Nevada.jpg',
  },
  {
    id: 'dallol',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/Dallol_Salt_Pan_in_the_Danakil_Desert%2C_Ethiopia.jpg',
    answer: 'Dallol, Ethiopia',
    decoys: ['Kawah Ijen, Indonesia', 'Grand Prismatic Spring, USA', 'Salar de Uyuni, Bolivia'],
    story:
      'The hottest inhabited place on Earth by annual average — 34.6°C — sitting 125 metres below sea level. The neon terraces are acid springs dissolving buried salt and oxidizing at the surface. Astrobiologists study it as a stand-in for Mars.',
    credit: 'Photo: Barrowbob · CC BY-SA 4.0 · Wikimedia Commons',
    source_link:
      'https://commons.wikimedia.org/wiki/File:Dallol_Salt_Pan_in_the_Danakil_Desert,_Ethiopia.jpg',
  },
  {
    id: 'cano-cristales',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/9/99/Ca%C3%B1o_Cristales%2C_Colombia_%2824867367037%29.jpg',
    answer: 'Caño Cristales, Colombia',
    decoys: ['Cenote Angelita, Mexico', 'Havasu Falls, USA', 'Plitvice Lakes, Croatia'],
    story:
      'For a few weeks between seasons the riverbed turns red, yellow, green and blue — an aquatic plant that exists in this one river blooms crimson only at a precise depth and light. The river spent decades closed to visitors during Colombia’s civil conflict.',
    credit: 'Photo: Pedro Szekely · CC BY-SA 2.0 · Wikimedia Commons',
    source_link:
      'https://commons.wikimedia.org/wiki/File:Ca%C3%B1o_Cristales,_Colombia_(24867367037).jpg',
  },
  {
    id: 'racetrack',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/2/20/Racetrack_Playa_in_Death_Valley_National_Park.jpg',
    answer: 'Racetrack Playa, USA',
    decoys: ['Bonneville Salt Flats, USA', 'Salar de Uyuni, Bolivia', 'Rann of Kutch, India'],
    story:
      'Rocks up to 300 kilos slide across this dry lakebed leaving long trails, and for decades no one ever saw one move. In 2013 researchers GPS-tagged fifteen rocks and caught it: overnight rain freezes into thin ice panels, and a light wind shoves the panels — rocks and all — across the mud.',
    credit: 'Photo: Laurence G. Charlot · CC BY-SA 4.0 · Wikimedia Commons',
    source_link:
      'https://commons.wikimedia.org/wiki/File:Racetrack_Playa_in_Death_Valley_National_Park.jpg',
  },
];
