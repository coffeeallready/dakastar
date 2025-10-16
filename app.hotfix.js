/* Hotfix v2: Drive 按鈕就緒 + 一定有反應 + 清楚提示 */
(function(){
  const $ = s=>document.querySelector(s)
  const needReady = ['#btnDriveAuth','#btnDriveLoad','#btnDriveUpload']

  // 先禁用，避免「載入中」誤按
  needReady.forEach(sel=>{
    const el=$(sel)
    if(el){ el.disabled = true; el.title = '載入 Google 模組中…' }
  })

  function ready(){
    return typeof window.gapi !== 'undefined'
        && gapi.client
        && typeof window.google !== 'undefined'
        && google.accounts && google.accounts.oauth2
  }
  function enable(){
    needReady.forEach(sel=>{
      const el=$(sel)
      if(el){ el.disabled = false; el.title = '' }
    })
  }

  // 載入偵測：最多等 10 秒
  let ticks = 0
  const iv = setInterval(()=>{
    ticks++
    if (ready()){
      clearInterval(iv)
      enable()
    }else if(ticks===20){
      const warn = document.createElement('div')
      warn.style.cssText = 'margin:8px 0;color:#fbbf24'
      warn.textContent = '提示：Google 模組載入較慢，請等幾秒或重新整理。若無法授權，請允許彈出視窗並確認使用 HTTPS 網址。'
      document.querySelector('[data-panel="schedule"] .group')?.appendChild(warn)
    }
  }, 500)

  // 無論是否 ready，先掛上 click handler，確保「一定會有反應」
  function notReadyAlert(){
    alert('Google 模組尚未就緒，請等 1–2 秒或重新整理。\n如右上出現「彈出視窗被封鎖」，請按允許。')
  }
  ['#btnDriveAuth','#btnDriveLoad','#btnDriveUpload'].forEach(sel=>{
    const el=$(sel); if(!el) return
    el.addEventListener('click', (e)=>{
      if(!ready()){
        e.preventDefault()
        notReadyAlert()
      }
    }, {capture:true})
  })

  // 非 HTTPS 提示
  try{
    if(location.protocol!=='https:' && location.hostname!=='localhost'){
      const msg=document.createElement('div')
      msg.style.cssText='margin:8px 0;color:#f87171'
      msg.textContent='警示：Google OAuth 只支援 HTTPS 或 localhost，請用 GitHub Pages 正式網址開啟。'
      document.querySelector('[data-panel="schedule"] .group')?.appendChild(msg)
    }
  }catch{}
})();
