// Zero In's own definition of what counts as winning: guessed right on
// an earlier clue scores higher (matches the 'desc' sort_direction
// seeded for 'zero-in' in leaderboard_games — same 6 - winClue formula
// useGameState.js already uses for the in-game score). Every game
// writes its own version of this — the shared leaderboard.js never
// needs to know what a "clue" is. Only 5 possible values though, so
// ties are common — solve time breaks them ('asc', faster wins, also
// seeded in leaderboard_games).
export function toLeaderboardScore(winClue, elapsedSeconds) {
  const clueLabel = `Clue ${winClue}`
  if (elapsedSeconds == null) return { score: 6 - winClue, tiebreak: null, scoreDisplay: clueLabel }
  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')
  const ss = String(elapsedSeconds % 60).padStart(2, '0')
  return { score: 6 - winClue, tiebreak: elapsedSeconds, scoreDisplay: `${clueLabel} · ${mm}:${ss}` }
}
