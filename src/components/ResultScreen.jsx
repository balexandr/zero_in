import { useState } from 'react';
import { IconClose, IconCheckmark, IconResultSquare } from './Icons';
import styles from './ResultScreen.module.css';

export function ResultScreen({ gameStatus, puzzle, guesses, score, winClue, generateShareText, onShowStats, onDismiss }) {
  const [copied, setCopied] = useState(false);

  const won = gameStatus === 'won';

  const squareStates = Array.from({ length: 5 }, (_, i) => {
    if (i >= guesses.length) return 'unused';
    return guesses[i].correct ? 'correct' : 'wrong';
  });

  async function handleShare() {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // cancelled or failed, fall through
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
        <button className={styles.closeBtn} onClick={onDismiss} aria-label="Close"><IconClose /></button>
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
        <div className={styles.squares}>
          {squareStates.map((state, i) => <IconResultSquare key={i} state={state} />)}
        </div>
        <div className={styles.actions}>
          <button className={styles.btnShare} onClick={handleShare}>
            share result
          </button>
          <button className={styles.btnStats} onClick={onShowStats}>
            view stats
          </button>
        </div>
        {copied && <div className={styles.copied}><IconCheckmark size={13} /> copied to clipboard</div>}
      </div>
    </div>
  );
}
