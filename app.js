// ===== Google Drive 設定（請把兩個值換成你的）=====
const GDrive = {
  API_KEY: 'YOUR_API_KEY_HERE',
  CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
  SCOPE: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
  token: null
};

// ===== 診斷列：顯示載入＆金鑰狀態 =====
function setChip(id, ok, text){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = `${el.textContent.split(':')[0]}: ${text || (ok?'OK':'NG')}`;
  el.style.borderColor = ok ? '#22d3ee' : '#f87171';
  el.style.color = ok ? '#a5f3fc' : '#fecaca';
}
function updateDiag(){
  setChip('diagDom', true, 'OK');
  setChip('diagGapi', typeof window.gapi !== 'undefined', typeof window.gapi !== 'undefined' ? 'loaded' : 'not loaded');
  const gisReady = typeof window.google !== 'undefined' && google.accounts && google.accounts.oauth2;
  setChip('diagGis', gisReady, gisReady ? 'loaded' : 'not loaded');
  const keyOK = !/YOUR_API_KEY_HERE/.test(GDrive.API_KEY);
  const cidOK = !/YOUR_CLIENT_ID_HERE/.test(GDrive.CLIENT_ID);
  setChip('diagKey', keyOK, keyOK?'set':'placeholder');
  setChip('diagCid', cidOK, cidOK?'set':'placeholder');
  setChip('diagToken', !!GDrive.token, GDrive.token?'已授權':'無');

  const banner = document.getElementById('diagBanner');
  if(banner){
    if(!keyOK || !cidOK){
      banner.textContent = '⚠️ 未設定 API_KEY/CLIENT_ID：請打開 app.js 把 GDrive 兩個值換成你的。';
    }else{
      banner.textContent = '';
    }
  }
}
setInterval(updateDiag, 800);

// ===== 授權（加上 try/catch 與明確 alert）=====
async function gapiLoad(){ return new Promise(res=> gapi.load('client', res)); }
async function driveInit(){
  try{
    await gapiLoad();
    await gapi.client.init({ apiKey:GDrive.API_KEY, discoveryDocs:['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'] });

    if(!GDrive.CLIENT_ID || /YOUR_CLIENT_ID_HERE/.test(GDrive.CLIENT_ID)){
      alert('尚未設定 CLIENT_ID，請到 app.js 更換。'); return;
    }
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GDrive.CLIENT_ID,
      scope: GDrive.SCOPE,
      callback: (tok)=>{ GDrive.token = tok; updateDiag(); alert('Drive 授權成功'); }
    });
    tokenClient.requestAccessToken({ prompt:'consent' });
  }catch(e){
    console.error(e);
    alert('driveInit 失敗：' + (e && e.message ? e.message : e));
  }
}

// ===== 下載 =====
async function driveDownload(){
  try{
    if(!GDrive.token){ alert('請先按「連結 Google Drive」並同意權限'); return; }
    let fileId = document.getElementById('driveFileId').value.trim();
    if(fileId.includes('id=')){ const m=fileId.match(/id=([^&]+)/); if(m) fileId=m[1]; }
    if(fileId.includes('/d/')){ const m=fileId.match(/\\/d\\/([^/]+)/); if(m) fileId=m[1]; }
    if(!fileId){ alert('請輸入檔案 ID 或分享連結'); return; }

    const meta = await gapi.client.drive.files.get({ fileId, fields:'id,name,mimeType' });
    const mime = meta.result.mimeType;

    let content;
    if(mime==='application/vnd.google-apps.spreadsheet'){
      const res = await gapi.client.drive.files.export({ fileId, mimeType:'text/csv' });
      content = res.body;
    }else{
      const resp = await gapi.client.request({ path:`/drive/v3/files/${fileId}?alt=media`, method:'GET' });
      content = resp.body;
    }

    // 解析為 JSON，顯示欄位對應器
    const wb = XLSX.read(content, {type:'string'});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, {defval:''});
    buildMapper(Object.keys(json[0]||{}));
    window.__rawSched = json;

    alert('已從雲端載入，請在「欄位對應」選擇日期/姓名/上班/下班後套用。');
  }catch(e){
    console.error(e);
    alert('driveDownload 失敗：' + (e && e.message ? e.message : e));
  }
}

// ===== 上傳 =====
async function driveUpload(){
  try{
    if(!GDrive.token){ alert('請先按「連結 Google Drive」'); return; }
    const rows = window.DB?.schedule?.length ? window.DB.schedule
                 : [{date:'',name:'',dept:'',in:'',out:'',title:''}];
    const header = Object.keys(rows[0]);
    const csv = [header.join(','), ...rows.map(r=> header.map(h=>`"${String(r[h]??'').replaceAll('"','""')}"`).join(','))].join('\\n');

    const boundary='-------314159265358979323846';
    const metadata={ name:`schedule_${new Date().toISOString().slice(0,7)}.csv`, mimeType:'text/csv' };
    const body = `--${boundary}\\r\\nContent-Type: application/json; charset=UTF-8\\r\\n\\r\\n`
      + JSON.stringify(metadata)
      + `\\r\\n--${boundary}\\r\\nContent-Type: text/csv\\r\\n\\r\\n`
      + csv + `\\r\\n--${boundary}--`;

    await gapi.client.request({
      path:'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      method:'POST',
      headers:{ 'Content-Type':'multipart/related; boundary='+boundary },
      body
    });
    alert('已上傳到 Google Drive');
  }catch(e){
    console.error(e);
    alert('driveUpload 失敗：' + (e && e.message ? e.message : e));
  }
}

// ===== 綁定（確保「一定有反應」）=====
document.addEventListener('DOMContentLoaded', ()=>{
  const on = (id, fn)=>{ const el=document.getElementById(id); if(el){ el.addEventListener('click', fn) } }
  on('btnDriveAuth', driveInit);
  on('btnDriveLoad', driveDownload);
  on('btnDriveUpload', driveUpload);
  updateDiag();
});
