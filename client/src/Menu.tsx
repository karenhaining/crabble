import styles from './boardstyles.module.css'

function Menu({onOptionClick} : {onOptionClick: (s: string) => void}) {
  return (
    <div>
      <div className={styles.menuTitle}>MENU</div>
      <div className={styles.menuOption}>
        <header className={styles.optionTitle}>Play actions</header>
        <button className={styles.largeButton} onClick={() => onOptionClick('PLAY')}>OPEN</button>
      </div>
      <div className={styles.menuOption}>
        <header className={styles.optionTitle}>View Settings</header>
        <button className={styles.largeButton} onClick={() => onOptionClick('SETTING')}>OPEN</button>
      </div>
      <div className={styles.menuOption}>
        <header className={styles.optionTitle}>Manual config</header>
        <button className={styles.largeButton} onClick={() => onOptionClick('CONFIG')}>OPEN</button>
      </div>
    </div>
    
  );
}

export default Menu;