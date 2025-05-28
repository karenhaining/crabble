import styles from './boardstyles.module.css'
import { useState } from 'react';

function Moves({onBackClick, onOverrideClick} : {onBackClick: () => void, onOverrideClick: (letter: String) => void}) {
  const [letter, setLetter] = useState('');
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
        <div className={styles.buttonTitleText}>Override square</div>
        <div style={{display: 'flex', width: "400px"}}>
          <div style={{paddingRight: "40px"}}>
            <input
              className={styles.inputField}
              maxLength={1}
              value={letter}
              onChange={(e) => {setLetter(e.target.value)}}></input>
          </div>
          <div>
            <button className={styles.smallButton} onClick={() => onOverrideClick(letter)}>Override</button>
          </div>
        </div>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Return to Menu</div>
        <button className={styles.largeButton} onClick={onBackClick}>BACK</button>
      </div>
    </div>
    
  );
}

export default Moves;