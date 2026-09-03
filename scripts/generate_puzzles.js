import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

const PUZZLE_SUBJECTS = [
  { answer: 'Mount Everest', aliases: ['everest', 'mt everest', 'chomolungma'] },
  { answer: 'The Eiffel Tower', aliases: ['eiffel tower', 'la dame de fer', 'iron lady'] },
  { answer: 'Nikola Tesla', aliases: ['tesla'] },
  { answer: 'The Amazon River', aliases: ['amazon river', 'amazon'] },
  { answer: 'Marie Curie', aliases: ['curie', 'madame curie', 'maria sklodowska'] },
  { answer: 'The Great Wall of China', aliases: ['great wall', 'great wall of china'] },
  { answer: 'Albert Einstein', aliases: ['einstein'] },
  { answer: 'The Colosseum', aliases: ['colosseum', 'coliseum', 'flavian amphitheatre'] },
  { answer: 'Beethoven', aliases: ['ludwig van beethoven', 'ludwig beethoven'] },
  { answer: 'The Sahara Desert', aliases: ['sahara', 'sahara desert'] },
];

const MAX_ATTEMPTS = 3;

function getDateForPuzzle(index) {
  const epoch = new Date('2026-06-22');
  const d = new Date(epoch);
  d.setDate(d.getDate() + index);
  return d.toISOString().slice(0, 10);
}

// --- leak detection -------------------------------------------------------
// A "leak" is the answer or any accepted alias appearing verbatim (as a whole
// word/phrase, accent- and punctuation-insensitive) inside a clue. Any such
// leak hands the player a free win the instant they read that clue, since
// typing the leaked text back in is itself a correct guess.

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Find every accepted term (answer + aliases) that appears as a whole phrase
// inside the clue. Terms shorter than 4 normalized characters are skipped
// (too many false positives on short common words).
function findLeaks(clue, subject) {
  const terms = [subject.answer, ...subject.aliases].map(normalize).filter(t => t.length >= 4);
  const haystack = ` ${normalize(clue)} `;
  const leaks = new Set();
  for (const term of terms) {
    if (haystack.includes(` ${term} `)) leaks.add(term);
  }
  return [...leaks];
}

// Returns an array of { clueIndex, text, leaks } for every clue that leaked.
function validateClues(clues, subject) {
  const problems = [];
  clues.forEach((clue, i) => {
    const leaks = findLeaks(clue, subject);
    if (leaks.length) problems.push({ clueIndex: i, text: clue, leaks });
  });
  return problems;
}

function buildPrompt(subject) {
  return `Generate exactly 5 clues for the subject: "${subject.answer}"

Requirements:
- Each clue must be a factual, verifiable statement about "${subject.answer}"
- Clues must be ordered from HARDEST to EASIEST (clue 1 is hardest, clue 5 makes the answer obvious)
- Clue 1: Very obscure fact that experts might know — specific dates, numbers, or niche trivia
- Clue 2: Specific historical/technical detail, less well-known
- Clue 3: Notable achievement or characteristic, moderately well-known
- Clue 4: Well-known fact most educated people would recognize
- Clue 5: Very famous/obvious fact — almost anyone would know this, but still described rather than named
- Do NOT write the answer or any of these aliases (or close variants of them) in ANY clue, including clue 5 — describe around the name instead: ${subject.aliases.join(', ')}
- Clue 5 should make the answer unmistakable through how famous the fact is, not by stating the name itself
- Each clue should be 1 sentence (dependent clauses joined with commas/dashes are fine), roughly 15-40 words
- Cross-reference facts for accuracy before including them

Respond with ONLY a JSON array of 5 strings, no other text:
["clue1", "clue2", "clue3", "clue4", "clue5"]`;
}

