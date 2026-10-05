import {players,byId,rounds,murders,sources,reviewed} from './data.js';
import {tally,leaders,stats,roundStats,summaries,minimumChanges} from './analysis.js';
import {validateScenario} from './scenario.js';
import {playerContext} from './context.js';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const C={red:'#f18068',gold:'#d8c291',green:'#b6c8af',muted:'#a6afa7',line:'#36413a',ink:'#eeeae0',bg:'#101413'};
let view='pressure',selectedPlayer='alan',selectedRound=1,replayTimer=null,replayStep=-1;
let labIndex=9,labVotes={...rounds[9].votes},selectedVoter='nick';
let trialIndex=0,trialScore=0,trialAnswered=false,ranking='correct';
let toastTimer;
let preparedShare=null;
let allMobilePlayers=false;
const mobile=()=>matchMedia('(max-width:760px)').matches;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roleColor=id=>byId[id].role==='T'?C.red:C.green;
const names=ids=>ids.map(id=>byId[id].short).join(' & ');
const plural=(n,word)=>`${n} ${word}${n===1?'':'s'}`;
const announce=message=>{clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);};
const svg=(content,box='0 0 820 370',label='')=>`<svg viewBox="${box}" role="group" aria-label="${escapeHTML(label)}">${content}</svg>`;
function stopReplay(){clearInterval(replayTimer);replayTimer=null;replayStep=-1;$('#play-season').textContent='▶ Replay the season';}
function setView(next){stopReplay();view=next;$$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));renderScore();}
function roundAxis(y){return rounds.map((r,i)=>`<text x="${146+i*65}" y="${y}" fill="${C.muted}" font-size="11" text-anchor="middle">${r.label}</text>`).join('');}
function renderPressure(){
  if(mobile()){renderMobilePressure();return;}
  const rows=players.filter(p=>p.id!=='paloma');
  let g=`<text x="8" y="13" fill="${C.muted}" font-size="10" letter-spacing="1.5">PLAYER</text><text x="770" y="13" fill="${C.muted}" font-size="10" text-anchor="end">TOTAL</text>`;
  const maxRound=replayStep<0?9:replayStep;
  rounds.forEach((r,i)=>{if(i<=maxRound)g+=`<path d="M${146+i*65} 24V337" stroke="${C.line}" stroke-width=".5" ${i===4?'stroke-dasharray="2 4"':''}/>`;});
  rows.forEach((p,j)=>{
    const y=37+j*17.15,values=summaries[p.id].received,selected=p.id===selectedPlayer;
    const last=Math.min(p.lastRound,9,maxRound),col=roleColor(p.id);
    let curve=`M126 ${y}`,bottom=`M126 ${y}`;
    for(let i=0;i<=last;i++){
      const x=146+i*65,amp=values[i]*1.5;
      curve+=` C${x-14} ${y},${x-10} ${y-amp},${x} ${y-amp} C${x+10} ${y-amp},${x+14} ${y},${x+20} ${y}`;
      bottom+=` C${x-14} ${y},${x-10} ${y+amp*.45},${x} ${y+amp*.45} C${x+10} ${y+amp*.45},${x+14} ${y},${x+20} ${y}`;
    }
    const end=last>=0?166+last*65:126,total=values.slice(0,maxRound+1).reduce((a,b)=>a+b,0);
    // A closed area between the baseline and the pressure trace; height is vote count.
    g+=`<g class="trace-row" tabindex="0" role="button" data-player="${p.id}" aria-label="${p.name}, ${total} votes received, ${p.role==='T'?'Traitor':'Faithful'}"><title>${p.name}: ${total} votes received. ${p.result}.</title><rect class="row-hit" x="0" y="${y-12}" width="790" height="18"/><text class="trace-label" x="8" y="${y+3}" fill="${selected?C.ink:p.role==='T'?C.red:C.muted}" font-size="11" font-weight="${selected?'700':'400'}">${p.short}${p.role==='T'?' · T':''}</text><path d="${curve} L${end} ${y+2} L126 ${y+2}Z" fill="${col}" opacity="${selected?.42:.18}" class="trace-fill"/><path d="${curve}" fill="none" stroke="${col}" stroke-width="${selected?2.1:1}" opacity="${selected?1:.64}" class="trace-line"/>`;
    if(last>=0&&p.lastRound<=maxRound&&p.lastRound<9){
      const murdered=p.result.startsWith('Murdered');
      g+=murdered?`<path d="M${end-3} ${y-3}l6 6m0-6l-6 6" stroke="${col}" opacity=".65"/>`:`<circle cx="${end}" cy="${y}" r="2.6" fill="${col}"/>`;
    }
    g+=`<text x="770" y="${y+3}" fill="${selected?C.ink:C.muted}" font-size="11" text-anchor="end">${total}</text></g>`;
  });
  g+=roundAxis(356)+`<text x="8" y="356" fill="${C.muted}" font-size="10">VOTING ROUND</text>`;
  $('#score').innerHTML=svg(g,'0 0 795 370','Votes received across the season. Higher peaks mean more votes. Select a player for their record.');
  $('#chart-key').innerHTML='<span><i class="key-line"></i>Traitor</span><span><i class="key-line faithful"></i>Faithful</span><span>● Banished &nbsp; × Murdered</span><span>R = restricted revote · Paloma left before voting</span>';
  $('#chart-instruction').textContent=replayStep<0?'Select a name to follow their story.':`Round ${rounds[replayStep].label} · ${rounds[replayStep].title}`;
  renderPlayerInspector();
}
function renderMobilePressure(){
 const rows=players.filter(p=>p.id!=='paloma'&&(allMobilePlayers||['alan','cat','jonathan','david','nick','joe'].includes(p.id)));
 const height=rows.length*27+65,maxRound=replayStep<0?9:replayStep;
 let g=`<text x="2" y="14" fill="${C.muted}" font-size="10">VOTES RECEIVED</text>`;
 rows.forEach((p,j)=>{
  const y=42+j*27,selected=p.id===selectedPlayer,col=roleColor(p.id),last=Math.min(9,p.lastRound,maxRound);let path=`M93 ${y}`;
  for(let i=0;i<=last;i++){const xx=103+i*20,amp=summaries[p.id].received[i]*1.9;path+=` C${xx-6} ${y},${xx-4} ${y-amp},${xx} ${y-amp} C${xx+4} ${y-amp},${xx+6} ${y},${xx+9} ${y}`;}
  g+=`<g class="trace-row" role="button" tabindex="0" data-player="${p.id}" aria-label="${p.name}, ${summaries[p.id].total} votes received"><rect class="row-hit" x="0" y="${y-19}" width="326" height="27"/><text x="2" y="${y+4}" font-size="12" fill="${selected?C.ink:col}">${p.short}${p.role==='T'?' · T':''}</text><path d="${path}" stroke="${col}" fill="none" stroke-width="${selected?2:1.2}"/><text x="325" y="${y+4}" text-anchor="end" font-size="12" fill="${col}">${summaries[p.id].received.slice(0,maxRound+1).reduce((a,b)=>a+b,0)}</text></g>`;
 });
 rounds.forEach((r,i)=>g+=`<text x="${103+i*20}" y="${height-8}" font-size="9" text-anchor="middle" fill="${C.muted}">${r.label}</text>`);
 $('#score').innerHTML=svg(g,`0 0 330 ${height}`,'Votes received over the season; choose a player.');
 $('#chart-key').innerHTML=`<span><i class="key-line"></i>Traitor</span><span><i class="key-line faithful"></i>Faithful</span><span>R = revote</span><button class="text-button" id="all-mobile-players">${allMobilePlayers?'Show six key players':'Show all 18 players'}</button>`;
 $('#chart-instruction').textContent=replayStep<0?'Tap a name. Follow their record.':`Round ${rounds[replayStep].label} · ${rounds[replayStep].title}`;
 renderPlayerInspector();
}
const playerNotes={
 alan:'One vote from Clare in round 02. One from Joe in the final four. Seven ordinary rounds without a single vote against him.',
 david:'Eighteen votes against him, including five in the restricted revote. He reached the final three. No single round gave him enough votes to be banished.',
 joe:'Five of his nine unrestricted ballots targeted Traitors. In the final four he named Alan—and the other three named him.',
 nick:'Like Alan, Nick received just two votes. Few votes did not distinguish the winner from a Faithful.',
 cat:'One vote from Celia early on. One from Nick in round 07. Then all three remaining Faithfuls voted for her together.',
 jonathan:'Six votes against him before his final round. Six more in the round that removed him. Earlier votes against him were too few to remove him.',
 lucy:'No votes against her. Her last ballot targeted Jonathan. She was then murdered. Nobody had voted against her, but the Traitors could still remove her.',
 clare:'The only player to vote for Alan before the final four. The next round removed her. She was banished after receiving seven votes.',
 paloma:'Murdered before the first vote. There is no voting record to score.'
};
function renderPlayerInspector(){const p=byId[selectedPlayer],s=summaries[p.id];$('#inspector').innerHTML=`<span class="role-label ${p.role==='F'?'faithful':''}">${p.role==='T'?'TRAITOR':'FAITHFUL'} / ${p.id==='alan'?'WINNER':'PLAYER RECORD'}</span><h2>${p.name}</h2><span class="result-label">${p.result}</span><div class="inspector-stat" style="color:${roleColor(p.id)}">${s.total}</div><span class="metric-label">votes received</span><p>${playerNotes[p.id]||`${s.total} votes received across their time in the game. ${p.role==='F'?`${s.correct} of ${s.normalBallots} unrestricted ballots targeted a Traitor.`:'Traitors know the identities of their teammates; their ballots are not detection scores.'}`}</p><button class="text-button" data-player-evidence="${p.id}">Read the ballot record ↗</button>${playerContext[p.id]?`<details class="player-context"><summary>${playerContext[p.id].title}</summary><p>${playerContext[p.id].text}</p><a href="${playerContext[p.id].source}" target="_blank" rel="noreferrer">${playerContext[p.id].label} ↗</a></details>`:""}`;}
function renderBars(){
  const frag=view==='fragility';let g='';
  const maxRound=replayStep<0?9:replayStep;
  g+=`<text x="20" y="20" fill="${C.muted}" font-size="12">${frag?'BALLOT CHANGES TO A DIFFERENT SOLE LEADER':'FAITHFUL BALLOTS THAT TARGETED A TRAITOR'}</text>`;
  const xs=rounds.map((r,i)=>75+i*72);
  rounds.forEach((r,i)=>{
    const s=roundStats[i],v=frag?s.minFlip:s.hits/s.faithfulN,h=frag?v*47:v*205,x=xs[i],chosen=i===selectedRound;
    const fill=frag?(v===1?C.red:C.gold):(r.restricted?'#667461':C.green);
    if(i>maxRound)return;
    g+=`<g class="bar-round" role="button" tabindex="0" data-round="${i}" aria-label="Round ${r.label}: ${frag?plural(v,'ballot change'):`${s.hits} of ${s.faithfulN} Faithful votes hit Traitors`}"><title>${r.title}</title><rect class="hit" x="${x-27}" y="42" width="54" height="255" fill="${chosen?'#263026':'transparent'}"/><path d="M${x} 73V270" stroke="${C.line}" stroke-width="30" opacity=".45"/><rect x="${x-15}" y="${270-h}" width="30" height="${Math.max(2,h)}" fill="${fill}"/><text x="${x}" y="${250-h}" text-anchor="middle" fill="${C.ink}" font-size="20" font-family="Georgia">${frag?v:Math.round(v*100)+'%'}</text><text x="${x}" y="292" text-anchor="middle" fill="${C.muted}" font-size="12">${r.label}</text><text x="${x}" y="316" text-anchor="middle" fill="${r.eliminated?roleColor(r.eliminated):C.muted}" font-size="11">${r.eliminated?byId[r.eliminated].short:'Tie'}</text></g>`;
  });
  g+=`<path d="M35 270H777" stroke="${C.line}"/><text x="20" y="357" fill="${C.muted}" font-size="11">${frag?'1 = a knife edge. Tied rounds show changes to resolve the tie.':'R has only two Faithful candidates, so a correct vote was impossible.'}</text>`;
  if(mobile()){
   g='';rounds.forEach((r,i)=>{const s=roundStats[i],v=frag?s.minFlip:s.hits/s.faithfulN,x=33+(i%5)*67,y=125+Math.floor(i/5)*158,h=frag?v*19:v*76,col=frag?(v===1?C.red:C.gold):C.green;
    g+=`<g class="bar-round" role="button" tabindex="0" data-round="${i}" aria-label="Round ${r.label}, ${frag?v+' switches':s.hits+' of '+s.faithfulN+' correct ballots'}"><rect class="hit" x="${x-27}" y="${y-118}" width="54" height="147" fill="${i===selectedRound?'#263026':'transparent'}"/><path d="M${x} ${y-85}V${y}" stroke="${C.line}" stroke-width="18"/><rect x="${x-9}" y="${y-h}" width="18" height="${Math.max(2,h)}" fill="${col}"/><text x="${x}" y="${y-h-10}" text-anchor="middle" fill="${C.ink}" font-size="17">${frag?v:Math.round(v*100)+'%'}</text><text x="${x}" y="${y+20}" text-anchor="middle" fill="${C.muted}" font-size="12">${r.label}</text></g>`;
   });
   $('#score').innerHTML=svg(g,'0 0 335 320',frag?'Minimum ballot changes by round':'Faithful voting accuracy by round');
  }else $('#score').innerHTML=svg(g,'0 0 810 370',frag?'Minimum ballot changes by round':'Faithful voting accuracy by round');
  $('#chart-key').innerHTML=frag?'<span><i class="key-line"></i>One change</span><span><i class="key-line" style="background:var(--gold)"></i>Multiple changes</span><span>Recorded tally, all other ballots fixed</span>':'<span><i class="key-line faithful"></i>Faithful votes only</span><span>Traitor ballots excluded</span>';
  $('#chart-instruction').textContent='Select a round to see who voted for whom.';
  const r=rounds[selectedRound],s=roundStats[selectedRound];
  $('#inspector').innerHTML=`<span class="role-label faithful">ROUND ${r.label} / EPISODE ${r.episode}</span><h2>${frag?r.title:'Who was right?'}</h2><span class="result-label">${r.eliminated?byId[r.eliminated].short+' banished':'First vote tied'}</span><div class="inspector-stat">${frag?s.minFlip:s.hits}<small>${frag?'':' / '+s.faithfulN}</small></div><span class="metric-label">${frag?(r.index===3||r.index===4?'change to resolve the tie':'changes to reverse the leader'):'Faithful ballots on Traitors'}</span><p>${frag?r.description:r.headline+' '+r.description}</p><button class="text-button" data-round-evidence="${r.index}">Inspect these votes ↗</button>`;
}
function renderChaos(){
 const small=mobile(),height=small?320:370,width=small?335:810;
 let g=small?'':`<text x="20" y="20" fill="${C.muted}" font-size="12">HOW MANY DIFFERENT PEOPLE DID THE ROOM SUSPECT?</text>`;
 rounds.forEach((r,i)=>{
  if(replayStep>=0&&i>replayStep)return;
  const s=roundStats[i],x=small?33+(i%5)*67:75+i*72,base=small?125+Math.floor(i/5)*158:280,barH=small?80:192,bw=small?24:34;
  g+=`<g class="bar-round" role="button" tabindex="0" data-round="${i}" aria-label="Round ${r.label}: ${s.counts.length} targets among ${s.n} ballots"><rect class="hit" x="${x-27}" y="${base-barH-34}" width="54" height="${barH+65}" fill="${i===selectedRound?'#263026':'transparent'}"/><text x="${x}" y="${base-barH-13}" text-anchor="middle" font-size="${small?17:22}" fill="${C.ink}">${s.counts.length}</text>`;
  let y=base;s.counts.forEach(([id,count],j)=>{const h=count/s.n*barH;y-=h;g+=`<rect x="${x-bw/2}" y="${y}" width="${bw}" height="${Math.max(1,h-2)}" fill="${byId[id].role==='T'?C.red:C.green}" opacity="${byId[id].role==='T'?1:.9-j*.035}"><title>${byId[id].name}: ${count} of ${s.n} votes</title></rect>`;});
  g+=`<text x="${x}" y="${base+22}" text-anchor="middle" font-size="12" fill="${C.muted}">${r.label}</text></g>`;
 });
 if(!small)g+=`<text x="20" y="355" fill="${C.muted}" font-size="11">Equal-height columns. Each segment is one target’s share of that round’s ballots.</text>`;
 $('#score').innerHTML=svg(g,`0 0 ${width} ${height}`,'Vote fragmentation by round. Each segment is a target.');
 $('#chart-key').innerHTML='<span><i class="key-line"></i>Traitor target</span><span><i class="key-line faithful"></i>Faithful target</span><span>Segment height = vote share</span>';
 const r=rounds[selectedRound],s=roundStats[selectedRound];
 $('#inspector').innerHTML=`<span class="role-label faithful">ROUND ${r.label} / EPISODE ${r.episode}</span><h2>${r.index===1?'A quarter was enough.':r.title}</h2><span class="result-label">${s.n} ballots cast</span><div class="inspector-stat">${s.counts.length}</div><span class="metric-label">different people targeted</span><p>${r.description}</p><p style="margin-top:12px">Leading share: ${Math.round(s.share*100)}%. Normalised vote entropy: ${s.fragmentation.toFixed(2)} / 1.</p><button class="text-button" data-round-evidence="${r.index}">Inspect these votes ↗</button>`;
 $('#chart-instruction').textContent='Scattered votes and narrow outcomes are different kinds of tension.';
}
function renderScore(){view==='pressure'?renderPressure():view==='chaos'?renderChaos():renderBars();}
function showPlayer(id){selectedPlayer=id;setView('pressure');document.dispatchEvent(new CustomEvent('unseen:jump',{detail:'anatomy'}));}
function renderLab(){
 const r=rounds[labIndex],t=tally(labVotes),ls=leaders(labVotes),changes=Object.keys(labVotes).filter(v=>labVotes[v]!==r.votes[v]);
 const same=changes.length===0,n=Object.keys(labVotes).length;
 $('#lab-round-label').textContent=`EPISODE ${r.episode} / ${r.restricted?'RESTRICTED REVOTE':'ROUND '+r.label} / ${n} BALLOTS`;
 $('#scenario-tag').textContent=same?'RECORDED VOTE':`${plural(changes.length,'changed ballot').toUpperCase()}`;
 $('#scenario-tag').classList.toggle('changed',!same);
 const candidateList=r.candidates;
 const step=(mobile()?310:560)/candidateList.length;
 const stage=$('#ballot-stage');
 if(!$('#ballot-columns'))stage.innerHTML='<div id="board-verdict" class="board-verdict" aria-live="polite"></div><div id="ballot-columns" class="ballot-columns"></div><div id="ballot-tokens"></div>';
 $('#board-verdict').textContent=`${t.map(([,n])=>n).join('–')} · ${ls.length>1?'Tied. No sole leader.':byId[ls[0]].short+' leads.'}${same?'':' Hypothetical.'}`;
 $('#ballot-columns').style.gridTemplateColumns=`repeat(${candidateList.length},1fr)`;
 $('#ballot-columns').innerHTML=candidateList.map(id=>{const count=t.find(([pid])=>pid===id)?.[1]||0;return `<button class="ballot-target" data-target="${id}" ${id===selectedVoter?'disabled':''} aria-label="Send ${byId[selectedVoter].short}’s vote to ${byId[id].name}" style="--role-color:${roleColor(id)}"><strong>${count}</strong><span>${byId[id].short}</span><small>${byId[id].role==='T'?'TRAITOR':'FAITHFUL'}</small></button>`;}).join('');
 const tokenLayer=$('#ballot-tokens');
 $$('.ballot-token',tokenLayer).filter(el=>!(el.dataset.voter in labVotes)).forEach(el=>el.remove());
 candidateList.forEach((id,i)=>Object.entries(labVotes).filter(([,t])=>t===id).forEach(([v],j)=>{
   let token=$(`[data-voter="${v}"]`,tokenLayer);
   if(!token){token=document.createElement('button');token.className='ballot-token';token.dataset.voter=v;tokenLayer.append(token);}
   token.textContent=byId[v].short+(changes.includes(v)?' *':'');
   token.setAttribute('aria-label',`${byId[v].name} voted for ${byId[id].name}. Select this ballot.`);
   token.setAttribute('aria-pressed',v===selectedVoter);
   token.classList.toggle('changed',changes.includes(v));
   token.style.left=`${(i+.5)*100/candidateList.length}%`;
   token.style.top=`${150+j*32}px`;
   token.style.width=`${82/candidateList.length}%`;
 }));
 stage.style.height=`${Math.max(270,160+Math.max(...t.map(([,n])=>n))*32)}px`;
 $('#voter-buttons').innerHTML=Object.keys(labVotes).map(v=>`<button data-voter="${v}" aria-pressed="${v===selectedVoter}">${byId[v].short}</button>`).join('');
 if(!labVotes[selectedVoter])selectedVoter=Object.keys(labVotes)[0];
 $('#target-picker').innerHTML=`<label for="vote-target">${byId[selectedVoter].short} votes for</label><select id="vote-target">${candidateList.filter(id=>id!==selectedVoter).map(id=>`<option value="${id}" ${labVotes[selectedVoter]===id?'selected':''}>${byId[id].name}</option>`).join('')}</select><button class="text-button" id="restore-vote">Restore this ballot</button>`;
 let headline,body,tag;
 if(same){
  tag='WHAT HAPPENED';headline=labIndex===9?'Joe saw Alan.<br>The room chose Joe.':labIndex===8?'Together, the Faithful<br>had the votes.':labIndex===7?'A majority wasn’t<br>necessary.':'A tie. A revote.<br>Then chance.';
  body=labIndex===9?'Try switching Nick’s vote to Alan. It feels like the decisive move. Watch what the arithmetic actually does.':labIndex===8?'All three Faithfuls voted for Cat. Move one of those ballots to David and the Traitors’ target takes the lead.':labIndex===7?'Kate left on three of six votes. Switch one of her voters to David to reverse the result.':'David and Mark could not vote in this revote. It stayed 5–5; Mark then lost the chest tiebreak. Change one ballot to settle it.';
 }else if(ls.length>1){tag='HYPOTHETICAL / TIED';headline='You broke the verdict.<br>Not the deadlock.';body=`${names(ls)} are tied. There is no sole vote leader. ${labIndex===9?'A single Nick or David switch cannot by itself banish Alan. Another ballot change is needed for an outright lead.':'Resolving this requires the applicable tiebreak procedure; the tally alone cannot name the person banished.'}`;
 }else{const id=ls[0];tag='HYPOTHETICAL / SOLE LEADER';headline=`${byId[id].short} now has<br>the most votes.`;body=`${plural(changes.length,'ballot change')}. ${byId[id].name}, a ${byId[id].role==='T'?'Traitor':'Faithful'}, leads ${t.map(([,v])=>v).join('–')}. ${id===r.eliminated?'The recorded target still leads.':'The recorded result has been displaced.'} This changes this vote; it does not establish a different series winner.`;}
 const fVotes=Object.fromEntries(Object.entries(labVotes).filter(([v])=>byId[v].role==='F'));
 const fLeaders=leaders(fVotes);
 $('#lab-result').innerHTML=`<span class="outcome">${tag}</span><h3>${headline}</h3><div class="result-tally">${t.map(([,v])=>v).join('–')}</div><p>${body}</p><p style="margin-top:18px;font-size:12px;border-top:1px solid var(--line);padding-top:15px">Faithful-only tally: <strong>${tally(fVotes).map(([id,v])=>`${byId[id].short} ${v}`).join(' · ')}</strong>. ${fLeaders.length>1?'Still tied.':'Leader: '+names(fLeaders)+'.'} This removes ballots, not prior influence.</p><button class="text-button lab-share" id="share-lab">Share this exact scenario ↗</button>`;
}
function chooseLab(i){labIndex=i;labVotes={...rounds[i].votes};selectedVoter=i===9?'nick':Object.keys(labVotes).find(v=>byId[v].role==='F')||Object.keys(labVotes)[0];$$('[data-lab]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.lab)===i));renderLab();}
function renderGhosts(){
 $('#ghost-list').innerHTML=murders.map(m=>{const prior=rounds.slice(0,m.before).filter(r=>m.id in r.votes).at(-1),target=prior?.votes[m.id];return `<div class="ghost-row"><div class="victim">${byId[m.id].name}<small>${prior?'Last vote · round '+prior.label:'Murdered before voting'}</small></div><div class="thread" ${target?'':'style="opacity:.25"'}></div><div class="target ${target&&byId[target].role==='T'?'traitor':''}">${target?byId[target].name:'No ballot'}${target&&byId[target].role==='T'?'<small style="display:block;font-size:9px;letter-spacing:.1em">TRAITOR</small>':''}</div></div>`;}).join('');
}
function renderRanking(){
 if(ranking==='correct'){
  const list=players.filter(p=>p.role==='F').sort((a,b)=>summaries[b.id].correct-summaries[a.id].correct||summaries[b.id].normalBallots-summaries[a.id].normalBallots);
  const maximum=Math.max(...list.map(p=>summaries[p.id].total));
  $('#ranking-note').textContent='Joe found the most Traitors. David received the most accusations.';
  $('#player-ranking').classList.add('tornado-ranking');
  $('#player-ranking').innerHTML='<div class="tornado-head"><span>← Votes received</span><span>Faithful players</span><span>Votes for Traitors →</span></div>'+list.map(p=>{const s=summaries[p.id];return `<button class="tornado-row" data-rank-player="${p.id}" aria-label="${p.name}: ${s.total} votes received; ${s.correct} of ${s.normalBallots} ordinary votes targeted Traitors"><span class="tornado-half received"><i style="width:${100*s.total/maximum}%"></i><b>${s.total}</b></span><span class="tornado-name">${p.name}<small>${s.normalBallots} rounds voting</small></span><span class="tornado-half correct"><i style="width:${100*s.correct/maximum}%"></i><b>${s.correct}</b></span></button>`;}).join('')+'<p class="tornado-scale">Both sides use the same scale: one vote is the same length. Select a name for their record.</p>';
  return;
 }
 $('#player-ranking').classList.remove('tornado-ranking');
 const list=players.filter(p=>ranking==='pressure'||p.role==='F').sort((a,b)=>{const x=summaries[a.id],y=summaries[b.id];return ranking==='pressure'?y.total-x.total:y.correct-x.correct||y.normalBallots-x.normalBallots;});
 const max=Math.max(...list.map(p=>ranking==='pressure'?summaries[p.id].total:summaries[p.id].normalBallots));
 $('#ranking-note').textContent=ranking==='pressure'?'All players · includes the restricted revote':'Faithful players · restricted revote excluded';
 $('#player-ranking').innerHTML=list.map(p=>{const s=summaries[p.id],value=ranking==='pressure'?s.total:s.correct;return `<button class="rank-row ${p.role==='T'?'traitor':''}" data-rank-player="${p.id}" aria-label="${p.name}: ${ranking==='pressure'?plural(value,'vote received'):`${value} of ${s.normalBallots} votes on Traitors`}"><span class="rank-name">${p.name}${p.role==='T'?' · T':''}</span><span class="rank-bar" ${ranking==='correct'?`style="width:${100*s.normalBallots/max}%"`:''}><span style="width:${ranking==='correct'?(s.normalBallots?value/s.normalBallots*100:0):value/max*100}%"></span></span><span class="rank-value">${value}${ranking==='correct'?` <small>/ ${s.normalBallots}</small>`:''}</span></button>`;}).join('');
}
const questions=[
 {q:'Joe has 3 votes. Alan has 1. Nick switches from Joe to Alan. What happens?',options:['Alan is banished.','It becomes a 2–2 tie.','Joe still has the most votes.'],answer:1,explanation:'A switch takes one vote away and adds one to the other side. 3–1 becomes 2–2. It changes the situation, but it does not settle who leaves.'},
 {q:'Which Faithful received as few votes as Alan across the entire series?',options:['Nick Mohammed','Joe Marler','David Olusoga'],answer:0,explanation:'Nick and Alan each received two votes. One was Faithful, one was a Traitor. A nearly empty suspicion record cannot identify someone’s role.'},
 {q:'Jonathan was banished 6–1–1. Remove Alan’s and Cat’s votes against him. Who leads the Faithful-only tally?',options:['Nobody. It becomes a tie.','Nick Mohammed.','Jonathan Ross.'],answer:2,explanation:'The Faithful-only tally is Jonathan 4, Nick 1. Jonathan’s own vote for David is also removed. The other Traitors reinforced the result; their ballots were not required for that lead.'}
];
function renderTrial(){
 $('#trial-progress').innerHTML=questions.map((q,i)=>`<span class="${i<trialIndex||(i===trialIndex&&trialAnswered)?'done':''}"></span>`).join('');
 if(trialIndex>=questions.length){$('#trial-card').innerHTML=`<span class="eyebrow">YOUR VERDICT</span><div class="trial-score">${trialScore}<span style="font-size:35px"> / 3</span></div><h3>${trialScore===3?'Three out of three.':trialScore===2?'One blind spot left.':'The game has another layer.'}</h3><p>Three moments from the voting record. Send the same test to someone who watched with you.</p><button class="trial-next" id="share-trial">Challenge a friend</button><button class="trial-share" id="restart-trial">Try again</button>`;return;}
 const q=questions[trialIndex];
 $('#trial-card').innerHTML=`<span class="eyebrow">QUESTION ${trialIndex+1} / 3</span><h3>${q.q}</h3><div class="trial-options">${q.options.map((a,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)} &nbsp; ${a}</button>`).join('')}</div><div id="trial-feedback"></div>`;
}
function answerTrial(answer){if(trialAnswered)return;trialAnswered=true;const q=questions[trialIndex];if(answer===q.answer)trialScore++;$$('[data-answer]').forEach(b=>{b.disabled=true;const i=+b.dataset.answer;if(i===q.answer)b.classList.add('correct');else if(i===answer)b.classList.add('incorrect');});$('#trial-feedback').innerHTML=`<p class="trial-explanation"><strong>${answer===q.answer?'Exactly.':'Here’s the catch.'}</strong> ${q.explanation}</p><button class="trial-next" id="next-question">${trialIndex===2?'See your result':'Next question'}</button>`;$('#trial-progress').children[trialIndex].classList.add('done');}
function openDialog(id){const d=$(id);if(!d.open)d.showModal();}
function renderMethod(){
 $('#method-content').innerHTML=`<p>Every number here starts with a recorded ballot from the first UK Celebrity Traitors (2025). This is an independent reconstruction, reviewed ${reviewed}. It is not an official BBC dataset.</p><h3>The source record</h3><ul>${sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noreferrer">${s.name}</a></li>`).join('')}</ul><p>The player-to-target ballots, eliminations and finale tally were manually cross-checked between these two public compilations. They may share underlying sources; agreement is not an independent broadcast audit. We have not watched and timestamped every ballot.</p><h3>What is counted</h3><p>103 ballots across nine unrestricted voting rounds and one restricted revote. This includes the final-four banishment vote. Decisions to continue or end the game are excluded. The first vote spans episodes 2–3; the tied vote and its resolution span episodes 5–6. Round numbers avoid conflating these with broadcast episodes.</p><details><summary>Suspicion traces</summary><p>The height of a peak is the number of votes received in that round. The curved joins are a visual guide, not observations between rounds. A flat trace means no ballot targeted that player, not that nobody suspected them. Paloma was murdered before the first ballot and is omitted from the trace.</p></details><details><summary>Knife edges and hypothetical votes</summary><p>We enumerate legal switches of recorded ballots: no self-voting, and only David or Mark in the restricted revote. The minimum is the fewest switches that would give another player a sole lead. For already-tied rounds it is the fewest switches to resolve the tie. A tie is not a banishment. All unedited votes are held fixed; later events are not simulated.</p></details><details><summary>Accuracy and opportunity</summary><p>Only Faithful ballots count towards detection. The target must actually be a Traitor at that point. This series has three original Traitors and no recruitment. The restricted revote had two Faithful candidates, so it is excluded from player accuracy totals but displayed explicitly in the round chart. Percentages do not establish skill: sample sizes, survival, available candidates and strategy all differ.</p></details><details><summary>Murder traces and Faithful-only tallies</summary><p>A murder trace shows the victim’s latest actual ballot before being removed. It does not establish a motive for the murder. Faithful-only tallies remove Traitor ballots arithmetically; they cannot remove influence from the preceding discussion. Neither feature estimates what would have happened in an alternate series.</p></details><details><summary>The full voting ledger</summary><div class="ledger-scroll"><table><thead><tr><th>Voter</th>${rounds.map(r=>`<th>${r.label}</th>`).join('')}</tr></thead><tbody>${players.map(p=>`<tr><th>${p.name}</th>${rounds.map(r=>`<td>${r.votes[p.id]?byId[r.votes[p.id]].short:'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>— means no ballot: either absent or ineligible. R is the restricted revote; David and Mark could not vote. Mark then lost the chest tiebreak.</p></details><h3>What the voting record cannot tell us</h3><p>Votes do not read minds. Agreement does not prove an alliance, an early target does not prove influence, and a correct vote does not prove a sound reason. The public edit does not reveal every conversation. No trust scores, lie-detection claims or invented win probabilities are used.</p><div class="dialog-actions"><button class="outline-button" id="download-data">Download the ballot data</button></div><p style="margin-top:20px;font-size:12px">Data attribution: Wikipedia contributors and The Traitors Wiki contributors, linked above. Public factual records transcribed for original analysis. No broadcast footage, contestant photos or cloned voices are used.</p>`;
}
const stories={
 blind:{number:'2',title:'The room barely<br>touched the winner.',body:'Alan received two votes across 103 recorded ballots. Clare voted for him in round 02. Joe voted for him in the final four. In every other round, Alan received none.',evidence:'Nick also received exactly two votes. Low voting pressure describes both a winning Traitor and a losing Faithful. It is a survival pattern, not a role detector.',action:'Follow Alan’s trace',player:'alan'},
 wrong:{number:'5',title:'Agreement came<br>before accuracy.',body:'Niko, Tameka, Clare, Mark and Stephen: the first five banishments all removed Faithfuls. Mark’s exit followed a tied revote and a chest tiebreak, rather than a majority verdict.',evidence:'The initial Niko vote had ten ballots against him and no ballot on a Traitor. The room’s strongest early consensus was completely wrong.',action:'See the accuracy view',view:'accuracy'},
 hunter:{number:'5 / 9',title:'Joe found Traitors.<br>Then the others voted him out.',body:'Joe Marler cast five correct ballots in nine unrestricted rounds: Jonathan three times, then Cat, then Alan. That is the highest count of correct ballots among Faithful players in this series.',evidence:'In the final four, his vote for Alan faced three votes against him. A correct judgement needs enough supporting votes to change an outcome.',action:'Change the final vote',lab:9}
};
let currentStory='blind';
function openStory(id){const s=stories[id];currentStory=id;$('#story-content').innerHTML=`<div class="story-number">${s.number}</div><h2 id="story-title">${s.title}</h2><p>${s.body}</p><div class="story-evidence"><p>${s.evidence}</p></div><div class="dialog-actions"><button class="primary-button" id="story-explore">${s.action}</button><button class="outline-button" id="share-story">Share this finding</button><button class="outline-button" id="poster-story">Save a poster</button></div>`;openDialog('#story-dialog');}
function openPlayerEvidence(id){const p=byId[id],s=summaries[id];$('#story-content').innerHTML=`<span class="eyebrow">${p.role==='T'?'TRAITOR':'FAITHFUL'} / ${escapeHTML(p.result)}</span><h2 id="story-title">${p.name}</h2><p>${playerNotes[id]||`${s.total} votes received. ${s.ballots} ballots cast.`}</p><table><thead><tr><th>Round</th><th>Voted for</th><th>Received</th></tr></thead><tbody>${rounds.filter(r=>r.index<=p.lastRound).map(r=>`<tr><td>${r.label} · ep ${r.episode}</td><td>${r.votes[id]?byId[r.votes[id]].name:'Ineligible'}</td><td>${s.received[r.index]}</td></tr>`).join('')}</tbody></table><div class="dialog-actions"><button class="outline-button" data-show-player="${id}">Show their season trace</button></div>`;openDialog('#story-dialog');}
function openRoundEvidence(i){const r=rounds[i];$('#story-content').innerHTML=`<span class="eyebrow">ROUND ${r.label} · EPISODE ${r.episode}</span><h2 id="story-title">${r.headline}</h2><p>${r.description}</p><table><thead><tr><th>Voter</th><th>Target</th></tr></thead><tbody>${Object.entries(r.votes).map(([v,t])=>`<tr><td>${byId[v].name}${byId[v].role==='T'?' · T':''}</td><td style="color:${roleColor(t)}">${byId[t].name}</td></tr>`).join('')}</tbody></table><p>Minimum legal changes to a different sole leader${r.restricted?' (or to resolve the tie)':''}: ${roundStats[i].minFlip}.</p>`;openDialog('#story-dialog');}
function makeURL(params){const url=new URL(location.href);url.hash=new URLSearchParams(params).toString();return url.href;}
function share(title,text,params){
 const url=makeURL(params);preparedShare={title,text,url};
 $('#share-caption').textContent=text;$('#share-url').value=url;
 $('#native-share').hidden=!navigator.share;
 $('#local-share-note').textContent=['localhost','127.0.0.1'].includes(location.hostname)?'This is a local preview link. Once published, these same controls produce public links.':'';
 openDialog('#share-dialog');
}
async function copyShare(){try{await navigator.clipboard.writeText(preparedShare.url);announce('Link copied.');}catch{$('#share-url').select();const ok=document.execCommand('copy');announce(ok?'Link copied.':'Select and copy the link above.');}}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function exportData(){const rows=['round,episode,voter,voter_role,target,target_role,restricted_revote'];rounds.forEach(r=>Object.entries(r.votes).forEach(([v,t])=>rows.push([r.label,r.episode,byId[v].name,byId[v].role,byId[t].name,byId[t].role,r.restricted].join(','))));downloadBlob(new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'}),'celebrity-traitors-uk-s1-ballots.csv');announce('103 ballots exported.');}
async function exportPoster(kind='season'){
 await document.fonts.ready;
 const c=document.createElement('canvas');c.width=1200;c.height=1500;const x=c.getContext('2d');
 x.fillStyle=C.bg;x.fillRect(0,0,1200,1500);
 x.strokeStyle=C.line;x.strokeRect(35,35,1130,1430);
 const text=(s,px,y,font,color=C.ink)=>{x.font=font;x.fillStyle=color;x.fillText(s,px,y);};
 text('THE UNSEEN GAME',75,105,'600 24px "DM Sans",sans-serif',C.gold);
 text('CELEBRITY TRAITORS · UK SERIES 1 · SPOILERS',75,145,'16px "DM Sans",sans-serif',C.muted);
 const story=stories[kind];
 if(story){
  text(story.number,70,410,'240px "Instrument Serif",Georgia',C.red);
  story.title.replaceAll('<br>','|').split('|').forEach((line,i)=>text(line,75,515+i*78,'70px "Instrument Serif",Georgia'));
  let y=760;x.font='27px "DM Sans",sans-serif';let line='';for(const word of story.body.split(' ')){if(x.measureText(line+word).width>1030){text(line.trim(),75,y,'27px "DM Sans",sans-serif',C.green);y+=43;line='';}line+=word+' ';}text(line.trim(),75,y,'27px "DM Sans",sans-serif',C.green);
  const q=kind==='hunter'?'Being right needs enough votes.':kind==='wrong'?'Ten players voted for Niko. He was Faithful.':'Only Clare and Joe ever voted for Alan.';
  text(q,75,1220,'45px "Instrument Serif",Georgia',C.gold);
 }else{
  text('19 players.',70,280,'120px "Instrument Serif",Georgia');text('One blind spot.',70,397,'italic 120px "Instrument Serif",Georgia',C.red);
  text('VOTES RECEIVED · EACH PEAK IS A ROUND',75,480,'17px "DM Sans",sans-serif',C.muted);
  players.filter(p=>p.id!=='paloma').forEach((p,j)=>{const y=535+j*32,col=roleColor(p.id);text(p.short,75,y+5,'18px "DM Sans",sans-serif',col);x.strokeStyle=col;x.lineWidth=p.id==='alan'?3:1.4;x.beginPath();x.moveTo(255,y);for(let i=0;i<=Math.min(p.lastRound,9);i++){const xx=270+i*78,amp=summaries[p.id].received[i]*2.6;x.bezierCurveTo(xx-15,y,xx-10,y-amp,xx,y-amp);x.bezierCurveTo(xx+10,y-amp,xx+15,y,xx+22,y);}x.stroke();text(String(summaries[p.id].total),1090,y+5,'18px "DM Sans",sans-serif',col);});
  text('Alan received 2 votes. David received 18.',75,1210,'48px "Instrument Serif",Georgia',C.gold);
  rounds.forEach((r,i)=>text(r.label,260+i*78,1140,'17px "DM Sans",sans-serif',C.muted));
  text('Both reached the final three. Only one was a Traitor.',75,1260,'24px "DM Sans",sans-serif',C.muted);
  text('R = restricted revote · Paloma was murdered before any vote.',75,1300,'17px "DM Sans",sans-serif',C.muted);
 }
 text('103 ballots · Includes the restricted revote · Original analysis',75,1360,'17px "DM Sans",sans-serif',C.muted);
 text('Sources: Wikipedia & The Traitors Wiki voting histories',75,1390,'17px "DM Sans",sans-serif',C.muted);
 c.toBlob(blob=>{if(blob){
  const previous=$('#poster-content img')?.src;if(previous?.startsWith('blob:'))URL.revokeObjectURL(previous);
  const url=URL.createObjectURL(blob);
  $('#poster-content').innerHTML=`<img class="poster-preview" src="${url}" alt="${story?story.title.replaceAll('<br>',' '):'Season poster showing every player’s suspicion trace, with Alan’s two votes highlighted.'}" width="1200" height="1500"><div class="dialog-actions"><a class="primary-button" href="${url}" download="the-unseen-game-${kind}.png">Download PNG</a><a class="outline-button" href="${url}" target="_blank" rel="noopener">Open full-size image</a></div><p style="font-size:12px;margin-top:15px">1200 × 1500 · Sources included. If your browser doesn’t save the file, open the full-size image and use Save Image.</p>`;
  openDialog('#poster-dialog');
 }else announce('Poster export failed. Please try again.');},'image/png');
}
function loadHash(){
 const p=new URLSearchParams(location.hash.slice(1));
 if(p.has('story')&&Object.hasOwn(stories,p.get('story')))openStory(p.get('story'));
 if(p.has('player')&&Object.hasOwn(byId,p.get('player'))){selectedPlayer=p.get('player');setView('pressure');}
 if(p.get('lab')&&['4','7','8','9'].includes(p.get('lab'))){chooseLab(Number(p.get('lab')));const raw=p.get('votes');if(raw){for(const entry of raw.split(',')){const [v,t]=entry.split(':');if(Object.hasOwn(labVotes,v)&&rounds[labIndex].candidates.includes(t)&&v!==t)labVotes[v]=t;}renderLab();}setTimeout(()=>$('#ballot-lab').scrollIntoView(),100);}
 if(p.get('trial')==='1')setTimeout(()=>$('#instinct').scrollIntoView(),100);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button,a,[role="button"]');if(!b)return;
 if(b.dataset.view)setView(b.dataset.view);
 if(b.dataset.player){selectedPlayer=b.dataset.player;renderScore();}
 if(b.dataset.round){selectedRound=+b.dataset.round;renderScore();}
 if(b.dataset.lab)chooseLab(+b.dataset.lab);
 if(b.dataset.voter){selectedVoter=b.dataset.voter;renderLab();}
 if(b.dataset.target&&b.dataset.target!==selectedVoter){labVotes[selectedVoter]=b.dataset.target;renderLab();}
 if(b.dataset.story)openStory(b.dataset.story);
 if(b.hasAttribute('data-open-method'))openDialog('#method-dialog');
 if(b.hasAttribute('data-close-dialog'))b.closest('dialog').close();
 if(b.dataset.playerEvidence)openPlayerEvidence(b.dataset.playerEvidence);
 if(b.dataset.roundEvidence)openRoundEvidence(+b.dataset.roundEvidence);
 if(b.dataset.rankPlayer)openPlayerEvidence(b.dataset.rankPlayer);
 if(b.dataset.showPlayer){$('#story-dialog').close();showPlayer(b.dataset.showPlayer);}
 if(b.dataset.ranking){ranking=b.dataset.ranking;$$('[data-ranking]').forEach(el=>el.setAttribute('aria-pressed',el===b));renderRanking();}
 if(b.hasAttribute('data-answer'))answerTrial(+b.dataset.answer);
 switch(b.id){
  case 'copy-share':copyShare();break;
  case 'native-share':navigator.share(preparedShare).catch(e=>{if(e.name!=='AbortError')announce('Use Copy link to share this view.');});break;
  case 'all-mobile-players':allMobilePlayers=!allMobilePlayers;renderScore();break;
  case 'reset-lab':chooseLab(labIndex);announce('Original ballots restored.');break;
  case 'restore-vote':labVotes[selectedVoter]=rounds[labIndex].votes[selectedVoter];renderLab();break;
  case 'ghost-toggle':{const hide=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',hide);b.textContent=hide?'Bring their votes back':'Hide the murdered players';$$('.ghost-row').forEach(el=>el.classList.toggle('removed',hide));break;}
  case 'next-question':trialIndex++;trialAnswered=false;renderTrial();break;
  case 'restart-trial':trialIndex=0;trialScore=0;trialAnswered=false;renderTrial();break;
  case 'share-trial':share('Put your instincts on trial',`I scored ${trialScore}/3 on The Unseen Game. Three moments from Celebrity Traitors. Can you see the machinery?`,{trial:1});break;
  case 'share-season':share('The Unseen Game','19 players. 103 ballots. Alan received only two votes. See the hidden shape of Celebrity Traitors.',{});break;
  case 'share-lab':share('Change a vote',`I changed ${Object.keys(labVotes).filter(v=>labVotes[v]!==rounds[labIndex].votes[v]).length} ballots in Celebrity Traitors. Try this exact scenario.`,{lab:labIndex,votes:Object.entries(labVotes).filter(([v,t])=>rounds[labIndex].votes[v]!==t).map(([v,t])=>`${v}:${t}`).join(',')});break;
  case 'share-story':share('The Unseen Game',stories[currentStory].body,{story:currentStory});break;
  case 'download-poster':exportPoster();break;
  case 'poster-story':exportPoster(currentStory);break;
  case 'download-data':exportData();break;
  case 'story-explore':{const s=stories[currentStory];$('#story-dialog').close();if(s.player)showPlayer(s.player);else if(s.view){setView(s.view);$('#anatomy').scrollIntoView({behavior:'smooth'});}else{chooseLab(s.lab);$('#ballot-lab').scrollIntoView({behavior:'smooth'});}break;}
  case 'play-season':{
   if(replayTimer){stopReplay();renderScore();break;}
   replayStep=0;$('#play-season').textContent='■ Stop replay';renderScore();
   replayTimer=setInterval(()=>{replayStep++;if(replayStep>9){stopReplay();renderScore();return;}if(view!=='pressure')selectedRound=replayStep;renderScore();},1400);break;
  }
 }
});
document.addEventListener('change',e=>{if(e.target.id==='vote-target'){labVotes[selectedVoter]=e.target.value;renderLab();$('#vote-target').focus();}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[role="button"]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
window.addEventListener('hashchange',loadHash);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&replayTimer){stopReplay();renderScore();}});
matchMedia('(max-width:760px)').addEventListener('change',()=>{renderScore();renderLab();});
renderScore();renderLab();renderGhosts();renderRanking();renderTrial();renderMethod();loadHash();
document.addEventListener('unseen:player',e=>openPlayerEvidence(e.detail));
document.addEventListener('unseen:share',e=>share(e.detail.title,e.detail.text,e.detail.params));
// Optional agent access to the same public evidence and reversible ballot board.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'read_vote_record',title:'Read the voting record',description:'Read the public Celebrity Traitors UK series 1 ballots and computed round measures. Makes no changes.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({sources,rounds:rounds.map((r,i)=>({id:r.id,label:r.label,episode:r.episode,votes:r.votes,candidates:r.candidates,restricted:r.restricted,eliminated:r.eliminated,minimumChanges:roundStats[i].minFlip})),players})});
 register({name:'stage_vote_scenario',title:'Stage a hypothetical ballot',description:'Reset and stage a legal hypothetical vote on the visible ballot board. All other ballots stay fixed. Does not predict subsequent events or share anything.',inputSchema:{type:'object',properties:{roundIndex:{type:'integer',enum:[4,7,8,9]},changes:{type:'object',additionalProperties:{type:'string'}}},required:['roundIndex'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{const scenario=validateScenario(input);chooseLab(scenario.index);labVotes=scenario.votes;renderLab();$('#ballot-lab').scrollIntoView({behavior:'smooth'});return {roundIndex:labIndex,votes:labVotes,tally:tally(labVotes),leaders:leaders(labVotes),hypothetical:true};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
