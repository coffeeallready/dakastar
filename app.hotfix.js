/* Hotfix v2: Drive 按鈕就緒＋強制回饋＋HTTPS/彈窗提示 */
(function(){
  const $ = s=>document.querySelector(s)
  const needReady = ['#btnDriveAuth','#btnDriveLoad','#btnDriveUpload']
  needReady.forEach(sel=>{ const el=$(sel); if(el){ el.disabled = true; el.title = '載入 Google 模組中…' } })
  function isReady(){
    return typeof window.gapi !== 'undefined' && gapi.client &&
           typeof window.google !== 'undefined' && google.accounts && google.accounts.oauth2
  }
  function enableDriveButtons(){ needReady.forEach(sel=>{ const el=$(sel); if(el){ el.disabled = false; el.title = '' } }) }
  let t=0, iv=setInterval(()=>{ t++; if(isReady()){ clearInterval(iv); enableDriveButtons() }
    else if(t===20){ const warn=document.createElement('div'); warn.style.cssText='margin:8px 0;color:#fbbf24'; warn.textContent='提示：Google 模組載入較慢，請等幾秒或重新整理。若無法授權，請允許彈出視窗。'; const sec=document.querySelector('[data-panel="schedule"] .group'); if(sec) sec.appendChild(warn) } },500)
  setTimeout(enableDriveButtons, 15000)
  const guard = id => { const el=$(id); if(!el) return; el.addEventListener('click', (e)=>{ if(el.disabled){ e.preventDefault(); alert('模組尚未載入，請等一下或重新整理。若彈窗被擋，請允許彈出視窗。') } }, {capture:true}) }
  ['#btnDriveAuth','#btnDriveLoad','#btnDriveUpload'].forEach(guard)
  try{ if(location.protocol!=='https:' && location.hostname!=='localhost'){ const msg=document.createElement('div'); msg.style.cssText='margin:8px 0;color:#f87171'; msg.textContent='警示：Google OAuth 僅支援 HTTPS 或 localhost，請用正式網址開啟。'; const sec=document.querySelector('[data-panel="schedule"] .group'); if(sec) sec.appendChild(msg) } }catch{}
})();