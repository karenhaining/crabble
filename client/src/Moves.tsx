import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp} from '@mui/icons-material';
import styles from './boardstyles.module.css'
import { useState } from 'react';

function Moves(
  {onBackClick, onOverrideBoardClick, onOverrideHandClick,
   onArmLeftClick, onArmRightClick, onArmUpClick, onArmDownClick,
   queueWord, playNextQueuedAction, replayLastAction, getBoard, clearQueue,
   actionQueue}:
  {onBackClick: () => void, onOverrideBoardClick: (letter: String) => void, onOverrideHandClick: (letter: String) => void,
   onArmLeftClick: (markiplier: number) => void, onArmRightClick: (markiplier: number) => void,
   onArmUpClick: (markiplier: number) => void, onArmDownClick: (markiplier: number) => void,
   queueWord: (r: number, c: number, direction: string, positions: string) => void,
   playNextQueuedAction: () => void,
   replayLastAction: () => void,
   getBoard: () => void,
   clearQueue: () => void,
   actionQueue: number[][]
  }) {
  const [letter, setLetter] = useState('');
  const [positions, setPositions] = useState('');
  const [location, setLocation] = useState('');
  const [playing, setPlaying] = useState(false);

  const onPlay = (dir: string) => {
    getBoard()
    const r = parseInt(location.substring(1, location.length));
    const c = location.toUpperCase().charCodeAt(0) - 65 + 1;
    setPlaying(true);
    queueWord(r, c, dir, positions);
  }

  const onEndTurn = () => {
    setPlaying(false)
    clearQueue()
  }

  // type: if 0, stow. ignore other coords
      //       if 1, go to holder position defined in coord1
      //       if 2, go to board position defined as row = coord1, col = coord2
      //       if 3, pick up a tile (assumed to be over the holder)
      //       if 4, place a tile (assumed to be over the board)
      //       if 5, ready the arm
  const nextMove = () => {
    const currMove = actionQueue[0];
    if (currMove != undefined) {
      switch (currMove[0]) {
      case 0: // stow the arm
        return "Stow Arm";
      case 1: // go to holder position
        return `Holder ${currMove[1]}`
      case 2: // go to board position
        return `Board ${String.fromCharCode(65 + currMove[2] - 1)}${currMove[1]}`
      case 3: // pick up a tile
        return `Pick up`
      case 4: // drop a tile
        return `Drop`
      case 5: 
        return `Deploy arm`
      default: // do nothing if this is an invalid opcode
        return `NA`
      }
    }
    return `NA`
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
        <div>
          <div className={styles.menuScreen}>
            <div className={styles.menuOption}>
              <button className={styles.largeButton} onClick={onBackClick}>BACK</button>
            </div>
            <div className={styles.menuOption}>
              <button className={styles.largeButton} onClick={getBoard}>REFRESH</button>
            </div>
          </div>
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
          </div>
        </div>
      );
    }
  }
  return (
    <div>
      <header className={styles.menuTitle}>PLAY</header>
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
          <header className={styles.inputTitle}>Next Move:</header>
          <header className={styles.displayField}>{nextMove()}</header>
        </div>
        <div className={styles.menuOption}>
          <button className={styles.largeButton} onClick={playNextQueuedAction}>NEXT</button>
        </div>
        <div className={styles.menuOption}>
          <button className={styles.largeButton} onClick={replayLastAction}>RETRY</button>
        </div>
        <div className={styles.doubleOption}>
            <header className={styles.inputTitle}>Small nudge:</header>
            <button className={styles.buttonLeft} onClick={() => onArmLeftClick(1)}><KeyboardArrowLeft fontSize="large"/></button>
            <button className={styles.buttonRight} onClick={() => onArmRightClick(1)}><KeyboardArrowRight fontSize="large"/></button>
        </div>
        <div className={styles.doubleOption}>
            <header className={styles.inputTitle}>Large nudge:</header>
            <button className={styles.buttonLeft} onClick={() => onArmLeftClick(3)}><KeyboardArrowLeft fontSize="large"/></button>
            <button className={styles.buttonRight} onClick={() => onArmRightClick(3)}><KeyboardArrowRight fontSize="large"/></button>
        </div>
        <div className={styles.doubleOption}>
            <button className={styles.buttonLeft} onClick={() => onArmUpClick(1)}><KeyboardArrowUp fontSize="large"/></button>
            <button className={styles.buttonRight} onClick={() => onArmDownClick(1)}><KeyboardArrowDown fontSize="large"/></button>
        </div>
        <div className={styles.doubleOption}>
            <button className={styles.buttonLeft} onClick={() => onArmUpClick(3)}><KeyboardArrowUp fontSize="large"/></button>
            <button className={styles.buttonRight} onClick={() => onArmDownClick(3)}><KeyboardArrowDown fontSize="large"/></button>
        </div>
      </div>
    </div>
  );
}

export default Moves;