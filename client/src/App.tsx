import { useState } from 'react'
import './App.css'
import Board from './board'
import Settings from './Settings';
import Moves from './Moves';
import Menu from './Menu';

function App() {
   const rawr = new Array(15).fill(null).map(() => new Array(15).fill(""));
   rawr[0][2] = 'C';
   rawr[1][2] = 'R';
   rawr[2][2] = 'A';
   rawr[3][2] = 'B';
   rawr[0][0] = 'M';
   rawr[0][1] = 'I';
   const [menu, setMenu] = useState('MENU');
   const [tiles, setTiles] = useState(rawr);
   const [n, setN] = useState(7);
   const [showGridMarkers, setShowGridMarkers] = useState(true);
   const [row, setRow] = useState(0);
   const [col, setCol] = useState(0);
   const [selRow, setSelRow] = useState(-1);
   const [selCol, setSelCol] = useState(-1);
   const [selTile, setSelTile] = useState(-1);

   const hand: string[] = ['C', 'R', 'A', 'B', 'B', 'L', 'E'];


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
         ></Settings>
      } else {
         return <Moves onBackClick={onBackClick}></Moves>
      }
   }

return (
   <div style={{display: 'flex'}}>
      <div style={{paddingRight:'80px'}}>
         <Board
            tiles={tiles}
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
      </div>
      <div>
         {menuPanel()}
      </div>
   </div>
)
}

export default App