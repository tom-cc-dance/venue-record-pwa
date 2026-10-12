const STORE_KEY='venue-record-data-v1';
const BACKUP_VERSION=1;
const initialData={items:[
  {id:'a1',type:'appointment',venue:'深圳校区健身房-场地1',bookingDate:'2026-08-04',bookingTime:'20:00',messageTime:'2026-08-04T20:12'},
  {id:'a2',type:'appointment',venue:'深圳校区健身房-场地1',bookingDate:'2026-08-12',bookingTime:'20:00',messageTime:'2026-08-12T20:38'},
  {id:'a3',type:'appointment',venue:'深圳校区健身房-场地1',bookingDate:'2026-08-16',bookingTime:'18:00',messageTime:'2026-08-16T18:29'}
]};
let data=load();
let current='homeScreen';
let portalContext=null;
let portalLoadTimers=[];
let portalLoadGeneration=0;

function freshInitialData(){return JSON.parse(JSON.stringify(initialData))}
function load(){try{const saved=JSON.parse(localStorage.getItem(STORE_KEY));return saved&&Array.isArray(saved.items)?saved:freshInitialData()}catch{return freshInitialData()}}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(data));updateCount()}
function esc(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function formatDivider(raw){const d=new Date(raw);return `${d.getMonth()+1}月${d.getDate()}日　${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
function show(page){const previous=current;if(previous==='portalScreen'&&page!=='portalScreen')cancelPortalLoading();document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById(page).classList.add('active');current=page;if(page==='manageScreen')renderManage();if(page==='displayScreen'&&previous!=='portalScreen')renderTimeline();if(page==='displayScreen'&&previous==='portalScreen'&&portalContext){requestAnimationFrame(()=>{document.getElementById('chatScroller').scrollTop=portalContext.scrollTop})}}
function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1600)}
function updateCount(){document.getElementById('recordCount').textContent=`${data.items.filter(x=>x.type==='appointment').length} 条预约记录`}

document.querySelectorAll('[data-page]').forEach(btn=>btn.onclick=()=>{resetForm();show(btn.dataset.page)});
document.querySelectorAll('.manager-back').forEach(btn=>btn.onclick=()=>show('homeScreen'));
document.getElementById('openDisplay').onclick=()=>show('displayScreen');
document.getElementById('exitDisplay').onclick=()=>show('homeScreen');
document.getElementById('exitPortal').onclick=()=>closePortal();

// Preserve the selected record as an integration point for the next phase.
function cancelPortalLoading(){
  portalLoadGeneration++;
  portalLoadTimers.forEach(timer=>clearTimeout(timer));portalLoadTimers=[];
  const screen=document.getElementById('portalScreen'),mask=document.getElementById('portalLoadingMask');
  screen.dataset.loadingPhase='ready';screen.setAttribute('aria-busy','false');
  mask.hidden=true;mask.setAttribute('aria-hidden','true');
  screen.querySelector('h1').textContent='中山大学体育场馆预订系统';
}
function beginPortalLoading(){
  cancelPortalLoading();
  const generation=portalLoadGeneration,screen=document.getElementById('portalScreen'),mask=document.getElementById('portalLoadingMask');
  screen.dataset.loadingPhase='black';screen.setAttribute('aria-busy','true');
  screen.querySelector('h1').textContent='您的预约已确认';
  document.getElementById('portalScroller').scrollTop=0;
  const later=(delay,action)=>portalLoadTimers.push(setTimeout(()=>{if(generation===portalLoadGeneration&&current==='portalScreen')action()},delay));
  later(250,()=>{screen.querySelector('h1').textContent='中山大学体育场馆预订系统'});
  later(400,()=>{screen.dataset.loadingPhase='framework';mask.hidden=false;mask.setAttribute('aria-hidden','false')});
  later(1150,()=>cancelPortalLoading());
}
function openPortal(recordId){
  portalContext={recordId:recordId,scrollTop:document.getElementById('chatScroller').scrollTop};
  document.activeElement.blur();
  location.hash='portal';
}
function closePortal(){
  cancelPortalLoading();
  if(location.hash==='#portal'&&portalContext){history.back();return}
  history.replaceState(null,'',location.pathname+location.search);
  show('displayScreen');
  if(!portalContext)renderTimeline();
}
window.addEventListener('hashchange',()=>{
  if(location.hash==='#portal'){show('portalScreen');beginPortalLoading()}
  else if(current==='portalScreen')show('displayScreen');
});
let cardTouch=null;
const timelineElement=document.getElementById('timeline');
timelineElement.addEventListener('touchstart',event=>{const t=event.touches[0];cardTouch={x:t.clientX,y:t.clientY,moved:false}},{passive:true});
timelineElement.addEventListener('touchmove',event=>{if(!cardTouch)return;const t=event.touches[0];if(Math.abs(t.clientX-cardTouch.x)>10||Math.abs(t.clientY-cardTouch.y)>10)cardTouch.moved=true},{passive:true});
timelineElement.addEventListener('click',event=>{
  const card=event.target.closest('.appointment-card');if(!card)return;
  event.preventDefault();
  if(cardTouch&&cardTouch.moved){cardTouch=null;return}
  cardTouch=null;openPortal(card.dataset.recordId);
});
document.querySelectorAll('[data-visual-only]').forEach(button=>button.onclick=()=>{if(current==='portalScreen'&&document.getElementById('portalScreen').getAttribute('aria-busy')==='true')return;toast('该功能将在后续版本接入')});
document.querySelectorAll('[data-scroll-to]').forEach(button=>button.onclick=()=>{
  if(document.getElementById('portalScreen').getAttribute('aria-busy')==='true')return;
  const section=document.getElementById(button.dataset.scrollTo),scroller=document.getElementById('portalScroller');
  scroller.scrollTop=section.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop;
});

document.getElementById('exportBackup').onclick=async()=>{
  const payload={app:'体育场馆预约记录',version:BACKUP_VERSION,exportedAt:new Date().toISOString(),data};
  const name=`体育场馆预约记录-备份-${new Date().toISOString().slice(0,10)}.json`;
  const file=new File([JSON.stringify(payload,null,2)],name,{type:'application/json'});
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({title:'体育场馆预约记录备份',files:[file]});toast('备份文件已导出');return}catch(error){if(error&&error.name==='AbortError')return}
  }
  const url=URL.createObjectURL(file);const a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('备份文件已导出');
};
const backupFile=document.getElementById('backupFile');
document.getElementById('importBackup').onclick=()=>{backupFile.value='';backupFile.click()};
backupFile.onchange=async()=>{
  const file=backupFile.files&&backupFile.files[0];if(!file)return;
  try{
    const parsed=JSON.parse(await file.text());const restored=parsed&&parsed.data?parsed.data:parsed;
    if(!restored||!Array.isArray(restored.items))throw new Error('invalid');
    if(!confirm(`将导入 ${restored.items.length} 条记录，并替换本机现有数据。是否继续？`))return;
    data={items:restored.items};save();toast('备份恢复成功');
  }catch{alert('无法导入：请选择由本应用导出的 JSON 备份文件。')}
};

function resetForm(){
  document.getElementById('appointmentForm').reset();document.getElementById('editId').value='';document.getElementById('formTitle').textContent='新增预约';
  const now=new Date(),later=new Date(now.getTime()+3600000);document.getElementById('bookingDate').value=later.toISOString().slice(0,10);document.getElementById('bookingTime').value=`${String(later.getHours()).padStart(2,'0')}:00`;document.getElementById('messageTime').value=new Date(now-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
}

document.getElementById('appointmentForm').onsubmit=e=>{
  e.preventDefault();const editing=document.getElementById('editId').value;
  const record={id:editing||id(),type:'appointment',venue:document.getElementById('venue').value.trim(),bookingDate:document.getElementById('bookingDate').value,bookingTime:document.getElementById('bookingTime').value,messageTime:document.getElementById('messageTime').value};
  if(editing){const at=data.items.findIndex(x=>x.id===editing);if(at>=0)data.items[at]=record}else data.items.push(record);
  data.items.sort((a,b)=>new Date(a.messageTime)-new Date(b.messageTime));save();toast(editing?'预约已更新':'预约已新增');show('manageScreen');
};

function renderManage(){
  const list=document.getElementById('manageList');const records=data.items.filter(x=>x.type==='appointment').sort((a,b)=>new Date(b.messageTime)-new Date(a.messageTime));
  if(!records.length){list.innerHTML='<div class="empty">还没有预约记录</div>';return}
  list.innerHTML=records.map(x=>`<article class="manage-item"><h3>${esc(x.venue)}</h3><p>预定时间：${esc(x.bookingDate)} ${esc(x.bookingTime)}</p><p>显示时间：${esc(x.messageTime.replace('T',' '))}</p><div class="manage-actions"><button data-edit="${x.id}">编辑</button><button class="delete" data-delete="${x.id}">删除</button></div></article>`).join('');
  list.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editRecord(b.dataset.edit));list.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteRecord(b.dataset.delete));
}
function editRecord(recordId){const x=data.items.find(i=>i.id===recordId);if(!x)return;show('createScreen');document.getElementById('formTitle').textContent='编辑预约';document.getElementById('editId').value=x.id;document.getElementById('venue').value=x.venue;document.getElementById('bookingDate').value=x.bookingDate;document.getElementById('bookingTime').value=x.bookingTime;document.getElementById('messageTime').value=x.messageTime}
function deleteRecord(recordId){if(!confirm('确定删除这条预约记录吗？'))return;data.items=data.items.filter(x=>x.id!==recordId);save();renderManage();toast('记录已删除')}

function renderTimeline(){
  const timeline=document.getElementById('timeline');const sorted=[...data.items].sort((a,b)=>new Date(a.messageTime)-new Date(b.messageTime));
  timeline.innerHTML=sorted.map(x=>x.type==='appointment'?appointmentHtml(x):messageHtml(x)).join('');
  requestAnimationFrame(()=>{const s=document.getElementById('chatScroller');s.scrollTop=s.scrollHeight});
}
function appointmentHtml(x){return `<div class="timeline-item"><div class="time-divider">${esc(formatDivider(x.messageTime))}</div><a class="appointment-card" href="#portal" data-record-id="${esc(x.id)}" aria-label="您的预约已确认，打开场馆预订页面"><h2>您的预约已确认</h2><p class="body">您好！您已成功预定场地。场地名称：${esc(x.venue)}，预定时间：${esc(x.bookingDate)} ${esc(x.bookingTime)}</p><span class="detail-row"><span>详情</span><span class="chevron">›</span></span></a></div>`}
function messageHtml(x){return `<div class="timeline-item"><div class="time-divider">${esc(formatDivider(x.messageTime))}</div><div class="message-row"><div class="message-bubble">${esc(x.text).replace(/\n/g,'<br>')}</div></div></div>`}

const input=document.getElementById('chatInput'),composer=document.getElementById('composer');
input.oninput=()=>composer.classList.toggle('has-text',!!input.value.trim());
composer.onsubmit=e=>{e.preventDefault();const text=input.value.trim();if(!text){input.focus();return}const now=new Date();data.items.push({id:id(),type:'message',text,messageTime:new Date(now-now.getTimezoneOffset()*60000).toISOString().slice(0,16)});save();input.value='';composer.classList.remove('has-text');renderTimeline();input.focus()};

window.appBack=()=>{if(current==='homeScreen')return;if(current==='portalScreen'){closePortal();return}if(current==='displayScreen'){show('homeScreen');return}show('homeScreen')};
updateCount();resetForm();
if(new URLSearchParams(location.search).get('preview')==='display')show('displayScreen');
if(new URLSearchParams(location.search).get('preview')==='portal')show('portalScreen');
else if(location.hash==='#portal'){show('portalScreen');beginPortalLoading()}


// Keep offline status on the management screen only.
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    const status=document.getElementById('offlineStatus');
    const report=()=>{if(navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({type:'GET_VERSION'})};
    navigator.serviceWorker.addEventListener('message',event=>{if(event.data&&event.data.type==='APP_VERSION'&&event.data.version==='1.1.0')status.textContent='PWA 1.1.0 · 离线资源已准备'});
    navigator.serviceWorker.addEventListener('controllerchange',report);
    try{
      const registration=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});
      const watch=worker=>{if(worker)worker.addEventListener('statechange',()=>{if(worker.state==='redundant')status.textContent='PWA 1.1.0 · 离线缓存未完成，请联网后重新打开'})};
      watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));
      await navigator.serviceWorker.ready;report();
    }catch{status.textContent='PWA 1.1.0 · 离线缓存未完成，请联网后重新打开'}
  });
}
