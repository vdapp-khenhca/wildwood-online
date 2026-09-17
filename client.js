'use strict';
const {SPEC,bodyScale,SIZE,TERRAIN,PONDS,HERBS,World}=Wild,$=id=>document.getElementById(id),canvas=$('game'),g=canvas.getContext('2d'),map=$('map'),mg=map.getContext('2d');
let width=innerWidth,height=innerHeight,selected=1,world=null,state=null,me=null,pid='',source=null,socket=null,netSeq=0,prevNetState=null,netStateAt=0,predMe=null,serverMe=null,pingMs=0,jitterMs=0,lastPing=0,online=location.protocol!=='file:',active=false,muted=false,ac=null,cam={x:1800,y:1800},mouse={x:width/2,y:height/2},input={x:0,y:0,l:false,r:false,e:false,tap:false},last=performance.now(),frame=0,seed=1,lastHP=0,lastXP=0,lastRound=480,toastUntil=0,netBusy=false,ambientTimer,aiming=false,lastPickups=0,lastEventId=0,controlMode='simple',questIndex=0,questBase={pickups:0,kills:0,bestChain:0},lastAutoDefense=0,musicGain=null,musicSource=null,musicReady=false,lastSkillCd=0,lastSkillRd=0,lastRage=0,lastUltFx=0;
function resize(){width=innerWidth;height=innerHeight;canvas.width=width*devicePixelRatio;canvas.height=height*devicePixelRatio;g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}addEventListener('resize',resize);resize();
function ell(ctx,x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(ctx,pts,color,w){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}
function animal(ctx,s,x,y,a=0,scale=1,t=0){let c=SPEC[s].color;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ell(ctx,0,13,27,13,'#052c2738');ctx.rotate(a);let walk=Math.sin(t*10)*3;
if(s===0){line(ctx,[[-30,8],[-19,-2],[-10,7],[3,0]],'#386444',20);line(ctx,[[-30,5],[-19,-5],[-10,4],[3,-3]],c,15)}
else if(s===7||s===8){for(let side of [-1,1])for(let i=0;i<4;i++)line(ctx,[[-13+i*8,side*7],[-22+i*13,side*(20+walk)],[-18+i*12,side*29]],'#554657',5);if(s===8){line(ctx,[[-15,0],[-34,-2],[-37,-20],[-22,-25]],c,9);ell(ctx,-21,-24,6,5,'#edd5d2')}}
else if(s===9||s===10){ell(ctx,-4,-21,24,12,c);ell(ctx,-4,21,24,12,c);line(ctx,[[-8,-27],[-19,-31]],'#665767',3);line(ctx,[[-8,27],[-19,31]],'#665767',3)}
else{line(ctx,[[-16,0],[-32,8+walk],[-38,1]],s===11?'#f4e9c9':c,s===11?13:7);for(let side of [-1,1])for(let i of [-12,12])ell(ctx,i+walk*(i<0?1:-1),side*16,9,7,s===13?'#4d5556':c)}
ell(ctx,-3,0,s===5?31:24,s===5?15:20,c);ell(ctx,1,3,17,13,'#fff4cf30');if(s===2){ell(ctx,15,0,26,27,'#a57144');ell(ctx,17,0,22,22,'#cd9650')}
if(![0,5,7,8,9].includes(s)){for(let sy of [-1,1]){ell(ctx,15,sy*16,9,9,c);ell(ctx,17,sy*17,4,5,'#71534577')}}
ell(ctx,17,0,s===5?22:18,s===0?16:19,c);if(s===5){ell(ctx,32,0,18,11,c);for(let i=0;i<4;i++)ell(ctx,-22+i*10,0,3,6,'#365e4a')}
if(s===1){for(let sy of [-1,1])for(let xx of [-12,0,13])line(ctx,[[xx,sy*17],[xx-4,sy*11]],'#81573a',3)}
if([3,14].includes(s))for(let [xx,yy]of [[-15,-9],[-8,8],[2,-12],[9,12],[-21,3]])ell(ctx,xx,yy,3,3,'#756044');
if(s===13){line(ctx,[[-20,0],[8,0]],'#e4eadb',13)}
if(s===10){ell(ctx,22,-9,11,10,'#eee3c8');ell(ctx,22,9,11,10,'#eee3c8')}
for(let sy of [-1,1]){ell(ctx,25,sy*8,5.2,5.8,'#fff8e5');ell(ctx,27,sy*8,2.7,3.8,'#20372f');ell(ctx,27.5,sy*8-1.3,1,1.5,'white')}
if(s===9||s===10){ctx.fillStyle='#edbc66';ctx.beginPath();ctx.moveTo(30,-5);ctx.lineTo(40,0);ctx.lineTo(30,5);ctx.fill()}else ell(ctx,s===5?47:33,0,3,4,'#435044');if(s===12)for(let sy of [-1,1])line(ctx,[[29,sy*12],[37,sy*15],[34,sy*8]],'#fff1d2',3);if(s===0)line(ctx,[[34,0],[43,0],[46,-3]],'#e99792',2);ctx.restore()}
function select(i){selected=i;document.querySelectorAll('.animal').forEach((e,j)=>e.classList.toggle('selected',i===j));$('desc').textContent=SPEC[i].left+' · '+SPEC[i].right+' | Nộ: '+SPEC[i].ultimate+' | Nội tại: '+SPEC[i].passive}
SPEC.forEach((s,i)=>{let b=document.createElement('button');b.className='animal';let c=document.createElement('canvas');c.width=128;c.height=116;animal(c.getContext('2d'),i,64,58,-.3,1.65);b.append(c,document.createTextNode(s.name));b.onclick=()=>{select(i);tone(470+i*25,.06,.02)};$('animals').append(b)});select(selected);$('count').value='24';
try{$('name').value=localStorage.getItem('wild-name')||''}catch{}$('mode').textContent=online?'● Phòng mạng: cùng mã phòng để gặp nhau.':'● Chơi ngay với AI, không cần cài đặt.';
async function audioStart(){
if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();
try{await ac.resume()}catch{}
let music=$('music');
if(!musicReady){
try{
musicSource=ac.createMediaElementSource(music);
musicGain=ac.createGain();
musicGain.gain.value=.55;
musicSource.connect(musicGain);
musicGain.connect(ac.destination);
musicReady=true
}catch{}
}
music.loop=true;
music.volume=.82;
music.muted=muted;
if(!muted){
try{
await music.play();
$('sound').textContent='♫ NHẠC';
$('sound').title='Nhạc nền đang bật';
}catch(err){
$('sound').textContent='▶ BẬT NHẠC';
$('sound').title='Bấm để cho phép trình duyệt phát nhạc';
toast('Trình duyệt đang chặn tự phát nhạc · bấm ▶ BẬT NHẠC')
}
}else{
music.pause();
$('sound').textContent='♫ TẮT'
}
if(!ambientTimer)ambientTimer=setInterval(()=>{
if(!active||muted||!ac)return;
let danger=me&&me.hp/me.max<.38,event=state?.event;
if(event||danger){
let base=event?196:146.83;
tone(base,.12,.018,'triangle');
setTimeout(()=>tone(base*1.5,.09,.012,'sine'),110)
}
},900)
}
function tone(f,d=.1,v=.04,type='sine'){if(!ac||muted)return;let o=ac.createOscillator(),n=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,ac.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(60,f*.7),ac.currentTime+d);n.gain.setValueAtTime(v,ac.currentTime);n.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(n);n.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}

