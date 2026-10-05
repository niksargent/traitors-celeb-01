import {rounds,byId} from './data.js';
export const exits=rounds.filter(r=>r.eliminated).map(r=>({id:r.eliminated,episode:r.episode,label:r.label,role:byId[r.eliminated].role,name:byId[r.eliminated].short}));
export function remainingTraitors(count){return 3-exits.slice(0,count).filter(e=>e.role==='T').length;}
export const seasonReel={id:'season',name:'The season in votes',hook:'Two Traitors caught. One still there.',strap:'Watch each banishment change the game.',takeaway:'Finding one Traitor does not mean the next vote will be right.',beats:[
 {audio:'season-first-five',mode:'season',from:0,to:5,cues:[.18,.26,.34,.42,.5],seconds:15,title:'Five banishments. All Faithful.',caption:'Each card is a player the group voted out.'},
 {audio:'season-jonathan-kate',mode:'season',from:5,to:7,cues:[.18,.55],seconds:12,title:'They catch Jonathan. Then lose Kate.',caption:'A correct vote is followed by another mistake.'},
 {audio:'season-finale',mode:'season',from:7,to:9,cues:[.15,.5],seconds:13,title:'Cat goes. Then Joe goes.',caption:'Alan is the last Traitor. He wins.'}
]};

export function drawSeason(count,host){
 host.innerHTML=`<div class="season-remaining"><span>TRAITORS STILL IN THE GAME</span><div>${['alan','cat','jonathan'].map(id=>`<span class="season-token ${exits.slice(0,count).some(e=>e.id===id)?'removed':''}">${byId[id].short}</span>`).join('')}</div><strong>${remainingTraitors(count)}</strong></div><div class="season-exits">${exits.map((e,i)=>`<div class="season-exit ${i<count?'revealed':''} ${i===count-1?'latest':''} ${e.role==='T'?'caught':''}"><small>${i+1}</small><strong>${i<count?e.name:'?'}</strong><span>${i<count?(e.role==='T'?'TRAITOR':'FAITHFUL'):'TO COME'}</span></div>`).join('')}</div><p class="season-result">${count===0?'Who will they remove first?':count===9?'Joe was Faithful. Alan remains.':count===8?'Cat was a Traitor. Alan remains.':count===7?'Kate was Faithful. Two Traitors remain.':count===6?'Jonathan was a Traitor. Two remain.':`${count} Faithful${count===1?'':'s'} removed. All three Traitors remain.`}</p>`;
}
