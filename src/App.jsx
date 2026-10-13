import { useState, useRef, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useStats } from './hooks/useStats';
import { GameLogo } from './components/GameLogo';
import { NoodleLogoIcon } from './components/NoodleLogo';
import { ClueCard } from './components/ClueCard';
import { HowToPlay } from './components/HowToPlay';
import { ResultScreen } from './components/ResultScreen';
import { StatsScreen } from './components/StatsScreen';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import styles from './App.module.css';
import { recordTodayShare, getCompletedTodayCount, shareAllCompleted, TOTAL_GAMES } from './utils/shareAll';
import { toLeaderboardScore } from './utils/leaderboardScore';
import { fetchTodayBoard, findMyRow, wouldQualify } from './utils/leaderboard';
import { IconCheckmark, IconShare, IconXSmall, IconDash, IconLeaderboard } from './components/Icons';

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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [prevCluesRevealed, setPrevCluesRevealed] = useState(1);
  const [shareAllCount, setShareAllCount] = useState(0);
  const [shareAllCopied, setShareAllCopied] = useState(false);
  const inputRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const handleShareAll = async () => {
    const outcome = await shareAllCompleted(dateKey);
    if (outcome !== 'copied') return;
    setShareAllCopied(true);
    setTimeout(() => setShareAllCopied(false), 2500);
  };

  const Logo = () => (
    <h1 className={styles.title}>
      <GameLogo />
      <span className={styles.titleText}>Zero In</span>
    </h1>
  );

  const footer = (
    <footer className={styles.footer}>
      <a href="https://noodlegames.co" target="_blank" rel="noopener noreferrer" className={styles.footerLogo}>
        <NoodleLogoIcon size={18} /> NoodleGames
      </a>
      {shareAllCount > 0 && (
        <button
          className={`${styles.footerShareAll} ${shareAllCopied ? styles.copied : ''}`}
          onClick={handleShareAll}
        >
          {shareAllCopied
            ? <><IconCheckmark size={13} /> Copied</>
            : <><IconShare size={13} /> Share all completed ({shareAllCount}/{TOTAL_GAMES})</>}
        </button>
      )}
      <a href="https://noodlegames.co/privacy" target="_blank" rel="noopener noreferrer" className={styles.footerPrivacy}>Privacy Policy</a>
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
      recordTodayShare('zeroin', dateKey, generateShareText());
    }
  }, [gameStatus]);

  // Auto-opens the leaderboard (initials prompt included) a beat after
  // a qualifying win, instead of making the player click "today's
  // leaderboard" to find out they made the cut.
  useEffect(() => {
    if (gameStatus !== 'won') return;
    const t = setTimeout(() => {
      const pending = toLeaderboardScore(winClue);
      fetchTodayBoard('zero-in', dateKey).then((board) => {
        if (!board.config) return;
        if (findMyRow('zero-in', board.rows)) return;
        if (wouldQualify(pending.score, board.rows, board.config)) {
          setShowLeaderboard(true);
        }
      });
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  useEffect(() => {
    setShareAllCount(getCompletedTodayCount(dateKey));
  }, [gameStatus, dateKey]);

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
            <Logo />
            <div className={styles.subtitle}>daily intel briefing</div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => setShowLeaderboard(true)} aria-label="Leaderboard">
              <IconLeaderboard size={15} />
            </button>
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
                    <span className={styles.guessIcon}>{g.correct ? <IconCheckmark size={13} /> : g.skipped ? <IconDash size={13} /> : <IconXSmall size={13} />}</span>
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
                  skip, reveal next clue
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
          onViewLeaderboard={() => setShowLeaderboard(true)}
        />
      )}
      {showLeaderboard && (
        <LeaderboardPanel
          dateKey={dateKey}
          pendingScore={gameStatus === 'won' ? toLeaderboardScore(winClue) : null}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
