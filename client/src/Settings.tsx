import styles from './boardstyles.module.css'

function Settings({n, boardMinus, boardPlus, showGridMarkers, setShowGridMarkers, onBackClick}:
  {n: number, boardMinus: () => void, boardPlus: () => void, showGridMarkers: boolean, setShowGridMarkers: (b: boolean) => void, onBackClick: () => void}) {

  const gridText = (showGridMarkers) ? 'ON' : 'OFF'; 

  return (
    <div>
      <div className={styles.menuTitle}>SETTINGS</div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Board Size</div>
        <div className={styles.zoomInput}>
          <button className={styles.zoomButton} onClick={boardMinus}>-</button>
            <div className={styles.zoomText}>{n}</div>
          <button className={styles.zoomButton} onClick={boardPlus}>+</button>
        </div>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Show Grid Marker</div>
        <button className={styles.largeButton} onClick={() => setShowGridMarkers(!showGridMarkers)}>{gridText}</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Show Cam View</div>
        <button className={styles.largeButton}>OFF</button>
      </div>
      <div className={styles.menuOption}>
        <div className={styles.buttonTitleText}>Return to Menu</div>
        <button className={styles.largeButton} onClick={onBackClick}>BACK</button>
      </div>
    </div>
    
  );
}

export default Settings;