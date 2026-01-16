export const voidChallengeHTML = `<!DOCTYPE html>
<html><head><title>Void Challenge</title><style>
body{margin:0;background:#000;overflow:hidden;color:#fff;font-family:'Segoe UI',Arial}
#info{position:absolute;top:20px;left:20px;font-size:22px;font-weight:bold}
canvas{display:block;margin:auto;background:#0a0a0a;border-bottom:5px solid #222}
</style></head><body>
<div id="info">Lives: 2 | Holes: 0/3</div>
<canvas id="c" width="800" height="500"></canvas>
<script>
const c=document.getElementById("c"),ctx=c.getContext("2d");
let player={x:100,y:200,w:35,h:35,vy:0,g:0.25,l:-5.5},blocks=[],holes=[],entered=0,lives=2,paused=0,over=0,won=0,inv=0;
window.addEventListener("keydown",e=>{if(e.code==="Space"&&!over&&!won&&!paused)player.vy=player.l});
function update(){if(over||won||paused)return;player.vy+=player.g;player.y+=player.vy;if(inv>0)inv--;
if(player.y+player.h>465||player.y<0){hit();player.y=Math.max(0,Math.min(player.y,465-player.h))}
if(Math.random()<0.012)blocks.push({x:800,y:Math.random()*380+20,w:40,h:40});
if(Math.random()<0.006&&entered<3)holes.push({x:800,y:Math.random()*300+100,r:28});
blocks.forEach(b=>b.x-=3.5);holes.forEach(h=>h.x-=3.5);
blocks.forEach(b=>{if(player.x<b.x+b.w&&player.x+player.w>b.x&&player.y<b.y+b.h&&player.y+player.h>b.y)hit()});
holes.forEach((h,i)=>{let dx=Math.abs(h.x-player.x-player.w/2),dy=Math.abs(h.y-player.y-player.h/2);
if(dx<player.w/2+h.r&&dy<player.h/2+h.r){paused=1;setTimeout(()=>{
const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1;
const start=Date.now(),ans=prompt("What is "+a+"+"+b+"?"),time=(Date.now()-start)/1000;
const correct=parseInt(ans)===(a+b);
window.parent.postMessage({type:'questionAnswered',isCorrect:correct,timeSpent:time,difficulty:1,taskType:'number'},'*');
if(correct){entered++;document.getElementById('info').innerText="Lives: "+lives+" | Holes: "+entered+"/3";
if(entered>=3)won=1}else hit();holes.splice(i,1);paused=0},50)}});
blocks=blocks.filter(b=>b.x>-50);holes=holes.filter(h=>h.x>-100)}
function hit(){if(inv>0)return;lives--;document.getElementById('info').innerText="Lives: "+lives+" | Holes: "+entered+"/3";
if(lives<=0)over=1;else{inv=60;player.vy=-2}}
function draw(){ctx.clearRect(0,0,800,500);ctx.fillStyle='#222';ctx.fillRect(0,465,800,35);
if(inv%10<5){ctx.fillStyle='#0fc';ctx.fillRect(player.x,player.y,player.w,player.h)}
ctx.fillStyle='#f33';blocks.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));
holes.forEach(h=>{ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();
ctx.strokeStyle='#b0f';ctx.lineWidth=3;ctx.stroke()});
if(over||won){ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,800,500);ctx.fillStyle='#fff';
ctx.textAlign='center';ctx.font='bold 40px Arial';ctx.fillText(won?'COMPLETE!':'GAME OVER',400,230);
setTimeout(()=>window.parent.postMessage({type:'gameComplete',score:entered*100,correct:entered,incorrect:3-entered,grade:won?'A':'C'},'*'),1000)}}
function loop(){update();draw();requestAnimationFrame(loop)}loop();
<\/script></body></html>`;

