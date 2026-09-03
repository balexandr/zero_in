// One-off repair: rewrite clue 1 for puzzles where the opening clue gave the answer away.
// Two failure modes were fixed:
//   (a) the answer or an accepted alias appeared verbatim in clue 1 (instant win on guess 1)
//   (b) no literal leak, but clue 1 stated the single fact the subject is most famous for
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, '../src/data/puzzles.json');
const puzzles = JSON.parse(readFileSync(path, 'utf8'));

const REPLACEMENTS = {
  // --- verbatim answer/alias leaked in clue 1 ---
  '2026-07-08': "The workers' village excavated beside them in the 1990s held bakeries, breweries, and evidence of medical care, overturning the long-held belief that slaves did the building.",
  '2026-07-30': 'In 1848 an ice jam upstream halted the water entirely for about 30 hours, and residents walked out onto the exposed riverbed to collect artifacts.',
  '2026-08-02': 'He was not unusually short: a mix-up between French and English inches turned his 5\'7" height into 5\'2" in English accounts, seeding a psychological myth that still carries his name.',
  '2026-08-18': 'On the spring and autumn equinoxes, the setting sun throws a shadow down the northern staircase of its main step-pyramid, creating the illusion of a serpent descending.',
  '2026-08-24': 'He lost a public bet with Kip Thorne over whether Cygnus X-1 was truly what they thought, conceding in 1990 and paying up with a one-year magazine subscription.',
  '2026-08-29': "John Michell first proposed such objects in 1783, calling them 'dark stars' — bodies so massive that their own light could not escape them.",
  '2026-09-16': 'It fell silent for four years starting in 2017 during a major restoration, and its hands were repainted from black back to their original Prussian blue.',
  '2026-09-18': "Its spray plume can rise over 1,300 feet and be seen 30 miles away, and on nights around a full moon the mist produces a rare 'moonbow.'",
  '2026-09-30': "Thomas Newcomen's 1712 atmospheric version was so wasteful of fuel that it was practical only at collieries, where the coal that ran it was essentially free.",
  '2026-10-04': 'The US Army administered it for 32 years beginning in 1886 because civilian superintendents had proved unable to stop rampant poaching of its bison.',
  '2026-11-02': 'He adopted his pen name at age 13 to hide his writing from a disapproving father, borrowing it from a 19th-century Czech poet, and later made it his legal name.',
  '2026-11-13': 'Their route exploited a planetary alignment that recurs only about once every 176 years, using gravity assists to reach the outer planets on very little fuel.',
  '2026-11-27': 'German geographer Ferdinand von Richthofen coined its modern name in 1877; the merchants who actually traveled the network had no single term for it.',
  '2026-11-30': "His birth name was Aristocles, and the name history knows him by was a nickname meaning 'broad' — given either for his wrestler's shoulders or his wide forehead.",
  '2026-12-05': "Heinrich Schliemann's 1870s excavation of the site was so reckless that he dug straight through and destroyed the very layers belonging to the era he was hunting for.",
  '2026-12-12': 'She was created from a mammary gland cell at the Roslin Institute, and the research team picked her name as a joke about that anatomical origin.',
  '2026-12-23': 'At its peak a cargo plane touched down every 90 seconds around the clock, delivering more supplies daily by air than the blockaded city had previously received by rail.',
  '2026-12-28': 'A disastrous 1212 movement of young people from France and Germany, who set out to peacefully convert Muslims, ended with most dying en route or sold into slavery.',
  '2026-08-26': 'He threw his Olympic gold medal into the Ohio River after a Louisville restaurant refused to serve him — a story he himself later dismissed as a myth.',
  '2026-10-14': 'French soldiers unearthed it in 1799 while rebuilding a fort during an Egyptian campaign; Britain seized it two years later as a spoil of war.',
  '2026-10-28': "Its destruction is popularly blamed on Julius Caesar's 48 BC harbor fire, but ancient sources show the institution kept operating for centuries afterward.",

  // --- no literal leak, but clue 1 was the subject's single most famous fact ---
  '2026-07-19': 'A bag of small mission souvenirs he had quietly kept — including a fragment of wing fabric and propeller from the 1903 Wright Flyer — was found in his closet only after his death in 2012.',
  '2026-08-13': "He was allowed to leave Vienna in 1938 only after a large 'exit tax' was paid on his behalf, and was made to sign a statement that he had been treated well.",
  '2026-08-15': 'Its European inventor died in relative obscurity after losing his workshop and equipment to his financial backer, Johann Fust, in a 1455 lawsuit.',
  '2026-08-19': 'She was the only legitimate child of the poet Lord Byron, and her mother steered her into mathematics specifically to suppress any inherited poetic temperament.',
  '2026-08-21': "He was fired from a Kansas City newspaper early on, reportedly for 'lacking imagination and having no original ideas.'",
  '2026-08-23': 'Howard Florey and Ernst Chain, not its original discoverer, did the work that made it a usable drug; the first patient treated in 1941 died when supplies ran out.',
  '2026-09-07': 'Elisha Gray filed a patent caveat for a nearly identical device on the very same day in February 1876, triggering one of the most contested patent fights in history.',
  '2026-10-08': 'He was denied tenure at Harvard in 1968, partly because colleagues judged his public outreach unserious, and moved to Cornell instead.',
  '2026-10-11': 'Lady Mary Wortley Montagu brought the earlier practice of variolation to England in 1721 after watching women perform it in Ottoman Constantinople.',
  '2026-10-15': 'She had a mock peasant hamlet built on the palace grounds, complete with a working dairy, where she and her circle played at rustic country life.',
  '2026-10-19': 'He was the first sitting US president to leave the country while in office, sailing to Panama in 1906 to inspect construction of the canal.',
  '2026-11-05': 'After her best-known work she turned to virology, producing structural studies of tobacco mosaic virus that were displayed at the 1958 World\'s Fair in Brussels.',
  '2026-11-09': 'His 1859 swan-neck flask experiment let air reach the broth while trapping dust, disproving spontaneous generation; the original flasks remain sterile today.',
  '2026-11-17': 'Its underlying protocol suite was designed by Vint Cerf and Bob Kahn in 1974, but was not switched on across the entire network until January 1, 1983.',
  '2026-11-26': 'His security clearance was stripped in a 1954 hearing that ruined him publicly; the US government formally vacated that decision only in December 2022.',
  '2026-12-03': 'Japanese researchers first noticed the underlying mechanism in 1987 as a set of odd repeating sequences in E. coli DNA, with no idea what they were for.',
  '2026-12-04': 'A single enrichment plant in Tennessee consumed close to one percent of all the electricity generated in the United States during 1945.',
  '2026-12-09': 'He picked the locks on safes holding classified documents at Los Alamos as a running prank, leaving notes inside to prove the cabinets were insecure.',
  '2026-12-22': 'It maintained a private army of roughly 260,000 soldiers in the mid-19th century, about twice the size of the British Crown\'s own army.',
  '2026-12-24': 'Its Genbaku Dome survived almost directly beneath the detonation point because the shock wave traveled straight down, and it was preserved as a memorial in 1966.',
  '2026-12-25': 'Financier Bernard Baruch popularized the term for it in a 1947 speech, though George Orwell had already used the phrase in print two years earlier.',

  // --- second pass: clue 1 reused a word from the answer itself ---
  '2026-08-09': "Its modern ordering follows atomic number rather than atomic weight, a correction that came out of Henry Moseley's 1913 X-ray work and fixed several pairs sitting in the wrong slots.",
  '2026-10-29': 'A Spartan woman named Cynisca took the four-horse chariot title in 396 BC by owning and training the team, despite women being barred from attending on penalty of death.',
  '2026-11-06': 'Its thermal protection relied on roughly 24,000 silica tiles, each machined to a unique shape and fitted by hand, and tile damage destroyed one of the two orbiters that were lost.',
  '2026-12-20': "The storming of the Winter Palace in 1917 — later restaged as a heroic mass assault in Eisenstein's film and in official propaganda — was in reality an almost bloodless walk-in.",
  '2026-12-16': 'Its capital held out behind the triple Theodosian Walls for a thousand years, falling in 1453 only after sustained cannon fire finally breached them.',
};

let changed = 0;
for (const [date, clue] of Object.entries(REPLACEMENTS)) {
  if (!puzzles[date]) throw new Error(`No puzzle for ${date}`);
  puzzles[date].clues[0] = clue;
  changed++;
}

writeFileSync(path, JSON.stringify(puzzles, null, 2) + '\n');
console.log(`Rewrote clue 1 for ${changed} puzzles.`);