const ANIMAL_SOUND=[
[174,246,'sawtooth'],[196,294,'triangle'],[130,196,'square'],[330,494,'sine'],[220,330,'triangle'],
[110,165,'sine'],[82,123,'square'],[262,392,'sine'],[147,220,'sawtooth'],[349,523,'sine'],
[185,277,'triangle'],[294,440,'sine'],[98,147,'square'],[123,185,'sawtooth'],[207,311,'triangle']
];
function animalSkillSound(species,slot){
if(!ac||muted)return;let p=ANIMAL_SOUND[species]||ANIMAL_SOUND[0],base=p[slot],type=p[2];
tone(base,.13,.045,type);setTimeout(()=>tone(base*(slot?1.5:1.25),.11,.03,slot?'sine':type),65);
}
function animalUltimateSound(species){
if(!ac||muted)return;let p=ANIMAL_SOUND[species]||ANIMAL_SOUND[0],root=p[0]*.75;
[1,1.25,1.5,2,2.5,3].forEach((m,i)=>setTimeout(()=>tone(root*m,.24-i*.015,.055,i%2?'triangle':p[2]),i*85));
setTimeout(()=>{tone(root/2,.65,.075,'sawtooth');tone(root*2,.55,.04,'sine')},520)
}
function musicPulse(kind='combo'){if(!ac||muted)return;let notes=kind==='event'?[392,523.25,659.25]:[523.25,659.25,783.99];notes.forEach((n,i)=>setTimeout(()=>tone(n,.16,.018,'sine'),i*75))}

let musicGestureArmed=true;
async function unlockMusicOnce(){
if(!musicGestureArmed)return;
musicGestureArmed=false;
await audioStart()
}
addEventListener('pointerdown',unlockMusicOnce,{once:true});
addEventListener('keydown',unlockMusicOnce,{once:true});
function toast(t){$('toast').textContent=t;$('toast').style.display='block';toastUntil=performance.now()+4500}
$('start').onclick=async()=>{audioStart();$('notice').textContent='';$('start').disabled=true;try{let name=$('name').value.trim()||'Khách';controlMode=$('controlMode').value||'simple';try{localStorage.setItem('wild-name',name)}catch{}if(online){let proto=location.protocol==='https:'?'wss:':'ws:';socket=new WebSocket(proto+'//'+location.host+'/ws');await new Promise((resolve,reject)=>{let timer=setTimeout(()=>reject(Error('Server phản hồi quá lâu')),8000);socket.onopen=()=>socket.send(JSON.stringify({type:'join',name,species:selected,room:($('room').value||'WORLD1'),count:+$('count').value}));socket.onmessage=e=>{let j=JSON.parse(e.data);if(j.type==='joined'){clearTimeout(timer);pid=j.id;resolve()}else if(j.type==='state'){prevNetState=state;state=j.state;netStateAt=performance.now();me=state.players.find(p=>p.id===pid);if(me){serverMe={x:me.x,y:me.y};if(!predMe)predMe={x:me.x,y:me.y};else{let dx=me.x-predMe.x,dy=me.y-predMe.y,d=Math.hypot(dx,dy);if(d>260){predMe.x=me.x;predMe.y=me.y}else if(d>18){let k=Math.min(.055,d/1800);predMe.x+=dx*k;predMe.y+=dy*k}}}let el=$('onlineCount');if(el)el.textContent=state.players.filter(p=>!p.bot).length+' người online · World 1'}else if(j.type==='pong'){let r=performance.now()-j.t,jit=Math.abs(r-pingMs);pingMs=pingMs?pingMs*.75+r*.25:r;jitterMs=jitterMs?jitterMs*.75+jit*.25:jit}else if(j.type==='error'){clearTimeout(timer);reject(Error(j.message))}};socket.onerror=()=>reject(Error('Không kết nối được WebSocket'));socket.onclose=()=>{if(active)toast('Mất kết nối server · hãy vào lại phòng')}});world=null}else{world=new World(+$('count').value);me=world.join(name,selected);pid=me.id;state=world.snapshot(pid)}active=true;audioStart();lastHP=0;lastXP=0;lastPickups=0;lastEventId=0;questIndex=0;questBase={pickups:0,kills:0,bestChain:0};predMe=me?{x:me.x,y:me.y}:null;cam=me?{x:me.x,y:me.y}:{x:1800,y:1800};$('lobby').style.display='none';$('hud').style.display='block';document.body.classList.add('gameRunning');resetControls();toast(controlMode==='simple'?'Rê chuột · trái dùng chiêu 1/giữ để chạy · phải dùng chiêu 2 · đủ nộ bấm Space':'Chuột trái: chiêu 1/chạy · chuột phải: chiêu 2 · đủ 100% bấm Space để NỘ')}catch(e){$('notice').textContent='Không vào được phòng: '+e.message}finally{$('start').disabled=false}};
$('ultimate').onclick=()=>{if(active)input.e=true};
$('leave').onclick=()=>{aiming=false;resetControls();document.exitPointerLock?.();if(online&&socket&&socket.readyState===1)socket.send(JSON.stringify({type:'leave'}));try{socket?.close()}catch{}socket=null;if(source)source.close();active=false;state=null;me=null;world=null;input.l=input.r=false;$('lobby').style.display='flex';$('hud').style.display='none';document.body.classList.remove('gameRunning');$('death').style.display='none';$('help').style.display='none'};

