import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp } from '@mui/icons-material';
import { ReactElement } from 'react';
import styles from './boardstyles.module.css'

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
  { tiles, hand, n, showGridMarkers, row, setRow, col, setCol, selRow, setSelRow, selCol, setSelCol, selTile, setSelTile}:
  { tiles: string[][], hand: string[], n: number, showGridMarkers: boolean,
    row: number, setRow: (i: number) => void, col: number, setCol: (j: number) => void,
    selRow: number, setSelRow: (i: number) => void, selCol: number, setSelCol: (j: number) => void,
    selTile: number, setSelTile: (i: number) => void
  }) {
  
  const boardGridSize = (showGridMarkers) ? n + 2 : n;

  const boardSettings = {
      display: 'grid',
      border: `2.5px solid white`,
      gridTemplateColumns: `repeat(${boardGridSize}, 80px)`,
      gridTemplateRows: `repeat(${boardGridSize}, 80px)`,
      justifyContent: 'center',
      fontSize: `16px`,
      fontWeight: 'bolder'
    }

  const tbArrowStyle = {
    width: `${80 * (boardGridSize)}px`,
    height: `${100}px`
  }

  const lrArrowStyle = {
    width: `${100}px`,
    height: `${80 * (boardGridSize)}px`
  }

  const divs: ReactElement[] = [];

  // Add grid markers
  if (showGridMarkers) {
    divs.push(<div></div>)
    for (let i = 0; i < n; i++) {
      divs.push(<div className={styles.gridMarker}>{String.fromCharCode(65 + col + i)}</div>)
    }
    divs.push(<div></div>)
  }

  for (let i = 0; i < n; i++) {
    if (showGridMarkers) divs.push(<div  className={styles.gridMarker}>{row + i + 1}</div>)
    for (let j = 0; j < n; j++) {
      const border = (row + i == selRow && col + j == selCol) ? `5px solid red` : `2.5px solid white`;
      if (tiles[row + i][col + j] != '') {
        divs.push(<div key ={15 * i + j} style={{border : border, backgroundColor: squareColor.get('TILE'), color: "black"}} onClick={() => {setSelRow(row + i); setSelCol(col + j)}}>
          <span className={styles.tileLetter}>{tiles[row + i][col + j]}<sub className={styles.tilePoint}>{tilePoints.get(tiles[row + i][col + j])}</sub></span>
        </div>)
      } else {
        divs.push(<div key ={15 * i + j} style={{border : border, backgroundColor: squareColor.get(squareTypes[row + i][col + j]), color: "black"}} onClick={() => {setSelRow(row + i); setSelCol(col + j)}}>{squareContent.get(squareTypes[row + i][col + j])}</div>)
      }
    }
    if (showGridMarkers) divs.push(<div className={styles.gridMarker}>{row + i + 1}</div>)

  }

  if (showGridMarkers) {
    divs.push(<div></div>)
    for (let i = 0; i < n; i++) {
      divs.push(<div  className={styles.gridMarker}>{String.fromCharCode(65 + col + i)}</div>)
    }
    divs.push(<div></div>)
  }

  const handDivs: ReactElement[] = [];
  for (let i = 0; i < 7; i++) {
    const border = (i == selTile) ? `5px solid red` : `2.5px solid white`;
    handDivs.push(
      <div key ={i} style={{border : border, backgroundColor: squareColor.get('TILE'), color: "black"}} onClick={() => {setSelTile(i)}}>
        <span className={styles.tileLetter}>{hand[i]}<sub className={styles.tilePoint}>{tilePoints.get(hand[i])}</sub></span>
      </div>
    )
  }



  

  return (
    <div>
      <div className={styles.gameBoard}>
        <table><tbody>
          <tr>
          <td></td>
          <td><button style={tbArrowStyle} onClick={() => {setRow(Math.max(0, row - 1))}}>
            <KeyboardArrowUp className={styles.arrow}/>
          </button></td>
          <td></td>
        </tr>
        <tr>
          <td><button style={lrArrowStyle} onClick={() => {setCol(Math.max(0, col - 1))}}>
            <KeyboardArrowLeft className={styles.arrow}/>
          </button></td>
          <td>
            <div style={boardSettings}>
              {divs}
            </div>
          </td>
          <td><button style={lrArrowStyle} onClick={() => {setCol(Math.min(15 - n, col + 1))}}>
            <KeyboardArrowRight className={styles.arrow}/>
          </button></td>
        </tr>
        <tr>
          <td></td>
          <td><button style={tbArrowStyle} onClick={() => {setRow(Math.min(15 - n, row + 1))}}>
            <KeyboardArrowDown className={styles.arrow}/>
          </button></td>
          <td></td>
        </tr>
        </tbody></table>
      </div>
      <div className={styles.hand} >{handDivs}</div>
    </div>);
}

export default Board;