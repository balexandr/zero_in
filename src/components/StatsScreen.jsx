import styles from './StatsScreen.module.css';

export function StatsScreen({ stats, winPct, onClose }) {
  const maxDist = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        <div className={styles.title}>// statistics</div>

        <div className={styles.grid}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{stats.gamesPlayed}</div>
            <div className={styles.statLabel}>played</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>{winPct}</div>
            <div className={styles.statLabel}>win %</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>{stats.currentStreak}</div>
            <div className={styles.statLabel}>streak</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>{stats.maxStreak}</div>
            <div className={styles.statLabel}>best</div>
          </div>
        </div>

        <div className={styles.distTitle}>clue distribution</div>
        {[1, 2, 3, 4, 5].map(n => {
          const count = stats.distribution[n] || 0;
          const pct = Math.round((count / maxDist) * 100);
          return (
            <div key={n} className={styles.distRow}>
              <span className={styles.distLabel}>#{n}</span>
              <div className={styles.distBar}>
                <div className={styles.distFill} style={{ width: `${Math.max(pct, 4)}%` }}>
                  {count > 0 && <span className={styles.distCount}>{count}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