export const memoryQuestHTML = `<!DOCTYPE html>
<html><head><title>Memory Quest</title><style>
body{background:#0f172a;color:#fff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;min-height:100vh;margin:0;padding:20px}
.grid{display:grid;gap:10px;background:rgba(255,255,255,0.05);padding:15px;border-radius:12px}
.card{width:70px;height:70px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer}
.card.hidden{color:transparent}.card.matched{opacity:0.3;cursor:default}
</style></head><body>
<h1>Memory Quest</h1>
<div>Level: <span id="lvl">3x3</span> | Lives: <span id="lives">10</span></div>
<div class="grid" id="g"></div>
<script>
let size=3,lives=10,mistakes=0,flipped=[],matched=0,proc=0;
const icons=['💾','💻','🔌','🖱️','📱','🕹️','📡','💡','🔋','⚙️','🔒','🔑','📁','📊','🌐','🚀','🤖','👾'];
function init(){const g=document.getElementById('g'),total=size*size,pairs=Math.floor(total/2);let arr=[];
for(let i=0;i<pairs;i++)arr.push(icons[i%icons.length],icons[i%icons.length]);
if(total%2!==0)arr.push('⭐');arr.sort(()=>Math.random()-0.5);
g.style.gridTemplateColumns="repeat("+size+",70px)";g.innerHTML='';matched=0;
arr.forEach(ic=>{const d=document.createElement('div');d.className='card hidden';d.textContent=ic;
d.onclick=()=>flip(d);g.appendChild(d)});document.getElementById('lvl').innerText=size+"x"+size}
function flip(c){if(proc||flipped.includes(c)||c.classList.contains('matched'))return;
c.classList.remove('hidden');flipped.push(c);if(flipped.length===2){proc=1;setTimeout(check,600)}}
function check(){const[c1,c2]=flipped;if(c1.textContent===c2.textContent){c1.classList.add('matched');
c2.classList.add('matched');matched+=2;if(matched>=size*size-(size*size%2===0?0:1)){
setTimeout(()=>{if(size<6){size++;init()}else{
window.parent.postMessage({type:'gameComplete',score:100,correct:10,incorrect:mistakes,grade:'A'},'*')}},500)}}
else{c1.classList.add('hidden');c2.classList.add('hidden');lives--;mistakes++;
document.getElementById('lives').innerText=lives;if(lives<=0){alert('Game Over');
window.parent.postMessage({type:'gameComplete',score:50,correct:5,incorrect:mistakes,grade:'C'},'*')}}
flipped=[];proc=0}init();
</script></body></html>`;

export const treasureHunterHTML = `
<!DOCTYPE html>
<html><head><title>Treasure Hunter</title><style>
body{background:#0f172a;color:#fff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0}
#g{display:grid;grid-template-columns:repeat(3,120px);gap:15px;background:#1e293b;padding:25px;border-radius:20px;border:4px solid #38bdf8}
.hole{width:120px;height:120px;background:#334155;border-radius:50%;position:relative;overflow:hidden;border:4px solid #0f172a}
.orb{width:85px;height:85px;background:radial-gradient(circle,#4cc9f0,#4361ee);border-radius:50%;position:absolute;top:120px;left:18px;cursor:pointer;transition:top 0.2s}
.orb.up{top:18px}
</style></head><body>
<div>Energy: ⚡⚡ | Score: <span id="s">0</span></div>
<div id="g">
<div class="hole"><div class="orb"></div></div>
<div class="hole"><div class="orb"></div></div>
<div class="hole"><div class="orb"></div></div>
<div class="hole"><div class="orb"></div></div>
<div class="hole"><div class="orb"></div></div>
<div class="hole"><div class="orb"></div></div>
</div>
<script>
const orbs=document.querySelectorAll('.orb');let last,paused=0,score=0,energy=2,missed=0,peep=1100;
function rHole(h){const i=Math.floor(Math.random()*h.length),hole=h[i];return hole===last?rHole(h):last=hole,hole}
function go(){if(paused)return;const o=rHole(orbs);o.classList.add('up');let hit=0;
o.onclick=()=>{if(!hit&&!paused){score++;document.getElementById('s').innerText=score;hit=1;o.classList.remove('up')}};
setTimeout(()=>{if(!hit&&!paused){missed++;if(missed>=3){missed=0;energy--;if(energy<=0){
window.parent.postMessage({type:'gameComplete',score,correct:score,incorrect:missed,grade:score>20?'A':'B'},'*');return}}}
o.classList.remove('up');if(!paused)go();if(peep>500)peep-=10},peep)}go();
</script></body></html>`;

