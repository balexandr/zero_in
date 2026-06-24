import { useState, useCallback, useEffect } from 'react';
import puzzles from '../data/puzzles.json';

const STORAGE_KEY = 'zeroin-game-state';
const EPOCH = '2026-06-22';
const MAX_CLUES = 5;
const MAX_GUESSES = 5;

function getTodayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

function normalize(str) {
  return str.toLowerCase().trim()
    .replace(/['''`]/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(the|a|an|mr|mrs|dr|st|mt|mount|saint)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkAnswer(guess, puzzle) {
  const normGuess = normalize(guess);
  if (!normGuess) return false;
  if (normGuess === normalize(puzzle.answer)) return true;
  if (puzzle.aliases?.some(a => normalize(a) === normGuess)) return true;
  return puzzle.misspellings?.some(m => normalize(m) === normGuess) ?? false;
}

function loadState(dateKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.dateKey !== dateKey) return null;
    return saved;
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function useGameState() {
  const dateKey = getTodayKey();
  const puzzle = puzzles[dateKey] || null;
  const puzzleNumber = Math.floor((new Date(dateKey) - new Date(EPOCH)) / 86400000) + 1;

  const [guesses, setGuesses] = useState([]);
  const [cluesRevealed, setCluesRevealed] = useState(1);
  const [gameStatus, setGameStatus] = useState('playing');
  const [initialized, setInitialized] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!puzzle) { setInitialized(true); return; }
    const saved = loadState(dateKey);
    if (saved) {
      setGuesses(saved.guesses || []);
      setCluesRevealed(saved.cluesRevealed ?? 1);
      setGameStatus(saved.gameStatus || 'playing');
    }
    setInitialized(true);
  }, [dateKey]);

  useEffect(() => {
    if (!initialized || !puzzle) return;
    saveState({ dateKey, guesses, cluesRevealed, gameStatus });
  }, [guesses, cluesRevealed, gameStatus, initialized]);

  const submitGuess = useCallback((text) => {
    if (!puzzle || gameStatus !== 'playing') return { result: 'invalid' };
    if (guesses.length >= MAX_GUESSES) return { result: 'invalid' };

    const correct = checkAnswer(text, puzzle);
    const newGuess = { text, correct };
    const newGuesses = [...guesses, newGuess];

    if (correct) {
      setGuesses(newGuesses);
      setGameStatus('won');
      return { result: 'correct' };
    }

    const nextCluesRevealed = Math.min(cluesRevealed + 1, MAX_CLUES);
    setCluesRevealed(nextCluesRevealed);
    setGuesses(newGuesses);

    if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
      return { result: 'lost' };
    }

    setShaking(true);
    setTimeout(() => setShaking(false), 500);
    return { result: 'wrong' };
  }, [puzzle, gameStatus, guesses, cluesRevealed]);

  const skipGuess = useCallback(() => {
    if (!puzzle || gameStatus !== 'playing') return;
    if (guesses.length >= MAX_GUESSES) return;

    const newGuesses = [...guesses, { text: null, correct: false, skipped: true }];
    const nextCluesRevealed = Math.min(cluesRevealed + 1, MAX_CLUES);
    setCluesRevealed(nextCluesRevealed);
    setGuesses(newGuesses);

    if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
    }
  }, [puzzle, gameStatus, guesses, cluesRevealed]);

  const winClue = gameStatus === 'won'
    ? guesses.findIndex(g => g.correct) + 1
    : null;

  const score = winClue ? 6 - winClue : 0;

  const generateShareText = useCallback(() => {
    if (!puzzle) return '';
    const totalGuesses = guesses.length;
    const won = gameStatus === 'won';
    const guessDisplay = won ? `${totalGuesses}/${MAX_GUESSES}` : 'X/5';
    const squares = Array.from({ length: MAX_GUESSES }, (_, i) => {
      if (i >= totalGuesses) return '⬜';
      if (guesses[i].skipped) return '⬛';
      return guesses[i].correct ? '🟩' : '🟥';
    }).join('');
    return `Zero In #${puzzleNumber} ${guessDisplay}\n${squares}`;
  }, [puzzle, guesses, gameStatus, puzzleNumber]);

  return {
    puzzle,
    puzzleNumber,
    dateKey,
    guesses,
    cluesRevealed,
    gameStatus,
    initialized,
    shaking,
    winClue,
    score,
    submitGuess,
    skipGuess,
    generateShareText,
    maxGuesses: MAX_GUESSES,
    maxClues: MAX_CLUES,
  };
}
