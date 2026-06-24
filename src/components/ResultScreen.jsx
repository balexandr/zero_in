import { useState } from 'react';
import styles from './ResultScreen.module.css';

export function ResultScreen({ gameStatus, puzzle, guesses, score, winClue, generateShareText, onShowStats, onDismiss }) {
  const [copied, setCopied] = useState(false);

  const won = gameStatus === 'won';

  const squares = Array.from({ length: 5 }, (_, i) => {
    if (i >= guesses.length) return '⬜';
    return guesses[i].correct ? '🟩' : '🟥';
  }).join('');

  async function handleShare() {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // cancelled or failed — fall through
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onDismiss} aria-label="Close">✕</button>
        <div className={`${styles.status} ${won ? styles.statusWon : styles.statusLost}`}>
          {won ? '// target acquired' : '// target lost'}
        </div>
        <div className={styles.answer}>{puzzle.answer}</div>
        {won && (
          <div className={styles.score}>
            score: <span className={styles.scoreVal}>{score}/5</span>
            &nbsp;· identified on clue #{winClue}
          </div>
        )}
        {!won && (
          <div className={styles.score}>better luck tomorrow</div>
        )}
        <div className={styles.squares}>{squares}</div>
        <div className={styles.actions}>
          <button className={styles.btnShare} onClick={handleShare}>
            share result
          </button>
          <button className={styles.btnStats} onClick={onShowStats}>
            view stats
          </button>
        </div>
        {copied && <div className={styles.copied}>copied to clipboard</div>}
      </div>
    </div>
  );
}
