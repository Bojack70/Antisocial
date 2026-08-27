// Event pool for The Timeline game. Years are astronomical-ish: negative = BC.
// Every event is a well-documented historical date. The `detail` line is the
// payoff shown on reveal — it should be retellable on its own.

export interface TimelineEvent {
  name: string;
  year: number;
  detail: string;
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { name: 'The Great Pyramid of Giza is completed', year: -2560, detail: 'It was the tallest human-made structure for 3,800 years.' },
  { name: 'The last woolly mammoths die out', year: -2000, detail: 'A herd survived on Wrangel Island long after the pyramids were built.' },
  { name: 'Tutankhamun becomes pharaoh', year: -1332, detail: 'He was about nine years old at the time.' },
  { name: 'The first recorded Olympic Games are held', year: -776, detail: 'The only event was a single sprint race.' },
  { name: 'Rome is founded, according to legend', year: -753, detail: 'The date comes from Roman historians counting backwards.' },
  { name: 'Confucius is born', year: -551, detail: 'His family line is still documented today, over 80 generations later.' },
  { name: 'Julius Caesar is assassinated', year: -44, detail: 'On the Ides of March, by around 60 conspirators.' },
  { name: 'Cleopatra dies', year: -30, detail: 'She lived closer in time to the Moon landing than to the Great Pyramid.' },
  { name: 'Pompeii is buried by Mount Vesuvius', year: 79, detail: 'The city stayed lost for about 1,500 years.' },
  { name: 'The Colosseum opens in Rome', year: 80, detail: 'Opening ceremonies reportedly lasted 100 days.' },
  { name: 'Paper is invented in China', year: 105, detail: 'Europe kept writing on animal skin for another millennium.' },
  { name: 'Baghdad is founded', year: 762, detail: 'Within a century it was among the largest cities on Earth.' },
  { name: 'Oxford University begins teaching', year: 1096, detail: 'Older than the Aztec Empire.' },
  { name: 'The Magna Carta is signed', year: 1215, detail: 'King John annulled it within ten weeks. It stuck anyway.' },
  { name: 'Tenochtitlan, the Aztec capital, is founded', year: 1325, detail: 'Built on an island in a lake, connected by causeways.' },
  { name: 'The Black Death reaches Europe', year: 1347, detail: 'It arrived on twelve Genoese trading ships.' },
  { name: 'Machu Picchu is built', year: 1450, detail: 'Abandoned barely a century later.' },
  { name: 'Gutenberg prints his Bible', year: 1455, detail: 'About 180 copies. Roughly 49 survive.' },
  { name: 'Columbus reaches the Americas', year: 1492, detail: 'He believed he had reached Asia, and never accepted otherwise.' },
  { name: 'Leonardo paints the Mona Lisa', year: 1503, detail: 'It was stolen in 1911 — the theft made it famous.' },
  { name: 'Shakespeare writes Hamlet', year: 1600, detail: 'His son, who died young, was named Hamnet.' },
  { name: 'Galileo points a telescope at the night sky', year: 1609, detail: 'Within months he found the moons of Jupiter.' },
  { name: 'Harvard is founded', year: 1636, detail: 'Before calculus was invented.' },
  { name: 'Newton publishes the Principia', year: 1687, detail: 'He wrote it in Latin, partly to keep amateurs away.' },
  { name: 'The US Declaration of Independence is signed', year: 1776, detail: 'Most delegates actually signed it in August.' },
  { name: 'The French Revolution begins', year: 1789, detail: 'The Bastille held only seven prisoners when it was stormed.' },
  { name: 'Napoleon is defeated at Waterloo', year: 1815, detail: 'The battle lasted a single day.' },
  { name: 'The first photograph of a person is taken', year: 1838, detail: 'A man getting his boots shined — the only figure still enough to appear.' },
  { name: 'The fax machine is patented', year: 1843, detail: '33 years before the telephone.' },
  { name: 'Darwin publishes On the Origin of Species', year: 1859, detail: 'The first print run sold out to booksellers on day one.' },
  { name: 'The telephone is patented', year: 1876, detail: 'Decades after the fax machine.' },
  { name: 'Nintendo is founded', year: 1889, detail: 'As a handmade playing-card company in Kyoto.' },
  { name: 'The first modern Olympics are held in Athens', year: 1896, detail: 'Winners received silver medals, not gold.' },
  { name: 'The Wright brothers fly at Kitty Hawk', year: 1903, detail: 'The first flight was shorter than a Boeing 747’s wingspan.' },
  { name: 'The Titanic sinks', year: 1912, detail: 'The ship’s band reportedly played until the end.' },
  { name: 'The Great Molasses Flood hits Boston', year: 1919, detail: 'A 50-foot wave of syrup moving at 35 mph.' },
  { name: 'Insulin is first used to treat diabetes', year: 1922, detail: 'The patent was sold for one dollar.' },
  { name: 'Penicillin is discovered', year: 1928, detail: 'By accident, in a dish Fleming forgot to clean.' },
  { name: 'Sliced bread is first sold', year: 1928, detail: 'Marketed as the greatest thing since bagged bread.' },
  { name: 'The Empire State Building is completed', year: 1931, detail: 'Built in about 410 days.' },
  { name: 'Australia fights the Great Emu War', year: 1932, detail: 'The emus won.' },
  { name: 'The Golden Gate Bridge opens', year: 1937, detail: 'Its paint color was meant to be temporary.' },
  { name: 'The microwave oven is invented', year: 1945, detail: 'After a radar engineer noticed a melted chocolate bar in his pocket.' },
  { name: 'Everest is first summited', year: 1953, detail: 'Hillary and Norgay spent about 15 minutes at the top.' },
  { name: 'Sputnik is launched', year: 1957, detail: 'It was the size of a beach ball and beeped for three weeks.' },
  { name: 'Humans land on the Moon', year: 1969, detail: 'The computer that got them there had less memory than an email.' },
  { name: 'The first email is sent', year: 1971, detail: 'Its inventor later said the message was probably QWERTYUIOP.' },
  { name: 'Star Wars premieres', year: 1977, detail: 'France was still executing people by guillotine that year.' },
  { name: 'The Sony Walkman goes on sale', year: 1979, detail: 'Critics doubted anyone wanted music while walking.' },
  { name: 'The World Wide Web is proposed', year: 1989, detail: 'The memo was labeled "vague but exciting" by its author’s boss.' },
  { name: 'The first text message is sent', year: 1992, detail: 'It said "Merry Christmas".' },
  { name: 'Google is founded', year: 1998, detail: 'In a garage its founders rented from a future YouTube CEO.' },
  { name: 'Wikipedia launches', year: 2001, detail: 'The plan was for experts to write it. Everyone else showed up instead.' },
  { name: 'The iPhone is unveiled', year: 2007, detail: 'The demo units barely worked — the presentation followed a rehearsed "golden path".' },
];

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year < 1000) return `AD ${year}`;
  return `${year}`;
}
