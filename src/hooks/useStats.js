import { useState, useCallback } from 'react';

const STATS_KEY = 'zeroin-stats';

function getDefaultStats() {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    lastCompletedDate: null,
  };
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return getDefaultStats();
    const defaults = getDefaultStats();
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed, distribution: { ...defaults.distribution, ...parsed.distribution } };
  } catch { return getDefaultStats(); }
}

function saveStats(stats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

function isConsecutiveDay(dateA, dateB) {
  if (!dateA || !dateB) return false;
  const diff = Math.abs(new Date(dateB) - new Date(dateA));
  return diff >= 86400000 && diff < 172800000;
}

export function useStats() {
  const [stats, setStats] = useState(loadStats);

  const recordGame = useCallback((dateKey, won, clueNumber) => {
    setStats((prev) => {
      if (prev.lastCompletedDate === dateKey) return prev;
      const next = { ...prev, distribution: { ...prev.distribution } };
      next.gamesPlayed += 1;
      next.lastCompletedDate = dateKey;

      if (won) {
        next.gamesWon += 1;
        next.distribution[clueNumber] = (next.distribution[clueNumber] || 0) + 1;
        if (isConsecutiveDay(prev.lastCompletedDate, dateKey) || prev.gamesPlayed === 0) {
          next.currentStreak = prev.currentStreak + 1;
        } else {
          next.currentStreak = 1;
        }
        next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
      } else {
        next.currentStreak = 0;
      }

      saveStats(next);
      return next;
    });
  }, []);

  const winPct = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  return { stats, winPct, recordGame };
}
