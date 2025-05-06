import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp } from '@mui/icons-material';
import { ReactElement } from 'react';

const squareTypes: string[][] = [
  ['TW', '', '', 'DL', '', '', '', 'TW', '', '', '', 'DL', '', '', 'TW'],
  ['', 'DW', '', '', '', 'TL', '', '', '', 'TL', '', '', '', 'DW', ''],
  ['', '', 'DW', '', '', '', 'DL', '', 'DL', '', '', '', 'DW', '', ''],
  ['DL', '', '', 'DW', '', '', '', 'DL', '', '', '', 'DW', '', '', 'DL'],
  ['', '', '', '', 'DW', '', '', '', '', '', 'DW', '', '', '', ''],
  ['', 'TL', '', '', '', 'TL', '', '', '', 'TL', '', '', '', 'TL', ''],
  ['', '', 'DL', '', '', '', 'DL', '', 'DL', '', '', '', 'DL', '', ''],
  ['TW', '', '', 'DL', '', '', '', 'DW', '', '', '', 'DL', '', '', 'TW'],
  ['', '', 'DL', '', '', '', 'DL', '', 'DL', '', '', '', 'DL', '', ''],
  ['', 'TL', '', '', '', 'TL', '', '', '', 'TL', '', '', '', 'TL', ''],
  ['', '', '', '', 'DW', '', '', '', '', '', 'DW', '', '', '', ''],
  ['DL', '', '', 'DW', '', '', '', 'DL', '', '', '', 'DW', '', '', 'DL'],
  ['', '', 'DW', '', '', '', 'DL', '', 'DL', '', '', '', 'DW', '', ''],
  ['', 'DW', '', '', '', 'TL', '', '', '', 'TL', '', '', '', 'DW', ''],
  ['TW', '', '', 'DL', '', '', '', 'TW', '', '', '', 'DL', '', '', 'TW'],
];

const tilePoints: Map<string, string> = new Map([
  ['A', '1'], ['B', '3'], ['C', '3'], ['D', '2'], ['E', '1'], ['F', '4'], ['G', '2'], ['H', '4'], ['I', '1'], 
  ['J', '8'], ['K', '5'], ['L', '1'], ['M', '3'], ['N', '1'], ['O', '1'], ['P', '3'], ['Q', '10'], ['R', '1'], 
  ['S', '1'], ['T', '1'], ['U', '1'], ['V', '4'], ['W', '4'], ['X', '8'], ['Y', '4'], ['Z', '10'], [' ', ' '] 
]);

const squareColor: Map<string, string> = new Map([
  ['DL', '#87ceeb'], ['TL', '#6c73f7'], ['DW', '#e6c700'], ['TW', '#ff7474'], ['TILE', '#ddbc87'], ['', '#d9d9d9']
]);

const squareContent: Map<string, string> = new Map([
  ['DL', 'DOUBLE LETTER SCORE'], ['TL', 'TRIPLE LETTER SCORE'], ['DW', 'DOUBLE WORD SCORE'], ['TW', 'TRIPLE WORD SCORE'], ['', '']
]);

function Board(
  { tiles, hand, n, zoom, row, setRow, col, setCol, selRow, setSelRow, selCol, setSelCol}:
  { tiles: string[][], hand: string[], n: number, zoom: number,
    row: number, setRow: (i: number) => void, col: number, setCol: (j: number) => void,
    selRow: number, setSelRow: (i: number) => void, selCol: number, setSelCol: (j: number) => void
  }) {
  const boardSettings = {
      display: 'grid',
      border: `${2.5 * zoom}px solid white`,
      gridTemplateColumns: `repeat(${n}, ${zoom * 80}px)`,
      gridTemplateRows: `repeat(${n}, ${zoom * 80}px)`,
      justifyContent: 'center',
      fontSize: `${zoom * 17}px`,
      fontWeight: 'bolder'    }

  const handSettings = {
    display: 'grid',
    border: `${2.5 * zoom}px solid white`,
    gridTemplateColumns: `repeat(${7}, ${zoom * 80}px)`,
    gridTemplateRows: `repeat(${1}, ${zoom * 80}px)`,
    justifyContent: 'center',
  }

  const tbArrowStyle = {
    width: `${zoom * 70 * n}px`,
    height: `${zoom * 70}px`
  }

  const lrArrowStyle = {
    width: `${zoom * 70}px`,
    height: `${zoom * 70 * n}px`
  }

  const arrowStyle = {
    fontSize: `${zoom * 40}px`
  }

  const tileLetter = {
    fontSize: `${50 * zoom}px`,
    fontWeight: "500"
  }

  const tilePoint = {
    fontSize: `${20 * zoom}px`
  }

  const divs: ReactElement[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const border = (i == selRow && j == selCol) ? `${5.0 * zoom}px solid red` : `${2.5 * zoom}px solid white`;
      if (tiles[row + i][col + j] != '') {
        divs.push(<div key ={15 * i + j} style={{border : border, backgroundColor: squareColor.get('TILE'), color: "black"}}>
          <span style={tileLetter}>{tiles[row + i][col + j]}<sub style={tilePoint}>{tilePoints.get(tiles[row + i][col + j])}</sub></span>
        </div>)
      } else {
        divs.push(<div key ={15 * i + j} style={{border : border, backgroundColor: squareColor.get(squareTypes[row + i][col + j]), color: "black"}}>{squareContent.get(squareTypes[row + i][col + j])}</div>)
      }
    }
  }

  const handDivs: ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    handDivs.push(<div key ={i} style={{border : `${2.5 * zoom}px solid white`, backgroundColor: squareColor.get('TILE'), color: "black"}}>
    <span style={tileLetter}>{hand[i]}<sub style={tilePoint}>{tilePoints.get(hand[i])}</sub></span>
  </div>)
  }



  

  return   <table><tbody>
    <tr>
    <td></td>
    <td><button style={tbArrowStyle} onClick={() => {setRow(Math.max(0, row - 1))}}>
      <KeyboardArrowUp style={arrowStyle}/>
    </button></td>
    <td></td>
  </tr>
  <tr>
    <td><button style={lrArrowStyle} onClick={() => {setCol(Math.max(0, col - 1))}}>
      <KeyboardArrowLeft style={arrowStyle}/>
    </button></td>
    <td>
      <div style={boardSettings}>
        {divs}
      </div>
    </td>
    <td><button style={lrArrowStyle} onClick={() => {setCol(Math.min(6, col + 1))}}>
      <KeyboardArrowRight style={arrowStyle}/>
    </button></td>
  </tr>
  <tr>
    <td></td>
    <td><button style={tbArrowStyle} onClick={() => {setRow(Math.min(6, row + 1))}}>
      <KeyboardArrowDown style={arrowStyle}/>
    </button></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><div style={handSettings} >{handDivs}</div></td>
    <td></td>
  </tr>
  </tbody></table>
}

export default Board;