function buildRetryPrompt(subject, clues, problems) {
  const flagged = problems
    .map(p => `- Clue ${p.clueIndex + 1} ("${p.text}") contains the banned term(s): ${p.leaks.join(', ')}`)
    .join('\n');
  return `You previously generated these 5 clues for "${subject.answer}":
${JSON.stringify(clues, null, 2)}

Some of them leak the answer. Specifically:
${flagged}

Rewrite ONLY the flagged clue(s) so they no longer contain the answer, any alias, or a close variant of either (aliases: ${subject.aliases.join(', ')}) — describe around the name instead of naming it. Keep every clue that was not flagged exactly as-is. Keep the same relative difficulty level for each clue position (clue 1 hardest, clue 5 easiest-but-still-not-naming-it).

Respond with ONLY a JSON array of all 5 strings (flagged ones rewritten, others unchanged), no other text:
["clue1", "clue2", "clue3", "clue4", "clue5"]`;
}

async function callModel(prompt) {
  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content.find(b => b.type === 'text')?.text?.trim();
  if (!text) throw new Error('No text response');

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`No JSON array found in response: ${text}`);

  const clues = JSON.parse(match[0]);
  if (!Array.isArray(clues) || clues.length !== 5) {
    throw new Error(`Expected 5 clues, got ${clues?.length}`);
  }
  return clues;
}

async function generateCluesForSubject(subject) {
  let clues = await callModel(buildPrompt(subject));

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const problems = validateClues(clues, subject);
    if (problems.length === 0) return clues;

    console.log(`  ! leak check failed (attempt ${attempt}/${MAX_ATTEMPTS}):`);
    problems.forEach(p => console.log(`      clue ${p.clueIndex + 1}: contains "${p.leaks.join(', ')}"`));

    if (attempt === MAX_ATTEMPTS) {
      throw new Error(
        `${subject.answer}: could not eliminate leaks after ${MAX_ATTEMPTS} attempts — ` +
          problems.map(p => `clue ${p.clueIndex + 1} still has "${p.leaks.join(', ')}"`).join('; ')
      );
    }

    clues = await callModel(buildRetryPrompt(subject, clues, problems));
  }

  return clues;
}

// Cross-puzzle duplicate check: catches two different subjects that happened
// to reuse the same well-known anecdote as their opening clue (e.g. "Photo 51"
// showing up for both DNA and Rosalind Franklin).
function findCrossPuzzleDuplicates(puzzles) {
  const seen = new Map(); // normalized clue prefix -> [date:clueIndex, ...]
  for (const [date, pz] of Object.entries(puzzles)) {
    pz.clues.forEach((clue, i) => {
      const key = normalize(clue).slice(0, 60);
      const loc = `${date} (${pz.answer}) clue ${i + 1}`;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(loc);
    });
  }
  return [...seen.values()].filter(locs => locs.length > 1);
}

async function main() {
  console.log(`Generating ${PUZZLE_SUBJECTS.length} Zero In puzzles...\n`);
  const puzzles = {};

  for (let i = 0; i < PUZZLE_SUBJECTS.length; i++) {
    const subject = PUZZLE_SUBJECTS[i];
    const date = getDateForPuzzle(i);
    console.log(`[${i + 1}/${PUZZLE_SUBJECTS.length}] Generating clues for: ${subject.answer} (${date})`);

    try {
      const clues = await generateCluesForSubject(subject);
      puzzles[date] = {
        answer: subject.answer,
        aliases: subject.aliases,
        clues,
      };
      console.log(`  ✓ ${clues[0].slice(0, 60)}...`);
      console.log(`  ✓ ${clues[4].slice(0, 60)}...`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      process.exit(1);
    }

    // small delay between requests
    if (i < PUZZLE_SUBJECTS.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const dupes = findCrossPuzzleDuplicates(puzzles);
  if (dupes.length) {
    console.warn('\n⚠ Cross-puzzle duplicate clues detected (same anecdote used in two puzzles):');
    dupes.forEach(locs => console.warn('  ', locs.join(' <-> ')));
    console.warn('Review these before shipping — not auto-fixed.');
  }

  const outPath = join(__dirname, '../src/data/puzzles.json');
  writeFileSync(outPath, JSON.stringify(puzzles, null, 2));
  console.log(`\nWrote ${Object.keys(puzzles).length} puzzles to ${outPath}`);
}

main();
