import styles from './ClueCard.module.css';

export function ClueCard({ clue, index, revealed, isNew }) {
  if (!revealed) {
    return (
      <div className={`${styles.card} ${styles.locked}`}>
        <span className={styles.number}>#{index + 1}</span>
        <span className={styles.text}>classified</span>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${isNew ? styles.new : ''}`}>
      <span className={styles.number}>#{index + 1}</span>
      <span className={styles.text}>{clue}</span>
    </div>
  );
}