export const defenderChallengeHTML = `
<!DOCTYPE html>
<html><head><title>Defender</title><style>
body{background:#020617;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;overflow:hidden}
#w{position:relative;width:420px;height:620px;background:#0f172a;border:4px solid #38bdf8;border-radius:15px;overflow:hidden}
#b{position:absolute;bottom:20px;left:180px;font-size:50px;z-index:10;user-select:none}
.ball{position:absolute;width:35px;height:35px;background:radial-gradient(circle,#f43f5e,#881337);border-radius:50%}
.bullet{position:absolute;width:5px;height:15px;background:#22d3ee;border-radius:2px}
#st{position:absolute;top:10px;width:100%;display:flex;justify-content:space-around;color:#38bdf8;font-weight:bold;z-index:20}
</style></head><body>
<div id="w">
<div id="st"><span>Energy: ⚡⚡</span><span>Score: <span id="sc">0</span></span></div>
<div id="b">🚀</div>
</div>
<script>
const w=document.getElementById('w'),b=document.getElementById('b');
let bX=180,paused=0,score=0,lives=2,spawn=2000;
window.addEventListener('keydown',e=>{if(paused)return;if(e.key==="ArrowLeft"&&bX>10)bX-=25;
if(e.key==="ArrowRight"&&bX<350)bX+=25;b.style.left=bX+"px"});
setInterval(()=>{if(paused)return;const bu=document.createElement('div');bu.className='bullet';
bu.style.left=(bX+22)+"px";bu.style.bottom="70px";w.appendChild(bu);
let m=setInterval(()=>{if(paused)return;let y=parseInt(bu.style.bottom);bu.style.bottom=(y+10)+"px";
if(y>620){clearInterval(m);bu.remove()}
document.querySelectorAll('.ball').forEach(ball=>{const aR=bu.getBoundingClientRect(),bR=ball.getBoundingClientRect();
if(!(aR.top>bR.bottom||aR.bottom<bR.top||aR.right<bR.left||aR.left>bR.right)){
ball.remove();bu.remove();score+=10;document.getElementById('sc').innerText=score;clearInterval(m)}})},20)},400);
function sp(){if(!paused){const ball=document.createElement('div');ball.className='ball';
ball.style.left=Math.random()*370+"px";ball.style.top="-40px";w.appendChild(ball);
let f=setInterval(()=>{if(paused)return;let t=parseInt(ball.style.top);ball.style.top=(t+4)+"px";
const aR=ball.getBoundingClientRect(),bR=b.getBoundingClientRect();
if(!(aR.top>bR.bottom||aR.bottom<bR.top||aR.right<bR.left||aR.left>bR.right)){
ball.remove();clearInterval(f);lives--;if(lives<=0){
window.parent.postMessage({type:'gameComplete',score,correct:Math.floor(score/10),incorrect:2,grade:score>50?'A':'C'},'*')}}
if(t>620){clearInterval(f);ball.remove()}},30)}setTimeout(sp,spawn)}sp();
</script></body></html>`;

export const warpExplorerHTML = `
<!DOCTYPE html>
<html><head><title>Warp Explorer</title><style>
body{margin:0;background:#050505;overflow:hidden;color:#fff;font-family:monospace}
#ui{position:absolute;top:20px;left:20px;z-index:10;font-size:18px;background:rgba(0,0,0,0.5);padding:10px;border:1px solid #0ff}
canvas{display:block;margin:auto;background:radial-gradient(circle,#1b2735 0%,#090a0f 100%)}
.fuel-bar{width:200px;height:15px;border:1px solid #fff;margin-top:5px}
#fuel{width:100%;height:100%;background:#0f0;transition:width 0.3s}
</style></head><body>
<div id="ui">Gates: <span id="g">0</span>/3<br>FUEL:<div class="fuel-bar"><div id="fuel"></div></div></div>
<canvas id="c" width="600" height="700"></canvas>
<script>
const c=document.getElementById("c"),ctx=c.getContext("2d");
let fuel=100,gates=0,active=1,paused=0,won=0,ship={x:275,y:550,w:50,h:60,s:7},ast=[],wg=[],keys={};
window.onkeydown=e=>keys[e.code]=1;window.onkeyup=e=>keys[e.code]=0;
function spawn(){if(Math.random()<0.03)ast.push({x:Math.random()*(c.width-40),y:-50,w:40+Math.random()*30,h:40+Math.random()*30,s:3+Math.random()*3});
if(Math.random()<0.005&&wg.length===0&&gates<3)wg.push({x:0,y:-100,w:c.width,h:40,s:2})}
function update(){if(!active||paused||won)return;if(keys["ArrowLeft"]&&ship.x>0)ship.x-=ship.s;
if(keys["ArrowRight"]&&ship.x<c.width-ship.w)ship.x+=ship.s;fuel-=0.08;
document.getElementById("fuel").style.width=fuel+"%";if(fuel<=0)active=0;
ast.forEach((a,i)=>{a.y+=a.s;if(ship.x<a.x+a.w&&ship.x+ship.w>a.x&&ship.y<a.y+a.h&&ship.y+ship.h>a.y){
fuel-=15;ast.splice(i,1);if(fuel<=0)active=0}});
wg.forEach((g,i)=>{g.y+=g.s;if(ship.x<g.x+g.w&&ship.x+ship.w>g.x&&ship.y<g.y+g.h&&ship.y+ship.h>g.y){
paused=1;wg.splice(i,1);setTimeout(()=>{const n1=Math.floor(Math.random()*15)+2,n2=Math.floor(Math.random()*15)+2;
const ops=['+','-','*'],op=ops[Math.floor(Math.random()*ops.length)];
let cor;if(op==='+')cor=n1+n2;if(op==='-')cor=n1-n2;if(op==='*')cor=n1*n2;
const start=Date.now(),ans=prompt(\`WARP: \${n1}\${op}\${n2}?\`),time=(Date.now()-start)/1000;
const correct=parseInt(ans)===cor;
window.parent.postMessage({type:'questionAnswered',isCorrect:correct,timeSpent:time,difficulty:2,taskType:'number'},'*');
if(correct){gates++;fuel=Math.min(100,fuel+40);document.getElementById('g').innerText=gates;
if(gates>=3)won=1}else fuel-=20;paused=0},100)}});spawn();ast=ast.filter(a=>a.y<c.height)}
function draw(){ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#fff';
for(let i=0;i<10;i++)ctx.fillRect(Math.random()*c.width,Math.random()*c.height,2,2);
ctx.fillStyle='#0ff';ctx.beginPath();ctx.moveTo(ship.x+ship.w/2,ship.y);ctx.lineTo(ship.x,ship.y+ship.h);
ctx.lineTo(ship.x+ship.w,ship.y+ship.h);ctx.closePath();ctx.fill();
ctx.fillStyle='orange';ctx.fillRect(ship.x+ship.w/2-5,ship.y+ship.h,10,10+Math.random()*10);
ctx.fillStyle='#777';ast.forEach(a=>ctx.fillRect(a.x,a.y,a.w,a.h));
ctx.strokeStyle='#b0f';ctx.lineWidth=5;wg.forEach(g=>{ctx.strokeRect(g.x,g.y,g.w,g.h);
ctx.fillStyle='rgba(180,0,255,0.2)';ctx.fillRect(g.x,g.y,g.w,g.h)});
if(!active||won){ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(0,0,c.width,c.height);
ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='30px Arial';
ctx.fillText(won?'VICTORY!':'STRANDED',300,300);
setTimeout(()=>window.parent.postMessage({type:'gameComplete',score:gates*100,correct:gates,incorrect:3-gates,grade:won?'A':'C'},'*'),1000)}}
function loop(){update();draw();requestAnimationFrame(loop)}loop();
</script></body></html>`;

