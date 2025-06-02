import styles from './boardstyles.module.css'
import { useState } from 'react';

function Moves({onBackClick, onOverrideBoardClick, onOverrideHandClick, onPlayTileClick} : {onBackClick: () => void, onOverrideBoardClick: (letter: String) => void, onOverrideHandClick: (letter: String) => void, onPlayTileClick: () => void}) {
  const [letter, setLetter] = useState('');
  return (
    <div>
      <div className={styles.menuTitle}>MOVES</div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Play tile from hand</div>
        <button className={styles.largeButton} onClick={() => onPlayTileClick()}>Set</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Update board state</div>
        <button className={styles.largeButton}>Refresh</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Override square</div>
        <div style={{display: 'flex', width: "400px"}}>
          <div>
            <button className={styles.smallButton} onClick={() => onOverrideHandClick(letter)}>Hand</button>
          </div>
          <div>
            <input
              className={styles.inputField}
              maxLength={1}
              value={letter}
              onChange={(e) => {setLetter(e.target.value)}}></input>
          </div>
          <div>
            <button className={styles.smallButton} onClick={() => onOverrideBoardClick(letter)}>Board</button>
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