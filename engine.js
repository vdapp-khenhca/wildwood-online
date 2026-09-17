(function(root){
'use strict';
const SPEC=[
['Rắn độc','#82c768',92,155,'Cắn độc','Lột xác','Cắn rồi rút lui; độc không cộng dồn.','poison','clean',26,1.15],
['Hổ','#edac59',118,145,'Vồ cắn','Ẩn mình','Vồ khi địch hụt chiêu, tận dụng bụi cây.','pounce','hide',28,1.35],
['Sư tử','#e5bf70',128,135,'Cào mạnh','Gầm vang','Ép đối thủ vào tầm cào rộng.','sweep','roar',25,1.15],
['Báo săn','#e5d274',86,185,'Cắn nhanh','Bứt tốc','Vào nhanh, rút sớm; tránh trao đổi máu.','bite','sprint',18,.7],
['Sói','#9cacbd',106,160,'Cắn gân','Lướt','Cắn làm chậm rồi bám theo mục tiêu.','slow','dash',21,.95],
['Cá sấu','#599d80',130,125,'Ngoạm','Da cứng','Đi dưới nước nhanh hơn; ngoạm ở cự ly gần.','bite','guard',32,1.45],
['Gấu','#ac8168',154,112,'Vả rộng','Thủ thế','Giữ vị trí, vả khi đối thủ áp sát.','sweep','guard',29,1.4],
['Nhện','#b193d7',88,151,'Bắn tơ','Nhảy lùi','Bắn tơ từ xa, nhảy lùi khi bị áp sát.','web','back',17,1.2],
['Bọ cạp','#b68cbd',115,133,'Chích độc','Vùi mình','Chích gần, vùi mình khi chờ hồi chiêu.','poison','burrow',24,1.3],
['Đại bàng','#d8b487',94,157,'Bổ nhào','Bay cao','Bổ nhào theo đường thẳng, bay để thoát.','pounce','fly',25,1.3],
['Cú mèo','#a79cbd',99,150,'Quắp','Bay lặng','Tiếp cận kín đáo; nhìn xa hơn ban đêm.','pounce','hide',23,1.15],
['Cáo','#ed9161',92,165,'Cắn','Bóng giả','Đổi hướng sau khi thả bóng để cắt đuôi.','bite','decoy',21,.9],
['Lợn rừng','#ab8b86',135,132,'Húc','Lì đòn','Húc xuyên qua mục tiêu rồi xoay lại.','charge','clean',27,1.4],
['Lửng mật','#aeb9ad',121,139,'Cắn lì','Phản đòn','Bật phản đòn trước khi đối thủ đánh gần.','bite','reflect',24,1.15],
['Linh cẩu','#c5ac7e',102,158,'Cắn xé','Gom mồi','Canh đối thủ yếu máu; gom đốm rồi rút.','execute','magnet',21,1.05]
].map((s,id)=>({id,name:s[0],color:s[1],hp:s[2],speed:s[3],left:s[4],right:s[5],tip:s[6],attack:s[7],defense:s[8],damage:s[9],cd:s[10]}));
const EXTRA=[
['Nanh Chớp','Kháng độc: thời gian nhiễm độc giảm mạnh.','venomBurst'],
['Móng Xé','Săn mồi: mạnh hơn khi áp sát con mồi yếu.','bleed'],
['Uy Vương','Uy lực: nhiều máu, giữ vùng tranh chấp tốt.','shock'],
['Tàn Ảnh','Bản năng tốc độ: tốc chạy cơ bản cực cao.','blink'],
['Truy Kích','Đánh hơi: bám mục tiêu bị làm chậm tốt hơn.','hunt'],
['Quẫy Đuôi','Thủy sinh: di chuyển trong ao nhanh hơn.','tail'],
['Địa Chấn','Thân lớn: chống chịu tốt trong giao tranh gần.','quake'],
['Kén Tơ','Thợ săn xa: tầm bắn tơ vượt trội.','webtrap'],
['Độc Vũ','Giáp độc: áp sát, đầu độc rồi rút lui.','sting'],
['Cuồng Phong','Mắt trời: cơ động cao khi thoát giao tranh.','gust'],
['Sóng Âm','Dạ nhãn: tầm nhìn xa hơn trong rừng.','sonar'],
['Lửa Cáo','Lanh lợi: tốc độ cao, đổi hướng dễ.','foxfire'],
['Càn Quét','Lì lợm: lượng máu lớn, hợp lao thẳng.','ram'],
['Bất Khuất','Kháng độc: độc tồn tại ngắn hơn trên cơ thể.','fury'],
['Cười Săn','Kẻ kết liễu: cắn mạnh hơn lên mục tiêu thấp máu.','laugh']
];
SPEC.forEach((s,i)=>{s.ultimate=EXTRA[i][0];s.passive=EXTRA[i][1];s.ultType=EXTRA[i][2];s.ultColor=['#65ff9a','#ff6b6b','#ffd76b','#94b8ff','#ffb46b','#62e6ff','#d7c29e','#e2e8ff','#d56bff','#b7f5ff','#8ad6ff','#ff8ad8','#ffc16b','#f7f1c2','#ff667f'][i]});


const SIZE=3600,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function bodyScale(p){let m=Math.max(0,p.mass||0);return 1+1.4*m/(m+180)}
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function terrain(){let r=rng(74831),a=[];for(let i=0;i<240;i++)a.push({x:90+r()*(SIZE-180),y:90+r()*(SIZE-180),r:18+r()*26,type:i<36?'rock':i<110?'bush':'tree'});return a}
const TERRAIN=terrain(),PONDS=[{x:800,y:950,r:220},{x:2580,y:2400,r:290},{x:2700,y:680,r:170}],HERBS=[{x:1760,y:1760},{x:700,y:1400},{x:2800,y:1900},{x:1350,y:2900}];
for(let i=TERRAIN.length-1;i>=0;i--)if(PONDS.some(w=>dist(TERRAIN[i],w)<w.r+15)||HERBS.some(h=>dist(TERRAIN[i],h)<75))TERRAIN.splice(i,1);
class World{
constructor(count=24){this.time=0;this.round=480;this.players=[];this.food=[];this.shots=[];this.event=null;this.nextEvent=12;this.eventId=0;this.lastEventType=-1;this.fx=[];this.decoys=[];this.count=count;this.next=1;this.lastTop=[];for(let i=0;i<640;i++)this.addFood();this.fill()}
point(){for(let i=0;i<100;i++){let p={x:80+Math.random()*(SIZE-160),y:80+Math.random()*(SIZE-160)};if(!TERRAIN.some(o=>o.type==='rock'&&dist(p,o)<o.r+35))return p}return{x:1800,y:1800}}
addFood(x,y,v=2,kind='orb'){if(x==null){let r=Math.random();kind=r<.016?'gold':r<.038?'heal':r<.06?'mana':r<.073?'magnet':r<.086?'haste':'orb';if(kind==='gold')v=12}let p=x==null?this.point():{x:clamp(x,25,SIZE-25),y:clamp(y,25,SIZE-25)};if(TERRAIN.some(o=>o.type==='rock'&&dist(p,o)<o.r+8)){let o=TERRAIN.find(o=>o.type==='rock'&&dist(p,o)<o.r+8),a=Math.atan2(p.y-o.y,p.x-o.x);p.x=o.x+Math.cos(a)*(o.r+16);p.y=o.y+Math.sin(a)*(o.r+16)}this.food.push({...p,v,kind,h:Math.random()})}
add(name,species,bot=false,id){let s=SPEC[species]||SPEC[0],p={...this.point(),id:id||'p'+this.next++,name:String(name||'Khách').slice(0,18),species:s.id,bot,hp:s.hp,max:s.hp,mana:100,maxMana:100,mc:0,rage:0,maxRage:100,mass:0,chain:0,comboTime:0,bestChain:0,magnet:0,haste:0,pickups:0,held:0,running:false,exhausted:false,xp:0,score:0,kills:0,level:0,a:0,cd:0,rd:0,td:0,poison:0,slow:0,buff:0,shield:3,dead:0,think:0,input:{x:0,y:0,l:false,r:false},mood:Math.random()};this.players.push(p);return p}
fill(){while(this.players.length>this.count){let i=this.players.findIndex(p=>p.bot&&(p.dead>0||p.hp===p.max));if(i<0)break;this.players.splice(i,1)}while(this.players.length<this.count){let i=this.next;this.add(['Mầm','Dẻ','Nấm','Mây','Rêu','Lá','Sóc','Sương'][i%8]+' · AI',i%15,true)}}
join(name,species,id){let b=this.players.find(p=>p.bot&&p.dead>0)||this.players.find(p=>p.bot&&p.hp===p.max);if(b)this.players.splice(this.players.indexOf(b),1);return this.add(name,species,false,id)}
visible(a,b){return a.id===b.id||(!b.dead&&dist(a,b)<(a.species===10?780:650)&&(!(b.buff>0&&['hide','decoy','burrow'].includes(SPEC[b.species].defense))||dist(a,b)<100)&&(!TERRAIN.some(o=>o.type==='bush'&&dist(b,o)<o.r+12)||dist(a,b)<155))}
hit(v,d,from){if(v.dead||v.shield>0||v.buff>0&&SPEC[v.species].defense==='fly')return;let def=SPEC[v.species].defense;if(v.buff>0&&['guard','burrow','reflect'].includes(def))d*=.4;v.hp-=d;v.hurt=.15;if(from&&from!==v&&!from.dead)from.rage=Math.min(from.maxRage,(from.rage||0)+d*.55);if(v.buff>0&&def==='reflect'&&from&&!from.dead)from.hp=Math.max(1,from.hp-d*.7);if(v.hp<=0)this.die(v,from)}
die(p,k){if(p.dead)return;p.dead=3;p.hp=0;p.poison=0;p.running=false;p.held=0;p.chain=0;p.comboTime=0;p.rage=Math.max(0,(p.rage||0)-25);p.magnet=p.haste=0;p.input={x:0,y:0,l:false,r:false};for(let i=0;i<22;i++){let a=Math.random()*7,r=Math.random()*85;this.addFood(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,3+Math.min(6,Math.floor(p.xp/80)))}if(k&&k.id!==p.id){k.kills++;k.score+=90;k.rage=Math.min(k.maxRage,(k.rage||0)+24)}this.fx.push({x:p.x,y:p.y,t:1,type:'death',c:SPEC[p.species].color})}
evolve(p){let req=[70,180,350][p.level];if(!p.dead&&req&&p.xp>=req){p.level++;p.max=SPEC[p.species].hp*(1+p.level*.09);p.hp=Math.min(p.max,p.hp+18);this.fx.push({x:p.x,y:p.y,t:1,type:'evolve',c:'#ffe791'})}}
skill(p,right){let s=SPEC[p.species],a=p.a;if(p.dead|| (right?p.rd:p.cd)>0)return;if(right&&!this.spend(p,18))return;p.shield=0;if(right){p.rd=6;p.buff=2;if(s.defense==='clean'){p.poison=0;p.slow=0}if(['dash','back'].includes(s.defense))this.move(p,Math.cos(a)*(s.defense==='back'?-130:150),Math.sin(a)*(s.defense==='back'?-130:150));if(s.defense==='roar')for(let v of this.players)if(v!==p&&!v.dead&&dist(p,v)<145){this.move(v,(v.x-p.x)*.65,(v.y-p.y)*.65);v.slow=1}if(s.defense==='decoy')this.decoys.push({x:p.x,y:p.y,a:p.a,species:p.species,t:2.5});this.fx.push({x:p.x,y:p.y,t:.6,type:'guard',c:s.color});return}
p.cd=s.cd;if(['hide','decoy','burrow'].includes(s.defense))p.buff=0;
if(['pounce','charge'].includes(s.attack)){for(let j=0;j<7;j++){this.move(p,Math.cos(a)*18,Math.sin(a)*18);this.melee(p,s,a,j===0?[]:p._hits)}delete p._hits}
else if(s.attack==='web')this.shots.push({x:p.x,y:p.y,vx:Math.cos(a)*350,vy:Math.sin(a)*350,owner:p.id,t:1.4});else this.melee(p,s,a,[]);
this.fx.push({x:p.x+Math.cos(a)*30,y:p.y+Math.sin(a)*30,a,t:.25,type:'attack',c:s.color})}


eat(p,f){let v=f.v||2;p.chain=p.comboTime>0?p.chain+1:1;p.comboTime=4;p.bestChain=Math.max(p.bestChain,p.chain);p.mass+=v;p.xp+=v;p.pickups++;p.rage=Math.min(p.maxRage,(p.rage||0)+Math.max(1,v*.7)+(p.chain%5===0?2:0));
let mult=1+Math.min(1,Math.floor(p.chain/5)*.2),points=Number((v*mult).toFixed(1));p.score+=points;
if(f.kind==='heal')p.hp=Math.min(p.max,p.hp+22);if(f.kind==='mana')p.mana=Math.min(p.maxMana,p.mana+35);if(f.kind==='magnet')p.magnet=7;if(f.kind==='haste')p.haste=6;
if(p.chain%10===0)p.mana=Math.min(p.maxMana,p.mana+10);
if(p.chain===20){p.magnet=Math.max(p.magnet,3);this.fx.push({x:p.x,y:p.y-55*bodyScale(p),t:1,type:'eat',c:'#dfb1ff',text:'HÚT MỒI!',owner:p.id})}
if(p.chain===30){for(let n=0;n<3;n++){let a=n*Math.PI*2/3+Math.random()*.35;this.addFood(p.x+Math.cos(a)*75,p.y+Math.sin(a)*75,12,'gold')}this.fx.push({x:p.x,y:p.y-55*bodyScale(p),t:1,type:'eat',c:'#ffe188',text:'THƯỞNG VÀNG!',owner:p.id})}
this.fx.push({x:p.x,y:p.y-35*bodyScale(p),t:.8,type:'eat',c:f.kind==='gold'?'#ffdb69':'#e2f5b0',text:'+'+points,owner:p.id});
}
startEvent(type){if(type==null){type=Math.floor(Math.random()*3);if(type===this.lastEventType)type=(type+1)%3}this.lastEventType=type;
let humans=this.players.filter(p=>!p.bot&&!p.dead),anchor=humans.length?humans[Math.floor(Math.random()*humans.length)]:this.point(),a=Math.random()*Math.PI*2,d=380+Math.random()*280;
let pos={x:clamp(anchor.x+Math.cos(a)*d,180,SIZE-180),y:clamp(anchor.y+Math.sin(a)*d,180,SIZE-180)};for(let n=0;n<8;n++)this.move(pos,0,0);
this.event={...pos,id:++this.eventId,type,t:0,r:type===2?155:170,duration:type===1?25:20,title:['MƯA QUẢ VÀNG','ĐOM ĐÓM VÀNG','TỔ ONG MẬT'][type],spawned:false,claimed:false};this.nextEvent=38+Math.random()*12;
}
ultimate(p){
if(p.dead||(p.rage||0)<p.maxRage)return;
let s=SPEC[p.species],type=s.ultType,a=p.a;
p.rage=0;p.shield=0;p.buff=Math.max(p.buff,2.4);p.haste=Math.max(p.haste,2.6);
let enemies=this.players.filter(v=>v!==p&&!v.dead),push=(v,n)=>{let d=Math.max(1,dist(p,v));this.move(v,(v.x-p.x)/d*n,(v.y-p.y)/d*n)};
for(let n=0;n<9;n++)this.fx.push({x:p.x,y:p.y,t:1.15+n*.055,type:'ultimate',c:s.ultColor,owner:p.id,ring:n,ult:p.species,a:a+n*.7});
for(let n=0;n<18;n++){let q=a+n*Math.PI*2/18;this.fx.push({x:p.x+Math.cos(q)*(35+n%3*18),y:p.y+Math.sin(q)*(35+n%3*18),t:.8+n*.025,type:'spark',c:n%2?s.ultColor:'#ffffff',owner:p.id,a:q})}
if(['blink','hunt','ram','foxfire'].includes(type)){for(let n=0;n<5;n++){this.move(p,Math.cos(a)*45,Math.sin(a)*45);for(let v of enemies)if(dist(p,v)<95){this.hit(v,10+(type==='ram'?5:0),p);push(v,32)}}}
else if(['venomBurst','sting'].includes(type)){for(let v of enemies)if(dist(p,v)<250){this.hit(v,28,p);v.poison=v.species===13?2:6;v.poisoner=p.id;push(v,55)}}
else if(type==='bleed'||type==='laugh'){for(let wave=0;wave<4;wave++)for(let v of enemies)if(dist(p,v)<120+wave*42){this.hit(v,11+(v.hp/v.max<.4?5:0),p);v.slow=Math.max(v.slow,1.8)}}
else if(['shock','quake','tail','gust'].includes(type)){for(let v of enemies)if(dist(p,v)<300){this.hit(v,type==='quake'?38:31,p);push(v,type==='gust'?220:135);v.slow=Math.max(v.slow,2.2)}}
else if(type==='webtrap'){for(let v of enemies)if(dist(p,v)<330){this.hit(v,24,p);v.slow=Math.max(v.slow,5)}}
else if(type==='sonar'){p.magnet=Math.max(p.magnet,10);p.haste=Math.max(p.haste,7);for(let v of enemies)if(dist(p,v)<340){this.hit(v,20,p);v.slow=Math.max(v.slow,3)}}
else if(type==='fury'){p.hp=Math.min(p.max,p.hp+55);p.poison=0;p.slow=0;p.buff=Math.max(p.buff,4);for(let v of enemies)if(dist(p,v)<260){this.hit(v,30,p);push(v,120)}}
this.fx.push({x:p.x,y:p.y-72,t:1.8,type:'ulttext',c:s.ultColor,text:s.ultimate,owner:p.id});
}
eventStep(dt){this.nextEvent-=dt;if(this.nextEvent<=0&&!this.event)this.startEvent();let e=this.event;if(!e)return;e.t+=dt;
if(e.type===0&&e.t>=3&&!e.spawned){e.spawned=true;for(let n=0;n<38;n++){let a=Math.random()*7,r=Math.sqrt(Math.random())*e.r;this.addFood(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,n%7===0?12:4,n%7===0?'gold':'orb')}}
if(e.type===1&&!e.claimed){let nearest=this.players.filter(p=>!p.dead&&dist(p,e)<240).sort((a,b)=>dist(a,e)-dist(b,e))[0];let a=nearest?Math.atan2(e.y-nearest.y,e.x-nearest.x):Math.sin(this.time*.7)*3;let probe={x:e.x,y:e.y,species:0,buff:0};this.move(probe,Math.cos(a)*85*dt,Math.sin(a)*85*dt);e.x=probe.x;e.y=probe.y;
for(let p of this.players)if(!p.dead&&!(p.buff>0&&SPEC[p.species].defense==='fly')&&dist(p,e)<24*bodyScale(p)+12){this.eat(p,{v:45,kind:'gold'});p.magnet=7;e.claimed=true;e.winner=p.name;e.t=Math.max(e.t,e.duration-3);break}}
if(e.type===2&&e.t>=3&&e.t<13){for(let p of this.players)if(!p.dead&&dist(p,e)<e.r)this.hit(p,7*dt,null)}
if(e.type===2&&e.t>=13&&!e.spawned){e.spawned=true;for(let n=0;n<22;n++){let a=Math.random()*7,r=Math.random()*e.r*.75;this.addFood(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,6,n%5===0?'heal':'gold')}}
if(e.t>=e.duration)this.event=null;
}

spend(p,cost){if(p.mana<cost)return false;p.mana-=cost;p.mc=.8;return true}
protected(p){return p.dead>0||p.shield>0||p.buff>0&&SPEC[p.species].defense==='fly'}
melee(p,s,a,hits){p._hits=hits;for(let v of this.players){if(v===p||v.dead||hits.includes(v.id)||dist(p,v)>((s.attack==='sweep'?66:41)+21*bodyScale(p)+21*bodyScale(v)))continue;let da=Math.atan2(v.y-p.y,v.x-p.x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>(s.attack==='sweep'?1.5:1.05))continue;hits.push(v.id);let protectedHit=v.shield>0||v.buff>0&&SPEC[v.species].defense==='fly';this.hit(v,s.damage*(1+p.level*.065)*(s.attack==='execute'&&v.hp/v.max<.35?1.45:1),p);if(!v.dead&&!protectedHit){if(s.attack==='poison'){v.poison=v.species===13?1.5:3.5;v.poisoner=p.id}if(s.attack==='slow')v.slow=1.5}}}
move(p,dx,dy){let fly=p.buff>0&&SPEC[p.species].defense==='fly';let radius=21*bodyScale(p);p.x=clamp(p.x+dx,radius,SIZE-radius);p.y=clamp(p.y+dy,radius,SIZE-radius);if(!fly)for(let o of TERRAIN){if(o.type!=='rock')continue;let d=dist(p,o),rr=o.r+radius;if(d<rr){let a=Math.atan2(p.y-o.y,p.x-o.x);p.x=o.x+Math.cos(a)*rr;p.y=o.y+Math.sin(a)*rr}}}
ai(p,dt){p.think-=dt;if(p.think>0)return;p.think=.18+Math.random()*.2;let enemies=this.players.filter(v=>v!==p&&this.visible(p,v));enemies.sort((a,b)=>dist(a,p)-dist(b,p));let e=enemies[0],target,retreat=false;p.input.l=false;p.input.r=false;p.input.tap=false;
if(e&&dist(e,p)<430){let range=SPEC[p.species].attack==='web'?270:70;retreat=p.hp/p.max<.3||(p.cd>.25&&dist(e,p)<110)||(e.buff>0&&SPEC[e.species].defense==='reflect');let dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;if(retreat)target={x:p.x-dx/d*240-dy/d*90,y:p.y-dy/d*240+dx/d*90};else if(d>range*.8)target=e;else target={x:p.x-dy/d*100,y:p.y+dx/d*100};p.input.tap=d<(range+25)&&!retreat;p.input.l=retreat&&p.mana>25;p.input.r=(retreat||d<125)&&Math.random()<.6;if(p.input.tap){p.a=Math.atan2(dy,dx);target=e}}
if(!target){let foods=this.food.filter(f=>dist(f,p)<650);foods.sort((a,b)=>dist(a,p)/a.v-dist(b,p)/b.v);let ev=this.event;target=ev&&!ev.claimed&&dist(p,ev)<950&&p.hp/p.max>.55&&(p.mood>.45||ev.type===1)?ev:foods[0]||p.wander;if(ev&&ev.type===2&&ev.t>3&&ev.t<13&&dist(p,ev)<ev.r+60){let a=Math.atan2(p.y-ev.y,p.x-ev.x);target={x:ev.x+Math.cos(a)*(ev.r+110),y:ev.y+Math.sin(a)*(ev.r+110)}}if(!target||dist(target,p)<40)p.wander=target=this.point()}
let dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;let vx=dx/d,vy=dy/d;for(let o of TERRAIN){if(o.type==='rock'&&dist(p,o)<o.r+90){let dot=(o.x-p.x)*vx+(o.y-p.y)*vy;if(dot>0){let old=vx;vx=-vy;vy=old;break}}}p.input.x=vx;p.input.y=vy;this.evolve(p)}
step(dt){this.time+=dt;this.eventStep(dt);this.round-=dt;if(this.round<=0){this.lastTop=[...this.players].sort((a,b)=>b.score-a.score).slice(0,5).map(p=>({name:p.name,score:p.score}));this.round=480;this.event=null;this.nextEvent=12;for(let p of this.players){p.score=0;p.xp=0;p.mass=0;p.chain=0;p.comboTime=0;p.level=0;p.max=SPEC[p.species].hp;p.hp=p.max;p.mana=p.maxMana;p.rage=0;p.held=0;p.running=false;p.exhausted=false;p.mc=0;p.poison=p.slow=p.buff=p.magnet=p.haste=0;p.shield=3}}
for(let p of this.players){if(p.dead>0){p.dead-=dt;if(p.dead<=0){Object.assign(p,this.point());p.hp=p.max;p.mana=p.maxMana;p.rage=0;p.held=0;p.running=false;p.exhausted=false;p.mc=0;p.poison=p.slow=p.buff=p.magnet=p.haste=0;p.shield=3;p.xp*=.7;p.mass*=.65;p.dead=0}continue}for(let k of ['cd','rd','buff','shield','slow','hurt','mc','magnet','haste','comboTime'])p[k]=Math.max(0,(p[k]||0)-dt);if(p.poison>0){p.poison-=dt;this.hit(p,5*dt,this.players.find(v=>v.id===p.poisoner));if(p.dead)continue}if(p.comboTime===0)p.chain=0;if(p.bot)this.ai(p,dt);let i=p.input,s=SPEC[p.species],mag=Math.hypot(i.x,i.y);
p.held=i.l?p.held+dt:0;if(!i.l)p.exhausted=false;
p.running=p.held>=.25&&mag>.02&&!p.exhausted&&p.mana>=18*dt;
if(p.running){this.spend(p,18*dt)}else if(p.mc<=0)p.mana=Math.min(p.maxMana,p.mana+12*dt);
if(p.held>=.25&&p.mana<18*dt)p.exhausted=true;
if(mag>.02){p.a=Math.atan2(i.y,i.x);let water=PONDS.some(o=>dist(p,o)<o.r),speed=s.speed*((p.running||p.haste>0)?1.65:1)*(1-p.level*.022)*(p.slow>0?.55:1)*(p.buff>0&&['sprint','clean','magnet','fly','hide','decoy'].includes(s.defense)?((p.running||p.haste>0)?1:1.65):1)*(p.buff>0&&s.defense==='burrow'?0:1)*(water?(p.species===5?1.4:.76):1);this.move(p,i.x/Math.max(1,mag)*speed*dt,i.y/Math.max(1,mag)*speed*dt)}if(i.tap){this.skill(p,false);i.tap=false;}if(i.r)this.skill(p,true);this.evolve(p);if(i.e){this.ultimate(p);i.e=false}if(HERBS.some(h=>dist(h,p)<60)){p.poison=0;p.hp=Math.min(p.max,p.hp+10*dt)}else p.hp=Math.min(p.max,p.hp+1.4*dt);if(!(p.buff>0&&s.defense==='fly'))for(let j=this.food.length-1;j>=0;j--){let f=this.food[j],d=dist(f,p);if(d<(p.magnet>0||p.buff>0&&s.defense==='magnet'?125:24*bodyScale(p)+6)){this.eat(p,f);this.food.splice(j,1)}}}
for(let b of this.shots){b.x+=b.vx*dt;b.y+=b.vy*dt;b.t-=dt;if(TERRAIN.some(o=>o.type==='rock'&&dist(o,b)<o.r))b.t=0;for(let p of this.players)if(p.id!==b.owner&&!p.dead&&dist(p,b)<21*bodyScale(p)+11&&b.t>0){let blocked=p.shield>0||p.buff>0&&SPEC[p.species].defense==='fly';this.hit(p,b.damage??17,this.players.find(v=>v.id===b.owner));if(!blocked){if(!b.effect||b.effect==='frost')p.slow=2;if(b.effect==='venom'){p.poison=p.species===13?1.5:3.5;p.poisoner=b.owner}if(b.effect==='wave')this.move(p,b.vx*.16,b.vy*.16);}b.t=0}}
this.shots=this.shots.filter(b=>b.t>0);for(let f of this.fx)f.t-=dt;this.fx=this.fx.filter(f=>f.t>0);for(let d of this.decoys){d.x+=Math.cos(d.a)*130*dt;d.y+=Math.sin(d.a)*130*dt;d.t-=dt}this.decoys=this.decoys.filter(d=>d.t>0);while(this.food.length<640)this.addFood();if(this.food.length>1500)this.food.splice(0,this.food.length-1500);this.fill()}
snapshot(id){let me=this.players.find(p=>p.id===id);return{time:this.time,round:this.round,players:this.players.filter(p=>!me||p.id===id||this.visible(me,p)).map(({input,_hits,wander,...p})=>p),food:this.food.filter(f=>!me||dist(f,me)<1100),event:this.event,nextEvent:this.nextEvent,shots:this.shots.filter(v=>!me||dist(v,me)<1200),fx:this.fx.filter(v=>!me||dist(v,me)<1200),decoys:this.decoys.filter(v=>!me||dist(v,me)<1200),top:[...this.players].sort((a,b)=>b.score-a.score).slice(0,5).map(p=>({id:p.id,name:p.name,score:p.score})),humans:this.players.filter(p=>!p.bot).length,bots:this.players.filter(p=>p.bot).length,lastTop:this.lastTop}}
}
root.Wild={SPEC,SIZE,TERRAIN,PONDS,HERBS,World,dist,bodyScale};if(typeof module!=='undefined')module.exports=root.Wild;
})(typeof globalThis!=='undefined'?globalThis:this);
