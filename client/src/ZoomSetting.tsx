function ZoomSetting({n, setN, zoom, setZoom} : {n: number, setN: (i: number) => void, zoom:number, setZoom: (i: number) => void}) {
  return <div style={{display: 'flex'}}>
    <button>-</button>
    <input
      type='text'
      value={n}
      onChange={(e) => {}}>
    </input>
    <button>+</button>
  </div>
}

export default ZoomSetting;