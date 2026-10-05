import {updateLinks,fadeLinks} from './network-transitions.js';
import {stepVoteForces,voteGroups} from './vote-forces.js';
import {players,byId,rounds} from './data.js';
import {tally} from './analysis.js';
import {scenes,archetypes} from './drama-data.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let act=0,playing=false,start=0,frame=0,filter='all',layout='gravity',selected=null,visible=true,audio=null,sound=false;
const stage=$('#constellation'),canvas=$('#network'),ctx=canvas.getContext('2d');
let w=800,h=590,dpr=1;
const nodes=players.map((p,i)=>({...p,x:400+230*Math.cos(i*2*Math.PI/19),y:285+230*Math.sin(i*2*Math.PI/19),vx:0,vy:0,tx:0,ty:0,alpha:1}));
const map=Object.fromEntries(nodes.map(n=>[n.id,n]));
let edges=[],active=[],lastTick=0,posterURL=null,roundIndex=0,groups=new Map(),motionRequested=false,physicsPaused=false;
let transitionAge=5000,departures=[];
const networkRounds=document.createElement('div');networkRounds.className='network-rounds';networkRounds.innerHTML=rounds.map((r,i)=>`<button data-network-round="${i}" aria-pressed="false">${r.label}</button>`).join('');$('.network-heading').after(networkRounds);
const freeze=document.createElement('button');freeze.id='network-freeze';freeze.className='text-button';freeze.textContent='Freeze movement';freeze.setAttribute('aria-pressed','false');$('#play-drama').after(freeze);
const color=id=>byId[id].role==='T'?'#f18068':'#d8c291';
function resize(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;if(Math.abs(w-r.width)>1){transitionAge=0;departures=[];}w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);arrange();}
function arrange(){
 const r=rounds[roundIndex];active=nodes.filter(n=>r.candidates.includes(n.id)||Object.hasOwn(r.votes,n.id));stage.style.height=Math.max(stage.clientHeight,active.length>10?600:w<500?350:440)+'px';groups=voteGroups(r.votes,w,h);
 nodes.forEach(n=>{n.live=active.includes(n);n.group=r.votes[n.id]||null;});
 const pairs=[];
 for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
  const a=active[i],b=active[j];if(a.group&&a.group===b.group&&(filter==='all'||[a,b].some(n=>n.role===(filter==='traitors'?'T':'F'))))pairs.push([a,b]);
 }
 edges=updateLinks(edges,pairs);
 $('#network-labels').innerHTML=active.map(n=>`<button class="network-person ${n.role==='T'?'is-traitor':''}" data-person="${n.id}" aria-label="${n.name}. ${r.votes[n.id]?'Voted for '+byId[r.votes[n.id]].name:'Did not vote'}. Open player record."><span>${n.short}</span><small>${r.votes[n.id]?'→ '+byId[r.votes[n.id]].short:'DID NOT VOTE'}</small></button>`).join('');
 networkRounds.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.networkRound===roundIndex));
 $('#stage-round').textContent=`ROUND ${r.label} · ${Object.keys(r.votes).length} VOTES`;
}
function setRound(i){freeze.textContent='Freeze movement';freeze.setAttribute('aria-pressed','false');if(i!==roundIndex){const previous=rounds[roundIndex];departures=i>roundIndex?active.filter(n=>!rounds[i].candidates.includes(n.id)).map(n=>({id:n.id,name:n.short,x:n.x,y:n.y,banished:rounds.slice(roundIndex,i).some(r=>r.eliminated===n.id)})):[];transitionAge=0;}roundIndex=i;motionRequested=true;physicsPaused=false;arrange();const r=rounds[i];$('#act-title').textContent=r.headline;$('#act-line').textContent=r.description;$('#act-kicker').textContent='WATCH THE VOTING GROUPS CHANGE';$('#act-reading').textContent='Players move together when they vote for the same person. A shared vote does not always mean friendship.';}
function chord(){if(!sound||!audio)return;const now=audio.currentTime;[110,164.81,act===5?207.65:220].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f/2;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.035,now+.3);g.gain.exponentialRampToValueAtTime(.0001,now+3.3);o.start(now+i*.03);o.stop(now+3.4);});}
function setAct(i,manual=false){
 act=Math.max(0,Math.min(scenes.length-1,i));roundIndex=scenes[act].round;motionRequested=true;physicsPaused=false;if(manual)pause();const s=scenes[act];selected=null;
 $('#act-kicker').textContent=s.kicker;$('#act-title').innerHTML=s.title;$('#act-line').textContent=s.line;$('#act-metric').textContent=s.metric;$('#act-unit').textContent=s.unit;$('#act-reading').textContent=s.reading;
 $('#stage-round').textContent=`ROUND ${rounds[s.round].label} · ${Object.keys(rounds[s.round].votes).length} BALLOTS`;
 $$('.scene-button').forEach((b,j)=>{b.setAttribute('aria-pressed',j===act);b.classList.toggle('passed',j<act);});
 $('.theatre').dataset.act=act;arrange();chord();
}
function pause(){playing=false;physicsPaused=true;$('#play-drama').textContent='▶ Play';$('#play-drama').setAttribute('aria-pressed','false');}
function animate(now){
 const dt=Math.min(2,(now-lastTick)/16.67||1);lastTick=now;
 if(visible&&!document.hidden){
 if(playing){const elapsed=(now-start)/10000,next=Math.min(9,Math.floor(elapsed));if(next!==roundIndex)setRound(next);$('#film-progress').style.width=Math.min(elapsed/10*100,100)+'%';if(elapsed>=10)pause();}
 ctx.globalAlpha=1;ctx.clearRect(0,0,w,h);
 const cx=w/2,cy=h*.48;
 if(!physicsPaused&&(!reduced.matches||motionRequested)){transitionAge+=dt*16.67;if(transitionAge>600){const cooling=Math.max(0,Math.min(1,(5200-transitionAge)/2000));if(cooling>0)stepVoteForces(nodes,groups,w,h,dt*cooling);else nodes.forEach(n=>{n.vx=0;n.vy=0;});}edges=fadeLinks(edges,transitionAge,dt,w<500?140:200);}
 const focus=selected?map[selected]:null;
 groups.forEach((g,id)=>{if(transitionAge<1800)return;const members=active.filter(n=>n.group===id);if(!members.length||members.some(n=>Math.hypot(n.vx,n.vy)>1))return;const x=members.reduce((sum,n)=>sum+n.x,0)/members.length,y=members.reduce((sum,n)=>sum+n.y,0)/members.length;
 const radius=Math.max(35,...members.map(n=>Math.hypot(n.x-x,n.y-y)+30));ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fillStyle='#d8c29105';ctx.fill();ctx.strokeStyle='#d8c29116';ctx.stroke();ctx.font='12px Arial';ctx.textAlign='center';ctx.fillStyle='#b6b8a3';ctx.fillText(members.length+' voted for '+byId[id].short,x,Math.max(22,y-radius-12));
 });
 edges.forEach((edge,i)=>{const {a,b,alpha}=edge;if(alpha<.008)return;ctx.globalAlpha=alpha;
  const highlight=!selected||a.id===selected||b.id===selected;
  const bend=(a.id<b.id?1:-1)*.14,dx=b.x-a.x,dy=b.y-a.y,mx=(a.x+b.x)/2-dy*bend,my=(a.y+b.y)/2+dx*bend;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(mx,my,b.x,b.y);ctx.strokeStyle=byId[a.id].role==='T'?(highlight?'#f18068ba':'#f180684f'):(highlight?'#d8c2919a':'#d8c29132');ctx.lineWidth=highlight?1.5:.8;ctx.stroke();
  const t=(physicsPaused||reduced.matches&&!motionRequested)?.58:((now/2400+i*.137)%1),u=1-t,px=u*u*a.x+2*u*t*mx+t*t*b.x,py=u*u*a.y+2*u*t*my+t*t*b.y;
  ctx.beginPath();ctx.arc(px,py,highlight?2.4:1.5,0,Math.PI*2);ctx.fillStyle=color(a.id);ctx.fill();

 });
 ctx.globalAlpha=1;
 drawDepartures();
 if(focus){const pulse=reduced.matches?0:Math.sin(now/700)*3;ctx.beginPath();ctx.arc(focus.x,focus.y,22+pulse,0,Math.PI*2);ctx.strokeStyle='#f1806840';ctx.lineWidth=1;ctx.stroke();}
 nodes.forEach(n=>{
  ctx.globalAlpha=1;const on=active.includes(n),r=selected===n.id?8:5;if(!on)return;
  if(on){const glow=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*4);glow.addColorStop(0,byId[n.id].role==='T'?'#f1806836':'#d8c29126');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(n.x,n.y,r*4,0,Math.PI*2);ctx.fill();}
  ctx.beginPath();ctx.arc(n.x,n.y,on?r:2,0,Math.PI*2);ctx.fillStyle=on?color(n.id):'#6e796b38';ctx.fill();
  const label=$(`[data-person="${n.id}"]`);if(label){label.style.transform=`translate(${n.x}px,${n.y+13}px) translateX(-50%)`;label.classList.toggle('person-selected',selected===n.id);label.style.opacity=String(ctx.globalAlpha);}
 });
 }
 frame=requestAnimationFrame(animate);
}
function drawDepartures(){
 const t=transitionAge/1000;if(t>1.8)return;
 for(const d of departures){ctx.save();ctx.globalAlpha=Math.max(0,1-t/1.8);ctx.fillStyle=color(d.id);
  if(d.banished){for(let i=0;i<28;i++){const angle=i*2.39996,travel=Math.max(0,t-.15)*(26+(i%6)*10);ctx.beginPath();ctx.arc(d.x+Math.cos(angle)*travel,d.y+Math.sin(angle)*travel,Math.max(.5,3-t),0,Math.PI*2);ctx.fill();}}
  else{ctx.beginPath();ctx.arc(d.x,d.y,5,0,Math.PI*2);ctx.fill();}
  ctx.font='13px Arial';ctx.textAlign='center';ctx.fillStyle='#eeeae0';ctx.fillText(d.name+' · '+(d.banished?'banished':'murdered'),d.x,d.y+25);ctx.restore();
 }
}
function renderDeck(){
 $('#tarot-deck').innerHTML=archetypes.map((a,i)=>`<button class="tarot-card ${byId[a.id].role==='T'?'tarot-traitor':'tarot-faithful'}" data-tarot="${a.id}" style="--card-index:${i};--card-x:${(i%3)*50}%;--card-y:${i<3?0:100}%" aria-label="${byId[a.id].name}, ${a.name}. Reveal their card."><span class="tarot-roman">${a.roman}</span><span class="tarot-role">${byId[a.id].role==='T'?'TRAITOR':'FAITHFUL'}</span><span class="tarot-art" role="img" aria-label="Symbolic tarot illustration for ${a.name}"></span><span class="tarot-label"><small>${byId[a.id].name}</small><strong>${a.name}</strong><em>${a.subtitle}</em></span><span class="tarot-reveal">TURN THE CARD <span>↗</span></span></button>`).join('');
}
let currentCard=0;
function openCard(id){
 pause();
 const idx=archetypes.findIndex(a=>a.id===id);if(idx<0){document.dispatchEvent(new CustomEvent('unseen:player',{detail:id}));return;}
 currentCard=idx;const a=archetypes[idx];pause();
 $('#tarot-content').innerHTML=`<div class="tarot-large ${byId[id].role==='T'?'tarot-traitor':'tarot-faithful'}" style="--card-x:${(idx%3)*50}%;--card-y:${idx<3?0:100}%"><span class="tarot-art"></span><span class="tarot-roman">${a.roman}</span><span class="tarot-role">${byId[a.id].role==='T'?'TRAITOR':'FAITHFUL'}</span><div class="tarot-label"><small>${byId[id].name}</small><strong>${a.name}</strong></div></div><div class="card-reading"><span class="eyebrow">WHAT HAPPENED</span><h2 id="tarot-title">${a.maxim}</h2><p>${a.reading}</p><div class="tarot-proof"><strong>${a.metric}</strong><span>${a.unit}</span></div><p class="tarot-question">${a.shadow}</p><details><summary>See the votes and sources</summary><p>${a.evidence}</p>${a.source?`<a href="${a.source}" target="_blank" rel="noreferrer">Nick’s account · Big Issue</a>`:'<button class="text-button" id="tarot-record">Read the ballot record</button>'}</details><div class="dialog-actions"><button class="primary-button" id="tarot-moment">Watch their moment</button><button class="outline-button" id="tarot-share">Share this card</button><button class="outline-button" id="tarot-save">Save card</button></div></div>`;
 if(!$('#tarot-dialog').open)$('#tarot-dialog').showModal();
}
function shareCard(){const a=archetypes[currentCard];document.dispatchEvent(new CustomEvent('unseen:share',{detail:{title:`${a.name} · ${byId[a.id].name}`,text:`${byId[a.id].name}: ${a.name}. ${a.shadow}`,params:{card:a.id}}}));}
async function saveCard(){
 const a=archetypes[currentCard],i=currentCard,img=new Image();img.src='assets/tarot-atlas.png';try{await img.decode();}catch{return;}
 await document.fonts.ready;const c=document.createElement('canvas');c.width=900;c.height=1350;const x=c.getContext('2d');x.fillStyle='#101413';x.fillRect(0,0,900,1350);
 x.drawImage(img,(i%3)*img.width/3,Math.floor(i/3)*img.height/2,img.width/3,img.height/2,175,45,550,825);
 const grad=x.createLinearGradient(0,580,0,900);grad.addColorStop(0,'#10141300');grad.addColorStop(1,'#101413');x.fillStyle=grad;x.fillRect(55,580,790,320);
 x.textAlign='center';x.fillStyle='#d8c291';x.font='22px "DM Sans",sans-serif';x.fillText(byId[a.id].name.toUpperCase(),450,880);x.fillStyle='#eeeae0';x.font='100px "Instrument Serif",Georgia';x.fillText(a.name,450,992);x.font='italic 36px "Instrument Serif",Georgia';a.maxim.replaceAll('<br>','|').split('|').forEach((s,j)=>x.fillText(s,450,1055+j*45));x.font='20px "DM Sans",sans-serif';x.fillStyle='#d8c291';x.fillText(`${a.metric} · ${a.unit}`,450,1185);x.strokeStyle=byId[a.id].role==='T'?'#f18068':'#d8c29199';x.lineWidth=byId[a.id].role==='T'?5:2;x.strokeRect(28,28,844,1294);x.font='18px "DM Sans",sans-serif';x.fillText('THE UNSEEN GAME · CELEBRITY TRAITORS UK S1',450,1250);x.font='14px "DM Sans",sans-serif';x.fillStyle='#a6afa7';x.fillText('An interpretation of the game · Full series spoilers',450,1290);
 c.toBlob(blob=>{if(!blob)return;if(posterURL)URL.revokeObjectURL(posterURL);posterURL=URL.createObjectURL(blob);$('#poster-content').innerHTML=`<img class="poster-preview" src="${posterURL}" width="900" height="1350" alt="${a.name} tarot card for ${byId[a.id].name}"><div class="dialog-actions"><a class="primary-button" href="${posterURL}" download="${a.name.toLowerCase().replaceAll(' ','-')}.png">Download your card</a><a class="outline-button" href="${posterURL}" target="_blank">Open full-size image</a></div>`;$('#poster-dialog').showModal();});
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.networkRound!==undefined){pause();setRound(+b.dataset.networkRound);}
 if(b.dataset.scene!==undefined)setAct(+b.dataset.scene,true);
 if(b.dataset.person){selected=b.dataset.person;openCard(selected);}
 if(b.dataset.tarot)openCard(b.dataset.tarot);
 if(b.dataset.lens){filter=b.dataset.lens;$$('[data-lens]').forEach(el=>el.setAttribute('aria-pressed',el===b));arrange();}
 if(b.dataset.apology){const isTrap=b.dataset.apology==='traitor';$('#apology-answer').innerHTML=`<span class="eyebrow">${isTrap?'THAT WAS NICK’S INTERPRETATION.':'JOE WAS FAITHFUL.'}</span><h3>${isTrap?'Nick suspected Joe.<br><em>Joe was innocent.</em>':'Joe was apologising.<br><em>Nick saw a clue.</em>'}</h3><p>Nick later said Joe’s apology to Cat looked like a Traitor banishing a fellow Traitor. That interpretation helped turn him against Joe.</p><p class="apology-punch">At the next vote, Nick helped banish Joe. Alan, the remaining Traitor, survived.</p><a href="https://www.bigissue.com/culture/tv/celebrity-traitors-nick-mohammed-interview/" target="_blank" rel="noreferrer">Nick’s own account · Big Issue ↗</a>`;$('#apology-answer').hidden=false;$$('[data-apology]').forEach(el=>el.setAttribute('aria-pressed',el===b));}
 switch(b.id){
 case 'play-drama':if(playing)pause();else{playing=true;start=performance.now()-roundIndex*10000;if(roundIndex===9){start=performance.now();setRound(0);}motionRequested=true;physicsPaused=false;$('#play-drama').textContent='Ⅱ Pause';b.setAttribute('aria-pressed','true');}break;
 case 'network-freeze':if(!physicsPaused){pause();freeze.textContent='Resume movement';freeze.setAttribute('aria-pressed','true');}else{physicsPaused=false;motionRequested=true;freeze.textContent='Freeze movement';freeze.setAttribute('aria-pressed','false');}break;
 case 'organise-network':pause();setRound(7);break;
 case 'drama-sound':sound=!sound;if(sound){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){sound=false;b.textContent='Sound unavailable';break;}audio??=new Audio();await audio.resume();chord();}else if(audio)await audio.suspend();b.textContent=sound?'♪ Sound on':'♪ Sound off';b.setAttribute('aria-pressed',sound);break;
 case 'share-scene':document.dispatchEvent(new CustomEvent('unseen:share',{detail:{title:'The Unseen Game',text:rounds[roundIndex].headline+' '+rounds[roundIndex].description,params:{network:roundIndex}}}));break;
 case 'tarot-moment':$('#tarot-dialog').close();document.dispatchEvent(new CustomEvent('unseen:watch',{detail:archetypes[currentCard].id}));break;
 case 'tarot-share':shareCard();break;
 case 'tarot-save':saveCard();break;
 case 'tarot-record':$('#tarot-dialog').close();document.dispatchEvent(new CustomEvent('unseen:player',{detail:archetypes[currentCard].id}));break;
 case 'draw-card':openCard(archetypes[Math.floor(Math.random()*archetypes.length)].id);break;
 }
});
function hash(){const p=new URLSearchParams(location.hash.slice(1));if(p.has('network')&&/^\d$/.test(p.get('network'))){pause();setRound(+p.get('network'));const parent=$('#theatre').closest('details');if(parent)parent.open=true;$('#theatre').scrollIntoView();}if(p.has('card')&&archetypes.some(a=>a.id===p.get('card')))openCard(p.get('card'));if(p.has('scene')&&/^\d$/.test(p.get('scene'))&&+p.get('scene')<6){setAct(+p.get('scene'),true);$('#theatre').scrollIntoView();}}
window.addEventListener('hashchange',hash);new ResizeObserver(resize).observe(stage);new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible){if(playing)pause();}},{threshold:0}).observe(stage);document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();if(audio)audio.suspend();}});
renderDeck();setRound(7);resize();frame=requestAnimationFrame(animate);hash();


document.addEventListener('unseen:tarot',e=>openCard(e.detail));

$('#organise-network').textContent='Start with the final six';$('.network-centre').hidden=true;$('.network-lenses').hidden=true;$('.theatre .scene-selector').hidden=true;$('.act-evidence').hidden=true;$('.theatre-note>span').textContent='Lines join players who voted for the same person. Select a round or press Play.';$('#play-drama').textContent='▶ Play';

canvas.setAttribute('aria-label','Moving vote groups. Lines join players who voted for the same target.');


document.addEventListener('unseen:navigate',()=>{pause();});

// One title, one key, one primary action. Extra detail is optional.
const networkHelp=document.createElement('details');networkHelp.className='network-help';networkHelp.innerHTML='<summary>How to read this</summary><p>Each group voted for the same person. Select a player for their record.</p>';
$('.network-footer').after(networkHelp);networkHelp.append($('#act-line'));
$('.network-heading').prepend($('#play-drama'));
$('#play-drama').textContent='▶ Play';
$('.network-footer').append($('#share-scene'));
