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
  ['S', '1'], ['T', '1'], ['U', '1'], ['V', '4'], ['W', '4'], ['X', '8'], ['Y', '4'], ['Z', '10']
]);

const squareColor: Map<string, string> = new Map([
  ['DL', '#87ceeb'], ['TL', '#6c73f7'], ['DW', '#e6c700'], ['TW', '#ff7474'], ['TILE', '#ddbc87'], ['', '#d9d9d9']
]);

const squareContent: Map<string, string> = new Map([
  ['DL', 'DOUBLE LETTER SCORE'], ['TL', 'TRIPLE LETTER SCORE'], ['DW', 'DOUBLE WORD SCORE'], ['TW', 'TRIPLE WORD SCORE'], ['', '']
]);

function Board(
  { board, overrideBoard, overrideHand, hand, n, row, setRow, col, setCol, selRow, setSelRow, selCol, setSelCol, selTile, setSelTile, useCam, onCamToggleClick}:
  { board: string[][], overrideBoard: string[][], overrideHand: string[], hand: string[], n: number,
    row: number, setRow: (i: number) => void, col: number, setCol: (j: number) => void,
    selRow: number, setSelRow: (i: number) => void, selCol: number, setSelCol: (j: number) => void,
    selTile: number, setSelTile: (i: number) => void,
    useCam: boolean, onCamToggleClick: () => void
  }) {
  
  // Increase board div size to account for board markers
  const boardGridSize = n + 2

  // Board style must be set dynamically so that the user can change the size
  const boardSettings = {
      display: 'grid',
      border: `2.5px solid white`,
      gridTemplateColumns: `repeat(${boardGridSize}, 60px)`,
      gridTemplateRows: `repeat(${boardGridSize}, 60px)`,
      justifyContent: 'center',
      fontSize: `12px`,
      fontWeight: 'bolder'
    }

  const tbArrowStyle = {
    width: `${60 * (boardGridSize)}px`,
    height: `${75}px`,
    paddingLeft: '0px',
    paddingRight: '0px'
  }
  const lrArrowStyle = {
    width: `${75}px`,
    height: `${60 * (boardGridSize)}px`,
    paddingLeft: '0px',
    paddingRight: '0px'
  }


  const boardDivs: ReactElement[] = [];
  // Black div to fill in corners
  boardDivs.push(<div key={"b1"}></div>)
  // Add grid markers
  for (let i = 0; i < n; i++) {
    boardDivs.push(<div key={'tg' + i} className={styles.gridMarker}>{String.fromCharCode(65 + col + i)}</div>)
  }
  boardDivs.push(<div key={"b2"}></div>)

  for (let i = 0; i < n; i++) {
    boardDivs.push(<div key={'lg' + i} className={styles.gridMarker}>{row + i + 1}</div>)
    for (let j = 0; j < n; j++) {
      const border = (row + i == selRow && col + j == selCol) ? `5px solid red` : `2.5px solid white`;
      if (overrideBoard[row + i][col + j] != '' && (overrideBoard[row + i][col + j] != '-')) {
        boardDivs.push(<div key ={15 * i + j} style={{border : border, backgroundColor: squareColor.get('TILE'), color: "black"}} onClick={() => {setSelRow(row + i); setSelCol(col + j)}}>
          <span className={styles.tileLetter}>{overrideBoard[row + i][col + j]}<sub className={styles.tilePoint}>{tilePoints.get(overrideBoard[row + i][col + j])}</sub></span>
        </div>)
      } else if (board[row + i][col + j] != '' && (overrideBoard[row + i][col + j] != '-')) {
        boardDivs.push(<div key ={15 * i + j} style={{border : border, backgroundColor: squareColor.get('TILE'), color: "black"}} onClick={() => {setSelRow(row + i); setSelCol(col + j)}}>
          <span className={styles.tileLetter}>{board[row + i][col + j]}<sub className={styles.tilePoint}>{tilePoints.get(board[row + i][col + j])}</sub></span>
        </div>)
      } else {
        boardDivs.push(<div key ={15 * i + j} style={{border : border, backgroundColor: squareColor.get(squareTypes[row + i][col + j]), color: "black"}} onClick={() => {setSelRow(row + i); setSelCol(col + j)}}>{squareContent.get(squareTypes[row + i][col + j])}</div>)
      }
    }
   boardDivs.push(<div key={'rg' + i} className={styles.gridMarker}>{row + i + 1}</div>)
  }

  boardDivs.push(<div key={"b3"}></div>)
  for (let i = 0; i < n; i++) {
    boardDivs.push(<div key={'bg' + i} className={styles.gridMarker}>{String.fromCharCode(65 + col + i)}</div>)
  }
  boardDivs.push(<div key={"b4"}></div>)

  const handDivs: ReactElement[] = [];
  for (let i = 0; i < 7; i++) {
    handDivs.push(<div key={'hg' + i} className={styles.gridMarker}>{i + 1}</div>)
    const border = (i == selTile) ? `5px solid red` : `2.5px solid white`;
    if (overrideHand[i] != '-' && overrideHand[i] != '') {
      handDivs.push(
      <div key ={i} style={{border : border, backgroundColor: squareColor.get('TILE'), color: "black"}} onClick={() => {setSelTile(i)}}>
        <span className={styles.tileLetter}>{overrideHand[i]}<sub className={styles.tilePoint}>{tilePoints.get(overrideHand[i])}</sub></span>
      </div>);
    } else if (overrideHand[i] == '') {
      handDivs.push(
      <div key ={i} style={{border : border, backgroundColor: squareColor.get('TILE'), color: "black"}} onClick={() => {setSelTile(i)}}>
        <span className={styles.tileLetter}>{hand[i]}<sub className={styles.tilePoint}>{tilePoints.get(hand[i])}</sub></span>
      </div>);
    } else {
      handDivs.push(
      <div key ={i} style={{border : border, backgroundColor: squareColor.get('TILE'), color: "black"}} onClick={() => {setSelTile(i)}}></div>);
    }
  }

  const camText = (useCam) ? 'ON' : 'OFF'; 

  const getBoardView = () => {
    if (useCam) {
      return <div></div>;
    } else {
      return (<div className={styles.gameBoard}>
        <table><tbody>
          <tr>
          <td></td>
          <td><button style={tbArrowStyle} onClick={() => {setRow(Math.max(0, row - 1))}}>
            <KeyboardArrowUp fontSize="large"/>
          </button></td>
          <td></td>
        </tr>
        <tr>
          <td><button style={lrArrowStyle} onClick={() => {setCol(Math.max(0, col - 1))}}>
            <KeyboardArrowLeft fontSize="large"/>
          </button></td>
          <td>
            <div style={boardSettings}>
              {boardDivs}
            </div>
          </td>
          <td><button style={lrArrowStyle} onClick={() => {setCol(Math.min(15 - n, col + 1))}}>
            <KeyboardArrowRight fontSize="large"/>
          </button></td>
        </tr>
        <tr>
          <td></td>
          <td><button style={tbArrowStyle} onClick={() => {setRow(Math.min(15 - n, row + 1))}}>
            <KeyboardArrowDown fontSize="large"/>
          </button></td>
          <td></td>
        </tr>
        </tbody></table>
      </div>);
    }
  }


  return (
    <div style={{display: 'flex'}}>
      <div style={{marginRight: '15px'}}>
        <div className={styles.menuOption}>
          <button className={styles.smallButton} onClick={onCamToggleClick}>{`CAM ${camText}`}</button>
        </div>
        <div className={styles.hand} >{handDivs}</div>
      </div>
      {getBoardView()}
    </div>);
}

export default Board;