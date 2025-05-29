import styles from './boardstyles.module.css'

function Menu({onOptionClick} : {onOptionClick: (s: string) => void}) {
  return (
    <div>
      <div className={styles.menuTitle}>MENU</div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>View Settings</div>
        <button className={styles.largeButton} onClick={() => onOptionClick('SETTING')}>OPEN</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Play actions</div>
        <button className={styles.largeButton} onClick={() => onOptionClick('PLAY')}>OPEN</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Manual config</div>
        <button className={styles.largeButton} onClick={() => onOptionClick('CONFIG')}>OPEN</button>
      </div>
    </div>
    
  );
}

export default Menu;