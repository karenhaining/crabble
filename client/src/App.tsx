import { useState } from 'react'
import './App.css'
import Board from './board'

function App() {
   const rawr = new Array(15).fill(null).map(() => new Array(15).fill(""));
   rawr[0][2] = 'D';
   rawr[1][2] = ' ';
   rawr[2][2] = 'C';
   rawr[3][2] = 'K';
   rawr[0][0] = 'R';
   rawr[0][1] = 'O';
  const [tiles, setTiles] = useState(rawr);
  const [n, setN] = useState(9);
  const [row, setRow] = useState(0);
  const [col, setCol] = useState(0);
  const [selRow, setSelRow] = useState(1);
  const [selCol, setSelCol] = useState(0);

  const hand: string[] = ['C', 'R', 'A', 'B', 'B', 'L', 'E'];

return (
   <>
      <Board
         tiles={tiles}
         hand={hand}
         n={n}
         zoom={1}
         row={row}
         setRow={setRow}
         col={col}
         setCol={setCol}
         selRow={selRow}
         setSelRow={setSelRow}
         selCol={selCol}
         setSelCol={setSelCol}
      ></Board>
   </>
)
}

export default App