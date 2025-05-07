import styles from './boardstyles.module.css'

function Moves({onBackClick} : {onBackClick: () => void}) {
  return (
    <div>
      <div className={styles.menuTitle}>MOVES</div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Play tile from hand</div>
        <button className={styles.largeButton}>Set</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Update board state</div>
        <button className={styles.largeButton}>Refresh</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Return to Menu</div>
        <button className={styles.largeButton} onClick={onBackClick}>BACK</button>
      </div>
    </div>
    
  );
}

export default Moves;