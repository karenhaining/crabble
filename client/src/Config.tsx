import styles from './boardstyles.module.css'

function Config({onBackClick, onBoardCalibClick, onHolderCalibClick, onArmForwardClick, onArmBackClick, 
  onBaseLeftClick, onBaseRightClick, onBaseClockwiseClick, onBaseCounterClick, onArucoAlignClick, 
  onParallelParkClick, onBoardCenterClick, pickupTile, dropTile, MoveToHolderTarget, StowArm, loadCalibration, 
  DeployArm}:

  {onBackClick: () => void, onBoardCalibClick: () => void, onHolderCalibClick: () => void,
    onArmForwardClick: (markiplier: number) => void, onArmBackClick: (markiplier: number) => void,
    onBaseLeftClick: (markiplier: number) => void, onBaseRightClick: (markiplier: number) => void, 
    onBaseClockwiseClick: () => void, onBaseCounterClick: () => void, onArucoAlignClick: () => void,
    onParallelParkClick: () => void, onBoardCenterClick: () => void, 
    pickupTile: () => void, dropTile: () => void, MoveToHolderTarget: () => void, 
    StowArm: () => void, loadCalibration: () => void, DeployArm: () => void}) {
  return (
    <div>
      <div className={styles.menuTitle}>CONFIG</div>
      <div className={styles.multiColDiv}>
      <div className={styles.menuOption}>
          <div className={styles.optionTitle}>Return to menu</div>
          <button className={styles.mediumButton} onClick={onBackClick}>BACK</button>
        </div>
        <div className={styles.menuOption}>
          <div className={styles.optionTitle}>Save Calibrations</div>
          <button className={styles.mediumButton} onClick={onBoardCalibClick}>BOARD CENTER</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={onHolderCalibClick}>HOLDER LEFTMOST</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={loadCalibration}>Load Calibration</button>
        </div>
        <div className={styles.menuOption}>
          <div className={styles.optionTitle}>Position Controls</div>
          <button className={styles.mediumButton} onClick={() => onArmForwardClick(1)}>ARM FORWARD</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={() => onArmBackClick(1)}>ARM BACK</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={() => onBaseLeftClick(1)}>BASE LEFT</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={() => onBaseRightClick(1)}>BASE RIGHT</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={onBaseClockwiseClick}>BASE CLOCKWISE</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={onBaseCounterClick}>BASE COUNTER</button>
        </div>
        <div className={styles.menuOption}>
          <div className={styles.optionTitle}>Alignment Routines</div>
          <button className={styles.mediumButton} onClick={onArucoAlignClick}>ARUCO ALIGN</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={onParallelParkClick}>PARALLEL PARK</button>
          <br/>
          <br/>
          <button className={styles.mediumButton} onClick={onBoardCenterClick}>DRIVE TO BOARD CENTER</button>
        </div>
        <div className={styles.menuOption}>
        <div className={styles.optionTitle}>Tile Controls</div>
          <button className={styles.mediumButton} onClick={pickupTile}>PICKUP TILE</button>
          <button className={styles.mediumButton} onClick={dropTile}>PLACE TILE</button>
          <button className={styles.mediumButton} onClick={MoveToHolderTarget}>MOVE TO SELECTED HOLDER SPACE</button>
          <button className={styles.mediumButton} onClick={StowArm}>STOW ARM</button>
          <button className={styles.mediumButton} onClick={DeployArm}>DEPLOY ARM</button>
        </div>
      </div>
    </div>
  );
}

export default Config;