$('sound').onclick=async()=>{muted=!muted;let music=$('music');music.muted=muted;if(muted){music.pause();$('sound').textContent='♫ TẮT';toast('Đã tắt nhạc')}else{await audioStart();toast('Đã bật Mischief in the Moss')}};
$('tips').onclick=()=>{$('help').style.display=$('help').style.display==='block'?'none':'block';let s=SPEC[selected];$('help').innerHTML='<div class="eyebrow">SỔ TAY SINH TỒN · 1.2</div><h2>'+s.name+'</h2><p><b>Nhấn trái:</b> '+s.left+' (miễn mana).<br><b>Giữ trái ¼ giây:</b> chạy nhanh, 18 mana/giây.<br><b>Phải:</b> '+s.right+' (18 mana).</p><p><b>Mỗi miếng ăn đều làm bạn to lên.</b> Cơ thể lớn cũng dễ trúng đòn hơn. Không cần Space để tăng kích thước; Space chỉ nâng cấp chỉ số khi đủ năng lượng.</p><p><b>Chuỗi ăn:</b> ăn miếng tiếp theo trong 4 giây. Mỗi 5 miếng tăng 20% điểm, tối đa x2; mỗi 10 miếng hồi 10 mana.</p><p><b>Quả đỏ +:</b> hồi 22 máu. <b>Xanh lam M:</b> hồi 35 mana. <b>Tím U:</b> hút mồi 7 giây. <b>Xanh lá »:</b> tốc độ 6 giây. <b>Vàng:</b> nhiều năng lượng.</p><p><b>Mưa quả:</b> chờ 3 giây, quả rơi quanh vòng vàng. <b>Đom đóm vàng:</b> đuổi bắt để nhận 45 năng lượng và hút mồi. <b>Tổ ong:</b> cảnh báo 3 giây, ong gây sát thương 10 giây, rồi mật mới xuất hiện.</p><p>Mana tự hồi. Esc thả chuột để dùng menu. Trận vẫn tiếp tục. '+s.tip+'</p>'};map.onclick=()=>map.classList.toggle('big');
function resetControls(){input={x:0,y:0,l:false,r:false,e:false,tap:false};mouse={x:width/2,y:height/2}}
async function lockMouse(){if(!active)return;resetControls();aiming=true;$('help').style.display='none';map.classList.remove('big');try{if(!canvas.requestPointerLock)throw Error('unsupported');await canvas.requestPointerLock()}catch{toast('Trình duyệt chưa cho khóa chuột. Vẫn chơi được trong sân; bấm Khóa chuột để thử lại.')}}
$('lock').onclick=lockMouse;
document.addEventListener('pointerlockchange',()=>{let locked=document.pointerLockElement===canvas;aiming=locked;resetControls();$('lock').textContent=locked?'Esc · Thả chuột':'Khóa chuột';if(active&&!locked)toast('Đã thả chuột · Bấm sân để tiếp tục. Trận vẫn đang chạy.')});
document.addEventListener('pointerlockerror',()=>{if(active){aiming=true;toast('Không khóa được chuột. Chơi trong sân hoặc bấm Khóa chuột để thử lại.')}});
addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){mouse.x=Math.max(8,Math.min(width-8,mouse.x+e.movementX));mouse.y=Math.max(8,Math.min(height-8,mouse.y+e.movementY))}else if(aiming&&e.target===canvas){mouse.x=e.clientX;mouse.y=e.clientY}});
document.addEventListener('contextmenu',e=>{if(active){e.preventDefault();e.stopPropagation()}},{capture:true});
document.addEventListener('auxclick',e=>{if(active&&e.button!==0)e.preventDefault()},{capture:true});
canvas.addEventListener('mousedown',e=>{if(!active)return;e.preventDefault();if(!aiming){lockMouse();return}if(e.button===0){input.l=true;input.tap=true}if(e.button===2)input.r=true});
addEventListener('mouseup',e=>{if(e.button===0)input.l=false;if(e.button===2)input.r=false});
canvas.addEventListener('mouseleave',()=>{if(document.pointerLockElement!==canvas)resetControls()});
addEventListener('blur',()=>{aiming=false;resetControls();document.exitPointerLock?.()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){aiming=false;resetControls();document.exitPointerLock?.()}});
addEventListener('keydown',e=>{if(!active||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.code==='Escape'){aiming=false;resetControls();document.exitPointerLock?.();return}if(e.code==='Space'){e.preventDefault();if(!e.repeat)input.e=true}});
$('left').onpointerdown=e=>{e.preventDefault();input.l=true;input.tap=true;$('left').setPointerCapture(e.pointerId)};
$('right').onpointerdown=e=>{e.preventDefault();input.r=true;$('right').setPointerCapture(e.pointerId)};
for(let id of ['left','right']){const clear=()=>{input[id==='left'?'l':'r']=false};$(id).onpointerup=clear;$(id).onpointercancel=clear;$(id).onlostpointercapture=clear}
let lastNetPayload='',lastNetSend=0;
setInterval(()=>{if(active&&online&&socket&&socket.readyState===1){lastPing=performance.now();socket.send(JSON.stringify({type:'ping',t:lastPing}))}},1000);

