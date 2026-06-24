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

function getDateForPuzzle(index) {
  const epoch = new Date('2026-06-22');
  const d = new Date(epoch);
  d.setDate(d.getDate() + index);
  return d.toISOString().slice(0, 10);
}

async function generateCluesForSubject(subject) {
  const prompt = `Generate exactly 5 clues for the subject: "${subject.answer}"

Requirements:
- Each clue must be a factual, verifiable statement about "${subject.answer}"
- Clues must be ordered from HARDEST to EASIEST (clue 1 is hardest, clue 5 makes the answer obvious)
- Clue 1: Very obscure fact that experts might know — specific dates, numbers, or niche trivia
- Clue 2: Specific historical/technical detail, less well-known
- Clue 3: Notable achievement or characteristic, moderately well-known
- Clue 4: Well-known fact most educated people would recognize
- Clue 5: Very famous/obvious fact — almost anyone would know this
- Do NOT mention the answer or any of these aliases in any clue: ${subject.aliases.join(', ')}
- Each clue should be 1 sentence, under 15 words
- Cross-reference facts for accuracy before including them

Respond with ONLY a JSON array of 5 strings, no other text:
["clue1", "clue2", "clue3", "clue4", "clue5"]`;

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content.find(b => b.type === 'text')?.text?.trim();
  if (!text) throw new Error(`No text response for ${subject.answer}`);

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`No JSON array found for ${subject.answer}: ${text}`);

  const clues = JSON.parse(match[0]);
  if (!Array.isArray(clues) || clues.length !== 5) {
    throw new Error(`Expected 5 clues for ${subject.answer}, got ${clues?.length}`);
  }

  return clues;
}

async function main() {
  console.log('Generating 10 Zero In puzzles...\n');
  const puzzles = {};

  for (let i = 0; i < PUZZLE_SUBJECTS.length; i++) {
    const subject = PUZZLE_SUBJECTS[i];
    const date = getDateForPuzzle(i);
    console.log(`[${i + 1}/10] Generating clues for: ${subject.answer} (${date})`);

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

  const outPath = join(__dirname, '../src/data/puzzles.json');
  writeFileSync(outPath, JSON.stringify(puzzles, null, 2));
  console.log(`\nWrote ${Object.keys(puzzles).length} puzzles to ${outPath}`);
}

main();
