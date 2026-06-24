import { useState, useRef, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useStats } from './hooks/useStats';
import { ClueCard } from './components/ClueCard';
import { HowToPlay } from './components/HowToPlay';
import { ResultScreen } from './components/ResultScreen';
import { StatsScreen } from './components/StatsScreen';
import styles from './App.module.css';

export default function App() {
  const {
    puzzle, puzzleNumber, dateKey,
    guesses, cluesRevealed, gameStatus, initialized, shaking,
    winClue, score, submitGuess, skipGuess, generateShareText,
    maxGuesses, maxClues,
  } = useGameState();

  const { stats, winPct, recordGame } = useStats();

  const [input, setInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [prevCluesRevealed, setPrevCluesRevealed] = useState(1);
  const inputRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const footer = (
    <footer className={styles.footer}>
      <a href="https://noodlegames.co" target="_blank" rel="noopener noreferrer" className={styles.footerLogo}>
        🍜 NoodleGames
      </a>
      <span className={styles.footerCopy}>© {currentYear} NoodleGames.co</span>
    </footer>
  );

  useEffect(() => {
    if (!initialized) return;
    if (gameStatus !== 'playing' && !showResult) {
      const timer = setTimeout(() => setShowResult(true), 800);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, initialized]);

  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      recordGame(dateKey, gameStatus === 'won', winClue || maxClues);
    }
  }, [gameStatus]);

  function handleSubmit(e) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setPrevCluesRevealed(cluesRevealed);
    submitGuess(trimmed);
    setInput('');
    inputRef.current?.focus();
  }

  if (!initialized) return null;

  return (
    <div className={styles.app}>
      <div className={styles.radarBg} aria-hidden>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.sweep} />
      </div>
      <div className={styles.vignette} aria-hidden />
      <div className={styles.scanlines} aria-hidden />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.title}>Zero In</div>
            <div className={styles.subtitle}>daily intel briefing</div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => setShowStats(true)} aria-label="Stats">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="8" width="3" height="6" fill="currentColor" rx="1"/>
                <rect x="6" y="5" width="3" height="9" fill="currentColor" rx="1"/>
                <rect x="11" y="2" width="3" height="12" fill="currentColor" rx="1"/>
              </svg>
            </button>
            <button className={styles.iconBtn} onClick={() => setShowHelp(true)} aria-label="How to play">?</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {!puzzle ? (
          <div className={styles.noPuzzle}>
            no intel available today<br />check back tomorrow
          </div>
        ) : (
          <>
            <div className={styles.puzzleInfo}>
              <span>briefing</span>
              <span className={styles.dot} />
              <span className={styles.puzzleNum}>#{puzzleNumber}</span>
              <span className={styles.dot} />
              <span>{dateKey}</span>
            </div>

            <div className={styles.attempts}>
              {Array.from({ length: maxGuesses }, (_, i) => {
                const guess = guesses[i];
                let cls = styles.attempt;
                if (guess?.correct) cls += ` ${styles.attemptCorrect}`;
                else if (guess?.skipped) cls += ` ${styles.attemptSkipped}`;
                else if (guess) cls += ` ${styles.attemptWrong}`;
                else if (i < guesses.length) cls += ` ${styles.attemptUsed}`;
                return <span key={i} className={cls} />;
              })}
            </div>

            <div className={styles.clues}>
              {Array.from({ length: maxClues }, (_, i) => (
                <ClueCard
                  key={i}
                  clue={puzzle.clues[i]}
                  index={i}
                  revealed={i < cluesRevealed}
                  isNew={i === cluesRevealed - 1 && i === prevCluesRevealed && i > 0}
                />
              ))}
            </div>

            {guesses.length > 0 && (
              <div className={styles.guessHistory}>
                {guesses.map((g, i) => (
                  <div key={i} className={`${styles.guessRow} ${g.correct ? styles.guessCorrect : g.skipped ? styles.guessSkipped : styles.guessWrong}`}>
                    <span className={styles.guessIcon}>{g.correct ? '✓' : g.skipped ? '—' : '✗'}</span>
                    <span>{g.skipped ? 'skipped' : g.text}</span>
                  </div>
                ))}
              </div>
            )}

            {gameStatus === 'playing' && (
              <div className={styles.inputArea}>
                <form className={styles.inputInner} onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    className={`${styles.input} ${shaking ? styles.shaking : ''}`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="identify the target…"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    maxLength={120}
                  />
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={!input.trim()}
                  >
                    zero in
                  </button>
                </form>
                <button
                  type="button"
                  className={styles.skipBtn}
                  onClick={() => { skipGuess(); setInput(''); inputRef.current?.focus(); }}
                >
                  skip — reveal next clue
                </button>
              </div>
            )}
          </>
        )}
        {footer}
      </main>

      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
      {showStats && <StatsScreen stats={stats} winPct={winPct} onClose={() => setShowStats(false)} />}
      {showResult && puzzle && (
        <ResultScreen
          gameStatus={gameStatus}
          puzzle={puzzle}
          guesses={guesses}
          score={score}
          winClue={winClue}
          generateShareText={generateShareText}
          onShowStats={() => { setShowResult(false); setShowStats(true); }}
          onDismiss={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
