import { useRef, useState } from 'react'
import './App.css'
import Board from './board'
import Settings from './Settings';
import Moves from './Moves';
import Menu from './Menu';
import Config from './Config'

function App({onBoardCalibClick, onHolderCalibClick, onArmForwardClick, onArmBackClick, 
  onBaseLeftClick, onBaseRightClick, onBaseClockwiseClick, onBaseCounterClick, onArucoAlignClick, 
  onParallelParkClick, onReachClick, onBoardCenterClick, onLookDownClick, onHeadClockwiseClick, onHeadCounterClick,
  onWristLevelClick}:

  {onBoardCalibClick: () => void, onHolderCalibClick: () => void, onArmForwardClick: () => void,
    onArmBackClick: () => void, onBaseLeftClick: () => void, onBaseRightClick: () => void, 
    onBaseClockwiseClick: () => void, onBaseCounterClick: () => void, onArucoAlignClick: () => void,
    onParallelParkClick: () => void, onReachClick: () => void, onBoardCenterClick: () => void, 
    onLookDownClick: () => void, onHeadClockwiseClick: () => void, onHeadCounterClick: () => void,
    onWristLevelClick: () => void}) {
   
   // INTERFACE THINGS, FOR REAL THIS TIME
   const rawr = new Array(15).fill(null).map(() => new Array(15).fill(""));
   rawr[0][2] = 'C';
   rawr[1][2] = 'R';
   rawr[2][2] = 'A';
   rawr[3][2] = 'B';
   rawr[0][0] = 'M';
   rawr[0][1] = 'I';
   const [menu, setMenu] = useState('MENU');
   const [useCam, setUseCam] = useState(false);
   const [tiles, setTiles] = useState(rawr);
   const [hand, setHand] = useState(new Array(7).fill(null).map(() => ""));
   const [overrideBoard, setOverrideBoard] = useState(new Array(15).fill(null).map(() => new Array(15).fill("")));
   const [overrideHand, setOverrideHand] = useState(new Array(7).fill(null).map(() => ""));
   const [n, setN] = useState(9);
   const [showGridMarkers, setShowGridMarkers] = useState(true);
   const [row, setRow] = useState(0);
   const [col, setCol] = useState(0);
   const [selRow, setSelRow] = useState(-1);
   const [selCol, setSelCol] = useState(-1);
   const [selTile, setSelTile] = useState(-1);

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
      getBoard()
   }

   const boardPanel = () => {
      if (useCam) {
         return <div style={{transform:'rotate(90deg)', paddingRight:'80px'}} id="camera"><img style={{width: '1200px', height: '1200px', objectFit: 'cover'}} id="cameraImage" /></div>;
      } else {
         return (<div style={{paddingRight:'80px'}}>
         <Board
            tiles={tiles}
            overrideBoard={overrideBoard}
            overrideHand={overrideHand}
            hand={hand}
            n={n}
            showGridMarkers={showGridMarkers}
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
         ></Board>
      </div>);
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
            showGridMarkers={showGridMarkers}
            setShowGridMarkers={setShowGridMarkers}
            onBackClick={onBackClick}
            useCam={useCam}
            onCamToggleClick={onCamToggleClick}
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
            onReachClick={onReachClick}
            onBoardCenterClick={onBoardCenterClick}
            onLookDownClick={onLookDownClick}
            onHeadClockwiseClick={onHeadClockwiseClick}
            onHeadCounterClick={onHeadCounterClick}
            onWristLevelClick={onWristLevelClick}
         ></Config>
      } else {
         return <Moves onBackClick={onBackClick} onOverrideBoardClick={onOverrideBoardClick} onOverrideHandClick={onOverrideHandClick}></Moves>
      }
   }


   const getBoard = () => {
      const body = {
         data: msgData
      }
      console.log(msgData)
      fetch('http://localhost:5000/board', {method: 'POST', body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}}).then(res => res.json()).then(doBoardResponse);
   }

   const doBoardResponse = (res: Response): void => {
    console.log(res)
   }


return (
   <div style={{display: 'flex'}}>
      <div>
         {boardPanel()}
      </div>
      <div>
         {menuPanel()}
      </div>
   </div>
)
}

export default App