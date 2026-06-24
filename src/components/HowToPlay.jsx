import styles from './HowToPlay.module.css';

export function HowToPlay({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        <div className={styles.title}>// how to play</div>
        <div className={styles.body}>
          <p>Each day a new target is classified. You receive <strong>5 clues</strong> ordered from hardest to easiest.</p>
          <p>Clue #1 is always visible. A wrong guess reveals the next clue. You have <strong>5 attempts</strong>.</p>
          <p>The earlier you identify the target, the higher your score.</p>
          <div className={styles.examples}>
            <div className={styles.exRow}>
              <span style={{ fontSize: 16 }}>🟩</span>
              <span>correct guess</span>
            </div>
            <div className={styles.exRow}>
              <span style={{ fontSize: 16 }}>🟥</span>
              <span>wrong guess</span>
            </div>
            <div className={styles.exRow}>
              <span style={{ fontSize: 16 }}>⬜</span>
              <span>unused attempt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
