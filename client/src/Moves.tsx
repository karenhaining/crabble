import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp} from '@mui/icons-material';
import styles from './boardstyles.module.css'
import { useState } from 'react';

function Moves(
  {onBackClick, onOverrideBoardClick, onOverrideHandClick,
   onArmLeftClick, onArmRightClick, onArmUpClick, onArmDownClick,
   queueWord, playNextQueuedAction, replayLastAction, getBoard}:
  {onBackClick: () => void, onOverrideBoardClick: (letter: String) => void, onOverrideHandClick: (letter: String) => void,
   onArmLeftClick: () => void, onArmRightClick: () => void, onArmUpClick: () => void, onArmDownClick: () => void,
   queueWord: (r: number, c: number, direction: string, positions: string) => void,
   playNextQueuedAction: () => void,
   replayLastAction: () => void,
   getBoard: () => void
  }) {
  const [letter, setLetter] = useState('');
  const [positions, setPositions] = useState('');
  const [location, setLocation] = useState('');
  const [playing, setPlaying] = useState(false);

  const onPlay = (dir: string) => {
    getBoard()
    const r = parseInt(location.charAt(1));
    const c = location.toUpperCase().charCodeAt(0) - 65 + 1;
    setPlaying(true);
    queueWord(r, c, dir, positions);
  }

  const onEndTurn = () => {
    setPlaying(false)
  }

  const playOption = () => {
    if (playing) {
      return <button className={styles.largeButton} onClick={onEndTurn}>END TURN</button>
    } else {
      return (
        <div className={styles.doubleOption}>
          <button className={styles.buttonLeft} onClick={() => onPlay('D')}>D</button>
          <button className={styles.buttonRight} onClick={() => onPlay('A')}>A</button>
        </div>
      )
    }
  }

  const overrideOption = () => {
    if (playing) {
      return <div></div>
    } else {
      return (
      <div className={styles.menuOption} key={'overrride'}>
        <header className={styles.inputTitle}>Override tile:</header>
        <div style={{display: 'flex'}}>
          <input
            className={styles.smallInputField}
            maxLength={1}
            value={letter}
            onChange={(e) => {setLetter(e.target.value)}}></input>
          <button className={styles.smallButton} onClick={() => onOverrideHandClick(letter)}>Hand</button>
          <button className={styles.smallButton} onClick={() => onOverrideBoardClick(letter)}>Board</button>
        </div>
      </div>);
    }
  }
  return (
    <div>
      <header className={styles.menuTitle}>PLAY</header>
      <div className={styles.menuScreen}>
        <div className={styles.menuOption}>
          <button className={styles.largeButton} onClick={onBackClick}>BACK</button>
        </div>
        <div className={styles.menuOption}>
          <button className={styles.largeButton} onClick={getBoard}>REFRESH</button>
        </div>
      </div>
      {overrideOption()}
      <div className={styles.menuScreen}>
        <div className={styles.menuOption}>
          <header className={styles.inputTitle}>Word:</header>
          <input
            className={styles.inputField}
            onChange={(e) => setPositions(e.target.value)}
            value={positions}>
          </input>
        </div>
        <div className={styles.menuOption}>
          <header className={styles.inputTitle}>Board Location:</header>
          <input
            className={styles.inputField}
            onChange={(e) => setLocation(e.target.value)}
            value={location}>
          </input>
        </div>
        <div className={styles.menuOption}>
          <header className={styles.inputTitle}>Play:</header>
          {playOption()}
        </div>
        <div className={styles.menuOption}>
          <header className={styles.inputTitle}>Current Move:</header>
          <header className={styles.displayField}>NA</header>
        </div>
        <div className={styles.menuOption}>
          <button className={styles.largeButton} onClick={playNextQueuedAction}>NEXT</button>
        </div>
        <div className={styles.menuOption}>
          <button className={styles.largeButton} onClick={replayLastAction}>RETRY</button>
        </div>
        <div className={styles.doubleOption}>
            <button className={styles.buttonLeft} onClick={onArmLeftClick}><KeyboardArrowLeft fontSize="large"/></button>
            <button className={styles.buttonRight} onClick={onArmRightClick}><KeyboardArrowRight fontSize="large"/></button>
        </div>
        <div className={styles.doubleOption}>
            <button className={styles.buttonLeft} onClick={onArmUpClick}><KeyboardArrowUp fontSize="large"/></button>
            <button className={styles.buttonRight} onClick={onArmDownClick}><KeyboardArrowDown fontSize="large"/></button>
        </div>
      </div>
    </div>
  );
}

export default Moves;