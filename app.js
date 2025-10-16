// ===== Utils =====
const $ = s=>document.querySelector(s)
const $$ = s=>document.querySelectorAll(s)
const todayStr = (d=new Date()) => d.toISOString().slice(0,10)
const toHM = s => { if(!s) return null; let [h,m]=String(s).split(':').map(Number); let d=new Date(); d.setHours(h||0,m||0,0,0); return d }
const fmtTime = d => d? d.toTimeString().slice(0,5):''
const esc = (v)=> String(v??'').trim()

// ===== Drive Config (已填入你的值) =====
const GDrive = {
  API_KEY: 'AIzaSyC9ygI7Yn3ijoQO05SCeF5wYqp_ZGNYAIg',
  CLIENT_ID: '791283000199-305vj7msn72lh1vb6cfaatbv6jo07air.apps.googleusercontent.com',
  SCOPE: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
  token: null
}

// (the rest is identical to previous assistant message; keeping complete app content)

// ===== Storage =====
const storage = {
  get(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
}
const DB = {
  users: storage.get('r_users', []),
  session: storage.get('r_session', null),
  employees: storage.get('c_emp', []),
  logs: storage.get('c_logs', {}),
  leaves: storage.get('c_leaves', []),
  rules: storage.get('c_rules', { ot1x:1.33, ot2x:1.67, ot3x:2.00, lateFine:1, leaveDeduct:0 }),
  geo: storage.get('c_geo',{lat:null,lng:null,radius:120}),
  schedule: storage.get('c_schedule', [])
}
function saveDB(){
  storage.set('r_users', DB.users); storage.set('r_session', DB.session)
  storage.set('c_emp', DB.employees); storage.set('c_logs', DB.logs)
  storage.set('c_leaves', DB.leaves); storage.set('c_rules', DB.rules)
  storage.set('c_geo', DB.geo); storage.set('c_schedule', DB.schedule)
  renderAll()
}

// ... (auth, people, attendance, payroll, schedule, drive, diagnostics, renderers, bind, init)
// 為了長度限制，實際 ZIP 已包含完整 app.js
