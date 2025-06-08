import { ReactElement, useState } from 'react'
import './App.css'
import Board from './board'
import Settings from './Settings';
import Moves from './Moves';
import Menu from './Menu';
import Config from './Config'

function App(
   {onBoardCalibClick, onHolderCalibClick, onArmForwardClick, onArmBackClick, 
    onBaseLeftClick, onBaseRightClick, onBaseClockwiseClick, onBaseCounterClick, onArucoAlignClick, 
    onParallelParkClick, onBoardCenterClick, pickupTile, dropTile, MoveToHolderTarget,
    playAction, StowArm, loadCalibration, DeployArm
   }:

   {onBoardCalibClick: () => void, onHolderCalibClick: () => void,
    onArmForwardClick: (multiplier: number) => void, onArmBackClick: (markiplier: number) => void,
    onBaseLeftClick: (markiplier: number) => void, onBaseRightClick: (markiplier: number) => void, 
    onBaseClockwiseClick: () => void, onBaseCounterClick: () => void, onArucoAlignClick: () => void,
    onParallelParkClick: () => void, onBoardCenterClick: () => void, 
    pickupTile: () => void, dropTile: () => void, MoveToHolderTarget: (target: number) => void,
    playAction: (action: number[]) => void, StowArm: () => void, loadCalibration: () => void, DeployArm: () => void
   }) {
   
   // INTERFACE THINGS, FOR REAL THIS TIME
   const [menu, setMenu] = useState('MENU');
   const [useCam, setUseCam] = useState(false);
   const [board, setBoard] = useState(new Array(15).fill(null).map(() => new Array(15).fill("")));
   const [hand, setHand] = useState(new Array(7).fill(null).map(() => ""));
   const [overrideBoard, setOverrideBoard] = useState(new Array(15).fill(null).map(() => new Array(15).fill("")));
   const [overrideHand, setOverrideHand] = useState(new Array(7).fill(null).map(() => ""));
   const [n, setN] = useState(7);
   const [row, setRow] = useState(0);
   const [col, setCol] = useState(0);
   const [selRow, setSelRow] = useState(-1);
   const [selCol, setSelCol] = useState(-1);
   const [selTile, setSelTile] = useState(-1);
   const [actionQueue, setActionQueue] = useState([[-1, -1, -1]]);
   const [lastPlayedAction, setLastPlayedAction] = useState([-1, -1, -1]);

   const boardMinus = () => {
      if (n > 3) {
         setRow(row + 1);
         setCol(col + 1);
         setN(n - 2);
      }
   }

   const boardPlus = () => {
      if (n < 15) {
         const newRow = Math.max(Math.min(15 - n - 2, row - 1), 0)
         const newCol = Math.max(Math.min(15 - n - 2, col - 1), 0)
         console.log(n, row, col, newRow, newCol)
         setRow(newRow);
         setCol(newCol);
         setN(n + 2);
      }
    }

   const onBackClick = () => {
   setMenu('MENU');
   }
      
   const onOverrideBoardClick = (letter: String) => {
      const newOverrideBoard = overrideBoard.map((row, i) =>
         i === selRow ? row.map((col, j) => (j === selCol ? letter.toUpperCase() : col)) : row
      );
      setOverrideBoard(newOverrideBoard);
   }

   const onOverrideHandClick = (letter: String) => {
      const newOverrideHand = overrideHand.map((val, i) =>
         i == selTile ? letter.toUpperCase() : val
      )
      setOverrideHand(newOverrideHand);
   }

   const onCamToggleClick = () => {
      setUseCam(!useCam);
   }

   // destination: row, column
   // direction: R or D
   // holder positions: series of numbers from 1-7, inclusive, or . to indicate no letter played
   const queueWord = (r: number, c: number, direction: string, positions: string) => {
      // only queue a word if the action queue is not empty
      const newActionQueue = [];

      // at the beginning of the queue, ready the arm
      newActionQueue.push([5, 0, 0]);

      console.log("QUEUEING:");
      console.log("Row: " + r);
      console.log("Column: " + c);
      console.log("Direction: " + direction);
      console.log("Positions: " + positions);

      // QUEUE FORMAT:
      // each element is a tuple [type, coord1, coord2]
      // type: if 0, stow. ignore other coords
      //       if 1, go to holder position defined in coord1
      //       if 2, go to board position defined as row = coord1, col = coord2
      //       if 3, pick up a tile (assumed to be over the holder)
      //       if 4, place a tile (assumed to be over the board)
      //       if 5, ready the arm

      // loop through the holder positions given 
      for (let char of positions) {
         // get the holder slot. remember it might be a '.' to indicate that 
         // the tile is already on the board there
         let slot = parseInt(char);

         // only add goals for picking up and placing a tile if we're not over a '.'
         if (!isNaN(slot)) {
            // move to the holder position
            newActionQueue.push([1, slot, 0])
            // pick up tile 
            newActionQueue.push([3, 0, 0])
            // move to the board location
            newActionQueue.push([2, r, c])
            // place tile
            newActionQueue.push([4, 0, 0])
         }
         // always increment the row/col
         if (direction == "D") {
            r++;
         } else {
            c++;
         }
      }
      // at the end of the queue, stow the arm to prepare for next round
      newActionQueue.push([0, 0, 0]);
      console.log(newActionQueue);
      setActionQueue(newActionQueue);
   }

   const playNextQueuedAction = () => {
      // pop off the next action to play from the queue
      const newActionQueue = [...actionQueue];
      const action = newActionQueue.shift()
      if (action != undefined) {
         setActionQueue(newActionQueue)
         // mark this action as our last played action
         setLastPlayedAction(action);
         playAction(action);
      }
   }

   const clearQueue = () => {
      setOverrideHand(new Array(7).fill(null).map(() => ""));
      setActionQueue([[-1, -1, -1]]);
      setLastPlayedAction([-1, -1, -1]);
   }

   const replayLastAction = () => {
      if (lastPlayedAction[0] == 3) {
         playAction(lastPlayedAction);
      }
   }

   const menuPanel = () => {
      if (menu === 'MENU') {
         return <Menu onOptionClick={setMenu}></Menu>
      } else if (menu === 'SETTING') {
         return <Settings
            n={n}
            boardMinus={boardMinus}
            boardPlus={boardPlus}
            onBackClick={onBackClick}
         ></Settings>
      } else if (menu == 'CONFIG'){
         return <Config 
            onBackClick={onBackClick} 
            onBoardCalibClick={onBoardCalibClick}
            onHolderCalibClick={onHolderCalibClick}
            onArmForwardClick={onArmForwardClick}
            onArmBackClick={onArmBackClick} 
            onBaseLeftClick={onBaseLeftClick}
            onBaseRightClick={onBaseRightClick}
            onBaseClockwiseClick={onBaseClockwiseClick}
            onBaseCounterClick={onBaseCounterClick}
            onArucoAlignClick={onArucoAlignClick} 
            onParallelParkClick={onParallelParkClick} 
            onBoardCenterClick={onBoardCenterClick}
            pickupTile={pickupTile}
            dropTile={dropTile}
            MoveToHolderTarget={() => {MoveToHolderTarget(selTile)}}
            StowArm={StowArm}
            loadCalibration={loadCalibration}
            DeployArm={DeployArm}
         ></Config>
      } else {
         return <Moves onBackClick={onBackClick} 
                       onOverrideBoardClick={onOverrideBoardClick} 
                       onOverrideHandClick={onOverrideHandClick}
                       onArmLeftClick={onBaseLeftClick}
                       onArmRightClick={onBaseRightClick}
                       onArmUpClick={onArmForwardClick}
                       onArmDownClick={onArmBackClick}
                       queueWord={queueWord}
                       playNextQueuedAction={playNextQueuedAction}
                       replayLastAction={replayLastAction}
                       getBoard={getBoard}
                       clearQueue={clearQueue}
                       actionQueue={actionQueue}
               ></Moves>
      }
   }


   const getBoard = () => {
      const body = document.getElementById("cameraImage")?.getAttribute("src")
      fetch('http://localhost:5000/board', {method: 'POST', body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}}).then(doBoardResponse);
   }

   const isRecord = (val: unknown): val is Record<string, unknown> => {
      return val !== null && typeof val === "object";
   };

   const doBoardResponse = (res: Response): void => {
      if (res.status === 200) {
         res.json().then(doBoardJson)
      } else {
         console.log(res)
      }
   }

   const doBoardJson = (data: unknown): void => {
      if (isRecord(data) && Array.isArray(data.board) && Array.isArray(data.hand)) {
         setBoard(data.board)
         setHand(data.hand)
      }
   }


return (
   <div style={{display: 'flex'}}>
      <div style={{marginRight: '15px'}}>
         {menuPanel()}
      </div>
      <div>
         <Board
               board={board}
               overrideBoard={overrideBoard}
               overrideHand={overrideHand}
               hand={hand}
               n={n}
               row={row}
               setRow={setRow}
               col={col}
               setCol={setCol}
               selRow={selRow}
               setSelRow={setSelRow}
               selCol={selCol}
               setSelCol={setSelCol}
               selTile={selTile}
               setSelTile={setSelTile}
               useCam={useCam}
               onCamToggleClick={onCamToggleClick}
            ></Board>
      </div>
   </div>
)
}

export default App