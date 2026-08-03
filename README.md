# Zero In — Daily Trivia Puzzle

A daily puzzle game where you identify a person, place, or thing from five progressively-revealed clues. Fewer clues used, higher your score.

Part of the [NoodleGames](https://noodlegames.co) family alongside **Squint** and **Knot**.

---

## How to play

One clue is shown at a time. Guess, or skip to reveal the next clue — either way, up to **5 clues** unlock and you get **5 guesses** total.

- 🟩 Correct guess · 🟥 Wrong guess · ⬛ Skipped · ⬜ Unused
- Score = `6 − (clue you solved it on)`, so guessing right on clue 1 scores highest.
- Resets daily at **midnight ET**.

---

## Sharing

After the puzzle ends you can share a result grid showing which clue you solved on (or that you missed it), no spoilers. Once you've finished at least one NoodleGame today, a **Share all completed** button appears in the footer, letting you share every game you've solved today in one message.

---

## Stack

React + Vite · CSS Modules · localStorage · GitHub Pages

---

## Puzzles

Puzzles run from **June 22, 2026** onward (193 days, through December 2026), stored in `src/data/puzzles.json` keyed by date. Each entry has an answer, accepted aliases/misspellings, and 5 ordered clues.
