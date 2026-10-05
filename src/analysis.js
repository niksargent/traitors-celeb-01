import {byId,rounds,players} from './data.js';
export function tally(votes) {
  return Object.entries(Object.values(votes).reduce((a,id)=>(a[id]=(a[id]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
}
export function leaders(votes) { const t=tally(votes);return t.filter(x=>x[1]===t[0]?.[1]).map(x=>x[0]); }
// Exact ballot reassignment search. Each ballot changes at most once; self votes
// are prohibited. Restricted revotes only permit the tied candidates.
export function minimumChanges(round,target,kind='win') {
  const entries=Object.entries(round.votes),base=Object.values(round.votes).filter(x=>x===target).length;
  const others=Object.fromEntries(tally(round.votes).filter(([id])=>id!==target));
  const eligible=entries.filter(([v,t])=>v!==target&&t!==target);
  const check=(counts,added)=>kind==='win'?Object.values(counts).every(n=>base+added>n):Object.values(counts).every(n=>base+added>=n);
  if(check(others,0))return 0;
  // Switching a ballot to target weakly dominates switching it anywhere else
  // when minimising changes required to make that target a (co-)leader.
  for(let k=1;k<=eligible.length;k++){
    function choose(start,left,counts){
      if(left===0)return check(counts,k);
      for(let i=start;i<=eligible.length-left;i++){
        const t=eligible[i][1];counts[t]--;
        const found=choose(i+1,left-1,counts);counts[t]++;
        if(found)return true;
      }return false;
    }
    if(choose(0,k,{...others}))return k;
  }return null;
}
export function stats(round,votes=round.votes){
  const counts=tally(votes),n=Object.keys(votes).length;
  const entropy=n?counts.reduce((s,[,v])=>s-(v/n)*Math.log2(v/n),0):0;
  const faithfulVotes=Object.fromEntries(Object.entries(votes).filter(([v])=>byId[v].role==='F'));
  const hits=Object.values(faithfulVotes).filter(t=>byId[t].role==='T').length;
  const lead=leaders(votes);
  return {counts,n,entropy,fragmentation:n>1?entropy/Math.log2(n):0,share:n?counts[0][1]/n:0,
    hits,faithfulN:Object.keys(faithfulVotes).length,faithfulVotes,leaders:lead,
    minFlip:Math.min(...round.candidates.filter(c=>lead.length>1||!lead.includes(c)).map(c=>minimumChanges({...round,votes},c)).filter(x=>x!==null))};
}
export const roundStats=rounds.map(r=>stats(r));
export function playerStats(id){
  const active=rounds.filter(r=>id in r.votes);
  const received=rounds.map(r=>Object.values(r.votes).filter(t=>t===id).length);
  const normal=active.filter(r=>!r.restricted);
  return {received,total:received.reduce((a,b)=>a+b,0),ballots:active.length,
    correct:normal.filter(r=>byId[r.votes[id]].role==='T').length,normalBallots:normal.length,
    aligned:normal.filter(r=>leaders(r.votes).includes(r.votes[id])).length,
    firstHit:normal.find(r=>byId[r.votes[id]].role==='T')?.id};
}
export const summaries=Object.fromEntries(players.map(p=>[p.id,playerStats(p.id)]));
