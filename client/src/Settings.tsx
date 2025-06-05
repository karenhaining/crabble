import styles from './boardstyles.module.css'

function Settings({n, boardMinus, boardPlus, useCam, onBackClick}:
  {n: number, boardMinus: () => void, boardPlus: () => void, useCam: boolean, onBackClick: () => void}) {
  return (
    <div>
      <header className={styles.menuTitle}>SETTINGS</header>
      <div className={styles.menuOption}>
        <button className={styles.largeButton} onClick={onBackClick}>BACK</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.optionTitle}>Board Size</div>
        <div className={styles.doubleOption}>
          <button className={styles.buttonLeft} onClick={boardMinus}>-</button>
          <button className={styles.buttonRight} onClick={boardPlus}>+</button>
        </div>
      </div>
    </div>
    
  );
}

export default Settings;