const mobilePlay=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
let joyId=null,joyOrigin={x:0,y:0};
function setJoy(e){
 let dx=e.clientX-joyOrigin.x,dy=e.clientY-joyOrigin.y,d=Math.hypot(dx,dy),m=48;
 if(d>m){dx*=m/d;dy*=m/d}
 input.x=dx/m;input.y=dy/m;
 let knob=$('joyKnob');if(knob)knob.style.transform=`translate(${dx}px,${dy}px)`;
}
function clearJoy(){joyId=null;input.x=0;input.y=0;let k=$('joyKnob');if(k)k.style.transform='translate(0,0)'}
function setupMobile(){
 if(!mobilePlay)return;
 document.body.classList.add('mobilePlay');aiming=false;
 let zone=$('joystick');
 zone.onpointerdown=e=>{if(!active)return;e.preventDefault();joyId=e.pointerId;zone.setPointerCapture(e.pointerId);let r=zone.getBoundingClientRect();joyOrigin={x:r.left+r.width/2,y:r.top+r.height/2};setJoy(e)};
 zone.onpointermove=e=>{if(e.pointerId===joyId)setJoy(e)};
 zone.onpointerup=zone.onpointercancel=()=>clearJoy();
 let toggle=$('infoToggle'),side=$('sideInfo');
 toggle.onclick=e=>{e.preventDefault();side.classList.toggle('open');toggle.textContent=side.classList.contains('open')?'›':'‹'};
 for(let id of ['left','right','ultimate']){let b=$(id);b?.addEventListener('touchstart',e=>e.preventDefault(),{passive:false})}
}
setupMobile();
setInterval(()=>{if(!active||!online||!socket||socket.readyState!==1)return;let now=performance.now(),sig=[+input.x.toFixed(2),+input.y.toFixed(2),input.l?1:0,input.r?1:0,input.e?1:0,input.tap?1:0].join(',');if(sig===lastNetPayload&&now-lastNetSend<500)return;lastNetPayload=sig;lastNetSend=now;socket.send(JSON.stringify({type:'input',seq:++netSeq,x:+input.x.toFixed(2),y:+input.y.toFixed(2),l:input.l,r:input.r,e:input.e,tap:input.tap}));input.e=false;input.tap=false},50);
function screen(x,y){return{x:x-cam.x+width/2,y:y-cam.y+height/2}}
function drawTerrain(o){if(PONDS.some(w=>Math.hypot(o.x-w.x,o.y-w.y)<w.r+10))return;let p=screen(o.x,o.y);if(p.x<-110||p.y<-140||p.x>width+110||p.y>height+150)return;let r=o.r;if(o.type==='rock'){ell(g,p.x+4,p.y+8,r+3,r*.7,'#17473550');ell(g,p.x,p.y,r,r*.72,'#879d8b');ell(g,p.x-5,p.y-7,r*.8,r*.5,'#acb8a1');line(g,[[p.x-r*.3,p.y-r*.5],[p.x+r*.35,p.y-r*.35]],'#d1d7b5',3)}else if(o.type==='bush'){for(let i=0;i<5;i++)ell(g,p.x+Math.cos(i*2.4)*r*.55,p.y+Math.sin(i*2.4)*r*.45,r*.6,r*.48,['#33795b','#428962','#55976b'][i%3]);for(let i=0;i<3;i++)ell(g,p.x+i*9-9,p.y-7,3,3,'#ddb68a')}else{ell(g,p.x+12,p.y+18,r*1.25,r*.68,'#17432f44');line(g,[[p.x,p.y+7],[p.x,p.y-30]],'#785e42',10);let fade=me&&Math.hypot(me.x-o.x,me.y-o.y)<r+55;g.globalAlpha=fade?.42:1;for(let i=0;i<5;i++){let xx=p.x+Math.cos(i*2.4)*r*.55,yy=p.y-28+Math.sin(i*2.4)*r*.4;ell(g,xx,yy,r*.8,r*.64,['#28654c','#317755','#42845c','#4b9162','#609869'][i]);ell(g,xx-4,yy-8,r*.43,r*.15,'#a2c77a19')}g.globalAlpha=1}}
const QUESTS=[{label:'Ăn 12 miếng',test:p=>p.pickups-questBase.pickups>=12},{label:'Nối chuỗi 10',test:p=>p.bestChain>=10},{label:'Hạ 1 đối thủ',test:p=>p.kills-questBase.kills>=1},{label:'Ăn 20 miếng',test:p=>p.pickups-questBase.pickups>=20}];
function simpleAssist(now){}
function questStep(){if(!me)return;let q=QUESTS[questIndex%QUESTS.length],done=q.test(me);($('quest')||$('sideQuest')).classList.toggle('done',done);($('quest')||$('sideQuest')).textContent=(done?'✓ ':'MỤC TIÊU · ')+q.label;if(done){tone(880,.12,.025);setTimeout(()=>tone(1174,.16,.02),100);questIndex++;questBase={pickups:me.pickups,kills:me.kills,bestChain:me.bestChain};toast('Hoàn thành mục tiêu! Nhịp thưởng!')}}
function buildClearHUD(){
let right=document.querySelector('.hud .right');if(!right||document.getElementById('sideSkills'))return;
let skills=document.createElement('div');skills.id='sideSkills';skills.className='panel';right.appendChild(skills);
['left','right','ultimate'].forEach(id=>{let el=$(id);if(el)skills.appendChild(el)});
let passive=$('passive');if(passive){passive.id='sidePassive';passive.classList.add('panel');right.appendChild(passive)}
let quest=$('quest');if(quest){quest.id='sideQuest';quest.classList.add('panel');right.appendChild(quest)}
}
buildClearHUD();
let fpsFrames=0,fpsLast=performance.now(),fpsValue=60,qualityLow=false;
function perfTick(now){fpsFrames++;if(now-fpsLast>=500){fpsValue=Math.round(fpsFrames*1000/(now-fpsLast));fpsFrames=0;fpsLast=now;qualityLow=mobilePlay||fpsValue<48;let b=$('perfBadge');if(b){let net=pingMs<100&&jitterMs<25?'TỐT':pingMs<200&&jitterMs<60?'TB':'YẾU';b.textContent='FPS '+fpsValue+(online?' · PING '+Math.round(pingMs)+'ms · JIT '+Math.round(jitterMs)+'ms · '+net:' · LOCAL')}}}
function render(now){perfTick(now);let dt=Math.min(.05,(now-last)/1000);
if(active&&online&&me&&predMe&&!me.dead){let mag=Math.hypot(input.x,input.y);if(mag>.02){let sp=SPEC[me.species].speed*((me.running||me.haste>0)?1.65:1)*(1-me.level*.022)*(me.slow>0?.55:1);if(me.buff>0&&['sprint','clean','magnet','fly','hide','decoy'].includes(SPEC[me.species].defense)&&!(me.running||me.haste>0))sp*=1.65;if(me.buff>0&&SPEC[me.species].defense==='burrow')sp=0;predMe.x+=input.x/Math.max(1,mag)*sp*dt;predMe.y+=input.y/Math.max(1,mag)*sp*dt;predMe.x=Math.max(25,Math.min(SIZE-25,predMe.x));predMe.y=Math.max(25,Math.min(SIZE-25,predMe.y))}}
if(active&&online&&state&&prevNetState){let interpDelay=Math.max(100,Math.min(220,100+jitterMs*.35)),a=Math.min(1,Math.max(0,(now-netStateAt)/interpDelay)),pm=new Map(prevNetState.players.map(p=>[p.id,p]));for(let p of state.players){if(p.id===pid)continue;let q=pm.get(p.id);if(q){p._rx=q.x+(p.x-q.x)*a;p._ry=q.y+(p.y-q.y)*a}}}last=now;frame++;let t=active&&state?state.time:now/1000;
if(active){simpleAssist(now);if(!mobilePlay){let dx=mouse.x-width/2,dy=mouse.y-height/2,len=Math.hypot(dx,dy);input.x=!aiming||len<20?0:dx/Math.max(100,len);input.y=!aiming||len<20?0:dy/Math.max(100,len);}if(world){let p=world.players.find(p=>p.id===pid);p.input={...input};input.e=false;input.tap=false;world.step(dt);state=world.snapshot(pid);me=state.players.find(p=>p.id===pid)}if(me){let tx=online&&predMe?predMe.x:me.x,ty=online&&predMe?predMe.y:me.y;cam.x+=(tx-cam.x)*Math.min(1,dt*24);cam.y+=(ty-cam.y)*Math.min(1,dt*24)}}else{cam.x=1700+Math.sin(t*.035)*550;cam.y=1500+Math.cos(t*.035)*400}
g.fillStyle='#64986b';g.fillRect(0,0,width,height);
let grid=qualityLow?180:120,startX=Math.floor((cam.x-width/2)/grid)*grid,startY=Math.floor((cam.y-height/2)/grid)*grid;
for(let x=startX;x<cam.x+width/2+grid;x+=grid)for(let y=startY;y<cam.y+height/2+grid;y+=grid){let p=screen(x,y),hh=Math.abs(Math.sin(x*12.3+y*4.56));ell(g,p.x,p.y,grid*.62,grid*.43,hh>.5?'#699b6c':'#619469');if(!qualityLow)for(let j=0;j<2;j++){let xx=p.x+j*21+hh*35,yy=p.y+hh*60;line(g,[[xx-3,yy-4],[xx,yy-9],[xx+2,yy-4]],'#b5cc873a',1.5)}}
for(let pond of PONDS){let p=screen(pond.x,pond.y);ell(g,p.x,p.y,pond.r+18,pond.r+18,'#97ad70');ell(g,p.x,p.y,pond.r+9,pond.r+9,'#4c8d78');ell(g,p.x,p.y,pond.r,pond.r,'#5ba6a0');ell(g,p.x-20,p.y-30,pond.r*.7,pond.r*.65,'#6cb5aa');for(let i=0;i<6;i++){let xx=p.x+Math.sin(i*7)*pond.r*.7,yy=p.y+Math.cos(i*9)*pond.r*.6;line(g,[[xx-12,yy],[xx+12+Math.sin(t+i)*5,yy]],'#c0e1c35c',2);if(i%2===0){ell(g,xx,yy+20,12,7,'#45976c');ell(g,xx+3,yy+18,4,3,'#f3d3b2')}}}
for(let h of HERBS){let p=screen(h.x,h.y);ell(g,p.x,p.y,58,58,'#b5e49a33');g.strokeStyle='#caeda780';g.lineWidth=2;g.beginPath();g.arc(p.x,p.y,55,0,7);g.stroke();for(let i=0;i<5;i++)ell(g,p.x+Math.cos(i*1.26)*14,p.y+Math.sin(i*1.26)*14,10,15,'#b5db85');g.fillStyle='#fff4cb';g.font='bold 25px Segoe UI';g.textAlign='center';g.fillText('+',p.x,p.y+8)}
let foods=state?state.food:Array.from({length:45},(_,i)=>({x:1200+Math.sin(i*5)*550,y:1400+Math.cos(i*3)*600,v:2,h:i/45}));for(let f of foods){let p=screen(f.x,f.y);if(p.x<0||p.y<0||p.x>width||p.y>height)continue;let kind=f.kind||'orb',color={gold:'#ffe188',heal:'#f58c93',mana:'#8ee1fa',magnet:'#dfb1ff',haste:'#b9f298'}[kind]||'#ffe9a5',r=kind==='orb'?3.5:9;ell(g,p.x,p.y,r+5+Math.sin(t*3+f.h*7),r+5,color+'25');ell(g,p.x,p.y,r,r,color);if(kind!=='orb'){g.fillStyle='#284f40';g.font='bold 11px Segoe UI';g.textAlign='center';g.fillText({gold:'•',heal:'+',mana:'M',magnet:'U',haste:'»'}[kind],p.x,p.y+4)}}
if(state?.event){let e=state.event,p=screen(e.x,e.y);if(e.type!==1){g.fillStyle=e.type===2&&e.t>=3&&e.t<13?'#e2935033':'#f6df8e22';g.beginPath();g.arc(p.x,p.y,e.r,0,7);g.fill();g.strokeStyle=e.type===2?'#f6ab70':'#f7dc81';g.lineWidth=2;g.setLineDash([8,8]);g.stroke();g.setLineDash([]);if(e.type===2&&e.t>=3&&e.t<13){for(let n=0;n<16;n++){let a=t*2+n*2.4,r=25+(n*37)%e.r;ell(g,p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,5,3,'#ffe68c')}}else{g.fillStyle='#fff0b8';g.font='bold 18px Segoe UI';g.textAlign='center';g.fillText(e.t<3?Math.ceil(3-e.t):e.type===2?'MẬT ĐÃ RA!':'ĂN NHANH!',p.x,p.y-20)}}else if(!e.claimed){ell(g,p.x,p.y,25,25,'#ffe68b33');ell(g,p.x-10,p.y+Math.sin(t*25)*3,12,6,'#fff1ba99');ell(g,p.x+10,p.y-Math.sin(t*25)*3,12,6,'#fff1ba99');ell(g,p.x,p.y,7,10,'#ffe082')}
if(!e.claimed&&(p.x<70||p.y<170||p.x>width-70||p.y>height-210)){let x=Math.max(70,Math.min(width-70,p.x)),y=Math.max(180,Math.min(height-230,p.y)),a=Math.atan2(p.y-y,p.x-x);g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#ffe6a1';g.beginPath();g.moveTo(13,0);g.lineTo(-7,-8);g.lineTo(-7,8);g.fill();g.restore();g.fillStyle='#fff0b8';g.font='bold 11px Segoe UI';g.textAlign='center';g.fillText('SỰ KIỆN',x,y+24)}}
for(let o of TERRAIN)if(o.type!=='tree')drawTerrain(o);
let players=state?state.players:SPEC.map((s,i)=>({x:1500+Math.sin(i*4)*320,y:1500+Math.cos(i*4)*240,a:t*.2+i,species:i,id:'demo',hp:s.hp,max:s.hp,level:0}));
for(let d of state?.decoys||[]){let p=screen(d.x,d.y);g.globalAlpha=.55;animal(g,d.species,p.x,p.y,d.a,1,t);g.globalAlpha=1}
for(let p of [...players].sort((a,b)=>a.y-b.y)){if(p.dead)continue;let q=p.id===pid&&online&&predMe?screen(predMe.x,predMe.y):screen(p._rx??p.x,p._ry??p.y),own=p.id===pid,bs=bodyScale(p);if(q.x<-150||q.x>width+150||q.y<-150||q.y>height+150)continue;if(own){g.strokeStyle='#f8e2a7';g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y+7,36*bs,29*bs,0,0,7);g.stroke()}if(p.buff>0)g.globalAlpha=.65;animal(g,p.species,q.x,q.y,p.a,bs,t);g.globalAlpha=1;if(p.shield>0||p.buff>0){g.strokeStyle=p.shield>0?'#caeeff':'#e7c7ff';g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,40*bs,0,7);g.stroke()}if(p.running){for(let n=0;n<3;n++)line(g,[[q.x-Math.cos(p.a)*(40+n*12)-Math.sin(p.a)*9,q.y-Math.sin(p.a)*(40+n*12)+Math.cos(p.a)*9],[q.x-Math.cos(p.a)*(49+n*12)-Math.sin(p.a)*9,q.y-Math.sin(p.a)*(49+n*12)+Math.cos(p.a)*9]],'#b8eaff',2)}if(p.magnet>0||p.haste>0){g.strokeStyle=p.magnet>0?'#dfb1ff':'#b9f298';g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,43*bs,0,7);g.stroke()}if(p.poison>0)ell(g,q.x-23,q.y,6,6,'#c3ef58');if(p.name){g.textAlign='center';g.font='bold 12px Segoe UI';g.lineWidth=3;g.strokeStyle='#174a39';g.strokeText(p.name,q.x,q.y-43*bs);g.fillStyle=own?'#fff0b6':'#fff9e1';g.fillText(p.name,q.x,q.y-43*bs);let bw=own?58:48,bx=q.x-bw/2,by=q.y-43*bs+6;
g.fillStyle='#173b32cc';g.fillRect(bx,by,bw,6);g.fillStyle=own?'#bfe889':'#f5b08b';g.fillRect(bx,by,bw*Math.max(0,p.hp/p.max),6);
if(own){g.fillStyle='#173b32cc';g.fillRect(bx,by+8,bw,5);g.fillStyle='#83d9f4';g.fillRect(bx,by+8,bw*Math.max(0,p.mana/p.maxMana),5);g.fillStyle='#fff7d6';g.font='bold 8px Segoe UI';g.textAlign='center';g.fillText(Math.ceil(p.hp)+' HP',q.x,by-2)}}}
TERRAIN.filter(o=>o.type==='tree').sort((a,b)=>a.y-b.y).forEach(drawTerrain);
for(let b of state?.shots||[]){let p=screen(b.x,b.y);g.strokeStyle=b.color||'#f6f0df';g.lineWidth=3;g.beginPath();g.arc(p.x,p.y,10,0,7);g.moveTo(p.x-12,p.y);g.lineTo(p.x+12,p.y);g.moveTo(p.x,p.y-12);g.lineTo(p.x,p.y+12);g.stroke()}
let fxList=state?.fx||[],fxStart=qualityLow?Math.max(0,fxList.length-36):0;for(let fi=fxStart;fi<fxList.length;fi++){let f=fxList[fi];
let p=screen(f.x,f.y);
if(f.type==='eat'){if(f.owner===pid){g.globalAlpha=Math.min(1,f.t*2);g.fillStyle=f.c;g.font='bold 14px Segoe UI';g.textAlign='center';g.fillText(f.text,p.x,p.y-(.8-f.t)*35);g.globalAlpha=1}continue}
if(f.type==='ulttext'){g.save();g.globalAlpha=Math.min(1,f.t);g.fillStyle=f.c;g.shadowColor=f.c;g.shadowBlur=22;g.font='900 25px Segoe UI';g.textAlign='center';g.fillText('✹ '+f.text+' ✹',p.x,p.y-(1.8-f.t)*35);g.restore();continue}
if(f.type==='spark'){g.save();g.globalAlpha=Math.min(1,f.t*1.6);g.translate(p.x,p.y);g.rotate(f.a||0);g.fillStyle=f.c;g.shadowColor=f.c;g.shadowBlur=15;g.fillRect(0,-2,28*(f.t+.15),4);g.restore();continue}
if(f.type==='ultimate'){g.save();let life=Math.min(1,f.t),r=(1-life)*260+28+(f.ring||0)*7;g.globalAlpha=.18+life*.65;g.strokeStyle=f.c;g.shadowColor=f.c;g.shadowBlur=24;g.lineWidth=3+(f.ring||0)%3;g.setLineDash([(f.ring||0)%2?12:4,7]);g.beginPath();g.arc(p.x,p.y,r,(f.a||0)+(1-life)*3,(f.a||0)+(1-life)*3+Math.PI*1.72);g.stroke();g.setLineDash([]);for(let n=0;n<6;n++){let q=(f.a||0)+n*Math.PI/3+(1-life)*4;g.fillStyle=n%2?f.c:'#fff';g.beginPath();g.arc(p.x+Math.cos(q)*r,p.y+Math.sin(q)*r,3+life*5,0,Math.PI*2);g.fill()}g.restore();continue}
g.globalAlpha=Math.min(1,f.t*2);g.strokeStyle=f.c;g.lineWidth=f.type==='attack'?7:3;g.beginPath();g.arc(p.x,p.y,(1-f.t)*65+12,f.type==='attack'?f.a-.9:0,f.type==='attack'?f.a+.9:Math.PI*2);g.stroke();g.globalAlpha=1
}
let night=(Math.sin(t/50)+1)/2*.25;g.fillStyle='rgba(15,31,66,'+night+')';g.fillRect(0,0,width,height);for(let i=0;i<12;i++){let x=(i*173+Math.sin(t*.3+i)*45+width)%width,y=(i*113+t*4)%height;ell(g,x,y,2,2,'#fff3b966')}
let edge=screen(0,0),end=screen(SIZE,SIZE);g.strokeStyle='#244b38';g.lineWidth=12;g.strokeRect(edge.x,edge.y,end.x-edge.x,end.y-edge.y);
if(active&&state&&me){if(frame%10===0)hud();if(lastHP&&me.hp<lastHP-1)tone(110,.13,.055,'triangle');if(me.pickups>lastPickups){tone(600+Math.min(700,me.chain*22),.08,.03);if(me.chain===10||me.chain===20||me.chain===30)musicPulse('combo');lastPickups=me.pickups}lastHP=me.hp;lastXP=me.xp;if(me.dead>0){$('death').style.display='flex';$('respawn').textContent='Hồi sinh sau '+Math.ceil(me.dead)+'…'}else $('death').style.display='none';if(state.round>lastRound+10)toast('Ván mới! Quán quân: '+(state.lastTop[0]?.name||'—'));lastRound=state.round}
if(active&&aiming){g.strokeStyle='#fff4c7';g.lineWidth=2;g.beginPath();g.arc(mouse.x,mouse.y,7,0,7);g.moveTo(mouse.x-12,mouse.y);g.lineTo(mouse.x+12,mouse.y);g.moveTo(mouse.x,mouse.y-12);g.lineTo(mouse.x,mouse.y+12);g.stroke()}if(now>toastUntil)$('toast').style.display='none';requestAnimationFrame(render)}
function hud(){let s=SPEC[me.species];questStep();let mult=1+Math.min(1,Math.floor(me.chain/5)*.2);$('growth').textContent='KÍCH THƯỚC ×'+bodyScale(me).toFixed(2);$('combo').textContent=me.chain?'CHUỖI '+me.chain+' · ĐIỂM ×'+mult.toFixed(1):'Ăn liên tục để nối chuỗi';$('combobar').style.width=(me.comboTime/4*100)+'%';$('powers').textContent=[me.magnet>0?'Hút mồi '+Math.ceil(me.magnet)+'s':'',me.haste>0?'Tăng tốc '+Math.ceil(me.haste)+'s':''].filter(Boolean).join(' · ');let ev=state.event;$('eventTitle').textContent=ev?ev.title:'RỪNG ĐANG CHUYỂN MÌNH';$('eventText').textContent=ev?(ev.claimed?'Đã bắt: '+ev.winner:ev.type===0?(ev.t<3?'Quả rơi sau '+Math.ceil(3-ev.t)+'s':'Quả đã rơi! Tranh mồi ở vòng vàng.'):ev.type===1?'Đuổi bắt đom đóm! Còn '+Math.ceil(ev.duration-ev.t)+'s':ev.t<3?'Ong xuất hiện sau '+Math.ceil(3-ev.t)+'s':ev.t<13?'Tránh ong! Mật ra sau '+Math.ceil(13-ev.t)+'s':'Mật đã ra — tranh thủ thu gom!'):'Sự kiện tiếp theo trong '+Math.max(0,Math.ceil(state.nextEvent))+'s';if(ev&&ev.id!==lastEventId){lastEventId=ev.id;tone(440,.25,.04);musicPulse('event');toast(ev.title+' · Theo dấu vàng trên minimap!')}
$('manabar').style.width=(me.mana/me.maxMana*100)+'%';$('manatext').textContent=Math.floor(me.mana)+' / '+me.maxMana+' MANA'+(me.running?' · ĐANG CHẠY':'');$('right').disabled=me.dead>0||me.rd>0||me.mana<18;$('stats').textContent=state.humans+' người · '+state.bots+' AI | '+Math.floor(me.score)+' điểm';let sec=Math.max(0,Math.ceil(state.round));$('clock').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');$('period').textContent=['BÌNH MINH','TRƯA XANH','HOÀNG HÔN','ĐÊM ĐOM ĐÓM'][Math.floor(state.time/50)%4];$('hptext').textContent=s.name+' · '+Math.ceil(me.hp)+' / '+Math.ceil(me.max)+' HP';let req=[70,180,350][me.level];$('xptext').textContent=['Con non','Trưởng thành','Đầu đàn','Chúa tể'][me.level]+' · '+Math.floor(me.xp)+(req?'/'+req:'');$('hpbar').style.width=(me.hp/me.max*100)+'%';$('left').querySelector('span').textContent=s.left;$('left').querySelector('em').textContent=me.cd>0?'Hồi '+me.cd.toFixed(1)+'s':'SẴN SÀNG';$('left').disabled=me.dead>0||me.cd>0;
$('right').querySelector('span').textContent=s.right;$('right').querySelector('em').textContent=me.rd>0?'Hồi '+me.rd.toFixed(1)+'s':me.mana<18?'Thiếu mana':'SẴN SÀNG';$('right').disabled=me.dead>0||me.rd>0||me.mana<18;
let rage=Math.max(0,Math.min(100,me.rage||0)),ult=$('ultimate');ult.querySelector('span').textContent=s.ultimate;ult.querySelector('em').textContent=rage>=100?'SPACE · NỘ NGAY':Math.floor(rage)+'% NỘ';ult.querySelector('u').style.width=rage+'%';ult.classList.toggle('ready',rage>=100);ult.disabled=me.dead>0||rage<100;
($('passive')||$('sidePassive')).querySelector('span').textContent=s.passive;
if(me.cd>0&&lastSkillCd<=0)animalSkillSound(me.species,0);if(me.rd>0&&lastSkillRd<=0)animalSkillSound(me.species,1);
let myUlt=(state.fx||[]).find(f=>f.type==='ultimate'&&f.owner===pid);if(myUlt&&myUlt.t!==lastUltFx){animalUltimateSound(me.species);musicPulse('event');toast('NỘ · '+s.ultimate+'!');lastUltFx=myUlt.t}
lastSkillCd=me.cd;lastSkillRd=me.rd;lastRage=rage;$('board').replaceChildren();let title=document.createElement('b');title.textContent='★ DẤU CHÂN DẪN ĐẦU';$('board').append(title);for(let [i,p]of state.top.entries()){let d=document.createElement('div');d.textContent=(i+1)+'. '+p.name+' · '+Math.floor(p.score);if(p.id===pid)d.style.color='#f5d487';$('board').append(d)}
mg.fillStyle='#517f59';mg.fillRect(0,0,300,300);let k=300/SIZE;for(let p of PONDS)ell(mg,p.x*k,p.y*k,p.r*k,p.r*k,'#78b8af');for(let o of TERRAIN)ell(mg,o.x*k,o.y*k,o.type==='tree'?2:1.2,2,o.type==='rock'?'#b8c3a3':'#2b6049');for(let h of HERBS){mg.fillStyle='#dcf5ac';mg.fillRect(h.x*k-2,h.y*k-2,5,5)}if(state.event&&!state.event.claimed){let e=state.event;mg.strokeStyle='#ffe69d';mg.lineWidth=2;mg.beginPath();mg.arc(e.x*k,e.y*k,8+Math.sin(state.time*5)*2,0,7);mg.stroke();ell(mg,e.x*k,e.y*k,3,3,'#ffe69d')}for(let p of state.players)if(!p.dead)ell(mg,p.x*k,p.y*k,p.id===pid?5:2.6,p.id===pid?5:2.6,p.id===pid?'#fff2aa':'#f3ac8d');mg.strokeStyle='#f5ecc27a';mg.lineWidth=1;mg.strokeRect((cam.x-width/2)*k,(cam.y-height/2)*k,width*k,height*k)}
requestAnimationFrame(render);
