import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp} from '@mui/icons-material';
import styles from './boardstyles.module.css'
import { useState } from 'react';

function Moves({onBackClick, onOverrideBoardClick, onOverrideHandClick, onPlayTileClick} : {onBackClick: () => void, onOverrideBoardClick: (letter: String) => void, onOverrideHandClick: (letter: String) => void, onPlayTileClick: () => void}) {
  const [letter, setLetter] = useState('');
  const [playing, setPlaying] = useState(false);

  const onPlayDown = () => {
    setPlaying(true)
  }

  const onPlayAcross = () => {
    setPlaying(true)
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
          <button className={styles.buttonLeft} onClick={onPlayDown}>D</button>
          <button className={styles.buttonRight} onClick={onPlayAcross}>A</button>
        </div>
      )
    }
  }

  const overrideOption = () => {
    if (playing) {
      return [];
    } else {
      return [
      <div className={styles.menuOption} key={'overrride'}>
        <header className={styles.inputTitle}>Override tile:</header>
        <div style={{display: 'flex'}}>
          <input className={styles.smallInputField}></input>
            <button className={styles.smallButton} onClick={() => onOverrideHandClick(letter)}>Hand</button>
            <button className={styles.smallButton} onClick={() => onOverrideBoardClick(letter)}>Board</button>
        </div>
      </div>,
      <div key={'filler'}></div>];
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
          <button className={styles.largeButton} onClick={onBackClick}>REFRESH</button>
        </div>
        {overrideOption()}
        <div className={styles.menuOption}>
          <header className={styles.inputTitle}>Word:</header>
          <input className={styles.inputField}></input>
        </div>
        <div className={styles.menuOption}>
          <header className={styles.inputTitle}>Board Location:</header>
          <input className={styles.inputField}></input>
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
          <button className={styles.largeButton} onClick={onBackClick}>NEXT</button>
        </div>
        <div className={styles.menuOption}>
          <button className={styles.largeButton} onClick={onBackClick}>RETRY</button>
        </div>
        <div className={styles.doubleOption}>
            <button className={styles.buttonLeft} onClick={onBackClick}><KeyboardArrowLeft fontSize="large"/></button>
            <button className={styles.buttonRight} onClick={onBackClick}><KeyboardArrowRight fontSize="large"/></button>
        </div>
        <div className={styles.doubleOption}>
            <button className={styles.buttonLeft} onClick={onBackClick}><KeyboardArrowDown fontSize="large"/></button>
            <button className={styles.buttonRight} onClick={onBackClick}><KeyboardArrowUp fontSize="large"/></button>
        </div>
      </div>
    </div>
  );
}

export default Moves;