export const bridgeGameHTML = `
<!DOCTYPE html>
<html><head><title>Bridge Game</title><style>
body{text-align:center;background:#cceeff;font-family:Arial}
canvas{background:#87ceeb;border:2px solid #000}
#task{margin-top:10px;display:none}
button{padding:8px 15px;margin:5px;font-size:14px}
</style></head><body>
<h2>Cross the River</h2>
<canvas id="c" width="800" height="300"></canvas>
<div id="task"><p id="txt"></p><div id="opts"></div></div>
<script>
const c=document.getElementById("c"),ctx=c.getContext("2d");
let char={x:50,y:200,w:30,h:40},riverX=350,bridge=0,moving=0,task='reading',start=0,data=[];
function draw(){ctx.clearRect(0,0,800,300);ctx.fillStyle='#228B22';ctx.fillRect(0,240,800,60);
ctx.fillStyle='#1e90ff';ctx.fillRect(riverX,240,100,60);
if(bridge){ctx.fillStyle='#8b4513';ctx.fillRect(riverX,230,100,10)}
ctx.fillStyle='#ff4500';ctx.fillRect(char.x,char.y,char.w,char.h)}
function loop(){if(moving){char.x+=2;if(char.x>riverX+110)moving=0}draw();requestAnimationFrame(loop)}
function show(){document.getElementById('task').style.display='block';start=Date.now();
if(task==='reading'){document.getElementById('txt').innerText="Click 'b'";opts(['b','d','p','q'],'b')}
else{document.getElementById('txt').innerText="More dots?";opts(['●●●','●●'],'●●●')}}
function opts(o,cor){const d=document.getElementById('opts');d.innerHTML='';
o.forEach(op=>{const b=document.createElement('button');b.innerText=op;
b.onclick=()=>submit(op,cor);d.appendChild(b)})}
function submit(ch,cor){let t=(Date.now()-start)/1000,correct=ch===cor;
data.push({task,ch,correct,t});document.getElementById('task').style.display='none';
window.parent.postMessage({type:'questionAnswered',isCorrect:correct,timeSpent:t,difficulty:1,taskType:task},'*');
if(correct){bridge=1;setTimeout(()=>moving=1,500)}
if(task==='reading'){task='number';setTimeout(show,2000)}else{
window.parent.postMessage({type:'gameComplete',score:data.filter(d=>d.correct).length*50,correct:data.filter(d=>d.correct).length,incorrect:data.filter(d=>!d.correct).length,grade:data.every(d=>d.correct)?'A':'B'},'*')}}
loop();setTimeout(show,1000);
</script></body></html>`;
