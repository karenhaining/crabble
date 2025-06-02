import styles from './boardstyles.module.css'

function Config({onBackClick, onBoardCalibClick, onHolderCalibClick, onArmForwardClick, onArmBackClick, 
  onBaseLeftClick, onBaseRightClick, onBaseClockwiseClick, onBaseCounterClick, onArucoAlignClick, 
  onParallelParkClick, onReachClick, onBoardCenterClick, onLookDownClick, onHeadClockwiseClick, onHeadCounterClick,
  onWristLevelClick, pickupTile, dropTile, MoveToHolderTarget}:

  {onBackClick: () => void, onBoardCalibClick: () => void, onHolderCalibClick: () => void, onArmForwardClick: () => void,
    onArmBackClick: () => void, onBaseLeftClick: () => void, onBaseRightClick: () => void, 
    onBaseClockwiseClick: () => void, onBaseCounterClick: () => void, onArucoAlignClick: () => void,
    onParallelParkClick: () => void, onReachClick: () => void, onBoardCenterClick: () => void, 
    onLookDownClick: () => void, onHeadClockwiseClick: () => void, onHeadCounterClick: () => void,
    onWristLevelClick: () => void, pickupTile: () => void, dropTile: () => void, MoveToHolderTarget: () => void}) {
  return (
    <div>
      <div className={styles.menuTitle}>CONFIG</div>
      <div className={styles.multiColDiv}>
      <div className={styles.menuOption}>
          <div className={styles.buttonTitleText}>Return to menu</div>
          <button className={styles.largeButton} onClick={onBackClick}>BACK</button>
        </div>
        <div className={styles.menuOption}>
          <div className={styles.buttonTitleText}>Save Calibrations</div>
          <button className={styles.largeButton} onClick={onBoardCalibClick}>BOARD CENTER</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onHolderCalibClick}>HOLDER LEFTMOST</button>
        </div>
        <div className={styles.menuOption}>
          <div className={styles.buttonTitleText}>Wrist Controls</div>
          <button className={styles.largeButton} onClick={onWristLevelClick}>LEVEL WRIST</button>
        </div>
        <div className={styles.menuOption}>
          <div className={styles.buttonTitleText}>Position Controls</div>
          <button className={styles.largeButton} onClick={onArmForwardClick}>ARM FORWARD</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onArmBackClick}>ARM BACK</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onBaseLeftClick}>BASE LEFT</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onBaseRightClick}>BASE RIGHT</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onBaseClockwiseClick}>BASE CLOCKWISE</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onBaseCounterClick}>BASE COUNTER</button>
        </div>
        <div className={styles.menuOption}>
          <div className={styles.buttonTitleText}>Alignment Routines</div>
          <button className={styles.largeButton} onClick={onArucoAlignClick}>ARUCO ALIGN</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onParallelParkClick}>PARALLEL PARK</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onReachClick}>REACH TO FURTHEST ROW</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onBoardCenterClick}>DRIVE TO BOARD CENTER</button>
        </div>
        <div className={styles.menuOption}>
          <div className={styles.buttonTitleText}>Camera Controls</div>
          <button className={styles.largeButton} onClick={onLookDownClick}>LOOK DOWN</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onHeadClockwiseClick}>ROTATE CLOCKWISE</button>
          <br/>
          <br/>
          <button className={styles.largeButton} onClick={onHeadCounterClick}>ROTATE COUNTER</button>
        </div>
        <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Tile Controls</div>
          <button className={styles.largeButton} onClick={pickupTile}>PICKUP TILE</button>
          <button className={styles.largeButton} onClick={dropTile}>PLACE TILE</button>
          <button className={styles.largeButton} onClick={MoveToHolderTarget}>MOVE THE ROBOT TO THE SELECTED HOLDER SPACE AND JEFFREY LIKES TEXT ON BUTTONS</button>
        </div>
      </div>
    </div>
  );
}

export default Config;