// One-off repair: rewrite clue 2 and clue 3 wherever they contained the answer
// or an accepted alias verbatim (an instant win on guess 2 or 3).
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, '../src/data/puzzles.json');
const puzzles = JSON.parse(readFileSync(path, 'utf8'));

// index 0-based clue index -> replacement text
const REPLACEMENTS = {
  '2026-06-26': { 1: 'She was born in Warsaw in 1867, the fifth child of two teachers, at a time when Poland did not exist as an independent state on the map of Europe.' },
  '2026-07-06': { 1: 'Its true source was debated for centuries until explorers John Hanning Speke and Richard Burton famously argued over whether a great equatorial lake was the real origin, ending their friendship.' },
  '2026-07-08': { 2: "Khufu's monument held the record as the tallest man-made structure on Earth for roughly 3,800 years, until a European cathedral spire finally surpassed it in the 14th century." },
  '2026-07-17': { 1: 'Giorgio Vasari, writing decades later, was the first to identify its sitter as the wife of a Florentine silk merchant, though some historians argue the true subject may have been someone else entirely.' },
  '2026-07-22': { 1: "The 1953 paper announcing its structure ran barely a single page, ending with a now-famous understated line noting that the pairing scheme \"has not escaped our notice\" as suggesting how genetic material copies itself." },
  '2026-07-23': { 2: "A deathbed line often attributed to him — \"I have not told half of what I saw\" — supposedly answered friends who urged him to recant his outlandish travel stories." },
  '2026-07-29': { 1: "Ancient Chinese records dating back as far as 2600 BC may contain the oldest known written descriptions of the phenomenon, referring to it as 'fire in the sky.'" },
  '2026-07-30': { 1: "Daredevil Jean François Gravelet, performing as 'The Great Blondin,' crossed the gorge on a tightrope in 1859, once carrying his manager on his back and once stopping midway to cook an omelette." },
  '2026-07-31': { 1: 'A granite tablet erected between its paws by Pharaoh Thutmose IV describes a dream in which the statue itself promised him the throne of Egypt if he cleared away the sand burying it.' },
  '2026-08-18': { 1: 'Its central step-pyramid has 365 steps in total — 91 on each of four staircases, plus the summit platform — matching the days of the solar year.' },
  '2026-08-22': {
    1: 'Its indigenous people developed one of the only pre-contact writing systems in Oceania, a script called rongorongo that remains undeciphered to this day.',
    2: 'Ecological collapse driven by deforestation — needed to move and erect its massive stone statues — is widely cited as a factor in the population\'s dramatic decline before European contact.',
  },
  '2026-08-25': { 1: 'Ancient manuscripts including the oldest known surviving copies of the Hebrew Bible were found by chance in nearby caves between 1946 and 1956, after a shepherd searching for a stray goat tossed a rock into a cave and heard something shatter.' },
  '2026-08-27': { 1: 'One of its images, capturing a seemingly empty patch of sky in 1995, revealed roughly 3,000 previously unknown galaxies hidden in what had looked like total darkness from the ground.' },
  '2026-08-30': { 1: 'A temple on its northern slope features a porch held up by six carved female figures called Caryatids; the originals were moved to a nearby museum to protect them from air pollution.' },
  '2026-09-01': { 1: "His full baptismal name contains 23 words honoring a string of saints and relatives, but he settled on a short surname from his mother's side because his father's surname was extremely common in Spain." },
  '2026-09-02': { 1: "It became an independent sovereign state under a 1929 treaty between the Papacy and Mussolini's Italian government, ending a standoff that had lasted since Italian unification in 1870." },
  '2026-09-08': {
    1: 'It is actually a composite of three overlapping volcanic cones built up in successive eruptive periods over several hundred thousand years, with the youngest cone forming the summit seen today.',
    2: 'Its summit is officially owned by a Shinto shrine at its base, which claims all land above roughly the eighth station rather than the Japanese government.',
  },
  '2026-09-21': { 1: 'He never patented any of his inventions — including the lightning rod, bifocal glasses, and a wood stove of his own design — believing useful inventions should be shared freely.' },
  '2026-10-06': { 2: 'His 1845 autobiography was so eloquently and powerfully written that many white readers refused to believe a formerly enslaved man could have authored it himself.' },
  '2026-10-07': { 1: 'The 1919 treaty that ended World War I and imposed harsh terms on Germany — terms many historians blame for contributing to World War II — was signed inside its Hall of Mirrors.' },
  '2026-10-11': {
    1: "The term used for this practice today comes from the Latin word for cow, 'vacca' — a nod to the cowpox material Edward Jenner used after noticing milkmaids who caught cowpox seemed immune to the far deadlier smallpox.",
    2: "Louis Pasteur expanded the underlying concept in the 1880s, developing immunizations against chicken cholera, anthrax, and rabies, and coined the field's modern name in tribute to Jenner's original work.",
  },
  '2026-10-12': { 1: 'Victor Hugo wrote a wildly popular 1831 novel centered on a deformed bell-ringer, deliberately hoping the public sympathy it stirred would halt years of civic neglect and a threatened demolition.' },
  '2026-10-18': { 2: 'A New York lawyer visiting the area in 1885 asked a local guide what the granite peak was called; the guide admitted it had no name, so the group decided on the spot to name it after him.' },
  '2026-10-20': { 1: 'She never married despite numerous proposals, including from King Philip II of Spain, and her choice to die childless ended the Tudor dynasty outright.' },
  '2026-10-26': { 1: 'A new volcanic island rose from its collapsed caldera in 1927 and has continued erupting intermittently ever since, including a 2018 flank collapse that triggered a deadly tsunami.' },
  '2026-10-31': { 2: 'The image showed a supermassive object at the center of galaxy Messier 87 containing roughly 6.5 billion times the mass of our Sun, matching a decades-old theoretical prediction almost exactly.' },
  '2026-11-03': { 2: 'A test he proposed in 1950 — in which a machine must convince a human judge it is also human through conversation alone — remains the most famous benchmark for artificial intelligence.' },
  '2026-11-08': { 2: 'The American writer Washington Irving lived inside its abandoned halls for several months in 1829, and the resulting travelogue helped reintroduce the site to Western audiences after centuries of neglect.' },
  '2026-11-13': { 1: 'One of the pair crossed into interstellar space in August 2012, becoming the first human-made object ever to leave the bounds of the solar system, over 14 billion miles from home.' },
  '2026-11-17': { 1: 'A British computer scientist working at a European particle physics laboratory proposed a global hypertext system in 1989, letting researchers link documents together regardless of which computer stored them.' },
  '2026-12-05': { 1: "The famous wooden-horse deception does not actually appear in the Iliad at all — it's described in the Odyssey and later Roman sources; the Iliad itself ends before the city ever falls, with the return of Hector's body." },
  '2026-12-09': { 2: 'A simple system of visual diagrams he invented to represent subatomic particle interactions revolutionized particle physics by making quantum field theory calculations vastly more intuitive.' },
};

let changed = 0;
for (const [date, byIndex] of Object.entries(REPLACEMENTS)) {
  if (!puzzles[date]) throw new Error(`No puzzle for ${date}`);
  for (const [idx, text] of Object.entries(byIndex)) {
    puzzles[date].clues[Number(idx)] = text;
    changed++;
  }
}

writeFileSync(path, JSON.stringify(puzzles, null, 2) + '\n');
console.log(`Rewrote ${changed} clues (clue 2 / clue 3) across ${Object.keys(REPLACEMENTS).length} puzzles.`);
