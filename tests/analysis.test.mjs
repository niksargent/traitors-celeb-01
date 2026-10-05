import test from 'node:test';
import assert from 'node:assert/strict';
import {players,byId,rounds,murders} from '../src/data.js';
import {tally,leaders,minimumChanges,roundStats,summaries} from '../src/analysis.js';
import {validateScenario} from '../src/scenario.js';

test('all 103 source ballots reconcile to the published round tallies',()=>{
 assert.equal(rounds.reduce((n,r)=>n+Object.keys(r.votes).length,0),103);
 for(const r of rounds){
  assert.deepEqual(tally(r.votes).map(([,v])=>v),r.expected,r.id);
  for(const [v,t] of Object.entries(r.votes)){
   assert.ok(byId[v]&&byId[t]);assert.notEqual(v,t,'no self votes');
   assert.ok(r.candidates.includes(t),`${r.id}: eligible target ${t}`);
   assert.ok(byId[v].lastRound>=r.index,`${r.id}: present voter ${v}`);
  }
  if(r.restricted){assert.equal(r.votes.david,undefined);assert.equal(r.votes.mark,undefined);}
  else assert.equal(Object.keys(r.votes).length,r.candidates.length);
 }
});
test('headline findings come from the ledger',()=>{
 assert.equal(summaries.alan.total,2);assert.equal(summaries.nick.total,2);assert.equal(summaries.david.total,18);
 assert.deepEqual(rounds.flatMap(r=>Object.entries(r.votes).filter(([,t])=>t==='alan').map(([v])=>v)),['clare','joe']);
 assert.equal(summaries.joe.correct,5);assert.equal(summaries.joe.normalBallots,9);
 assert.equal(Math.max(...players.filter(p=>p.role==='F').map(p=>summaries[p.id].correct)),5);
 assert.deepEqual(rounds.filter(r=>r.eliminated).slice(0,5).map(r=>byId[r.eliminated].role),['F','F','F','F','F']);
 const lastTargets=murders.map(m=>rounds.slice(0,m.before).filter(r=>m.id in r.votes).at(-1)?.votes[m.id]);
 assert.equal(lastTargets.filter(t=>t&&byId[t].role==='T').length,3);
 assert.equal(lastTargets.filter(t=>!t).length,1);
});
test('final four: one switch ties, two reverse; no invented win',()=>{
 const r=rounds[9];assert.equal(minimumChanges(r,'alan','tie'),1);assert.equal(minimumChanges(r,'alan'),2);
 const v={...r.votes,nick:'alan'};assert.deepEqual(leaders(v),['alan','joe']);
 v.david='alan';assert.deepEqual(leaders(v),['alan']);
});
test('knife edges honour restricted voters and tied rounds',()=>{
 assert.deepEqual(roundStats.map(s=>s.minFlip),[4,2,3,1,1,2,3,1,1,2]);
 assert.equal(minimumChanges(rounds[4],'david'),1);assert.equal(minimumChanges(rounds[4],'mark'),1);
 assert.equal(minimumChanges(rounds[8],'david'),1);
 assert.equal(minimumChanges(rounds[7],'david'),1);
});
test('Faithful-only tallies remove all Traitor voters, not only their teammates',()=>{
 assert.deepEqual(tally(roundStats[6].faithfulVotes),[['jonathan',4],['nick',1]]);
 assert.equal(roundStats[8].hits,3);assert.equal(roundStats[8].faithfulN,3);
 assert.equal(roundStats[0].hits,0);
});
test('exact switch calculation agrees with independent exhaustive oracle',()=>{
 // Enumerate every legal complete ballot configuration for the actual small endgames.
 for(const r of [rounds[7],rounds[8],rounds[9],rounds[4]]){
  const voters=Object.keys(r.votes),best={};r.candidates.forEach(t=>best[t]=Infinity);
  function search(i,votes,cost){
   if(i===voters.length){const lead=leaders(votes);if(lead.length===1)best[lead[0]]=Math.min(best[lead[0]],cost);return;}
   const voter=voters[i];for(const target of r.candidates){if(target===voter)continue;votes[voter]=target;search(i+1,votes,cost+Number(target!==r.votes[voter]));}
  }
  search(0,{},0);
  for(const target of r.candidates)assert.equal(minimumChanges(r,target),best[target]===Infinity?null:best[target],`${r.id}:${target}`);
 }
});
test('fragmentation separates concentrated camps from a dispersed room',()=>{
 assert.ok(roundStats[1].fragmentation>roundStats[4].fragmentation);
 assert.ok(roundStats.every(s=>s.fragmentation>=0&&s.fragmentation<=1));
});
test('scenario validation rejects illegal changes before staging',()=>{
 assert.deepEqual(leaders(validateScenario({roundIndex:9,changes:{nick:'alan'}}).votes),['alan','joe']);
 assert.throws(()=>validateScenario({roundIndex:9,changes:{alan:'alan'}}));
 assert.throws(()=>validateScenario({roundIndex:4,changes:{david:'mark'}}));
 assert.throws(()=>validateScenario({roundIndex:4,changes:{nick:'cat'}}));
 assert.throws(()=>validateScenario({roundIndex:2}));
 assert.equal(rounds[9].votes.nick,'joe');
});
import {coalitionChanges,votingPairs,films} from '../src/relationships.js';
test('final coalition fractures into two votes against a former co-voter',()=>{
 const c=coalitionChanges(8,9);
 assert.deepEqual(c.turned,[['david','joe'],['nick','joe']]);
 assert.ok(c.held.some(p=>p.includes('david')&&p.includes('nick')));
 assert.equal(c.broken.length,2);
 assert.equal(c.joined.length,2);
 assert.equal(votingPairs(8).filter(p=>p.every(id=>byId[id].role==='F')).length,3);
});
test('Cat changes from voting with Jonathan to voting against him',()=>{
 assert.equal(rounds[5].votes.cat,rounds[5].votes.jonathan);
 assert.ok(coalitionChanges(5,6).turned.some(([a,b])=>a==='cat'&&b==='jonathan'));
 assert.equal(Object.entries(rounds[6].votes).filter(([v,t])=>byId[v].role==='F'&&t==='jonathan').length,4);
});
test('every film has positions for the active cast and real ballot references',()=>{
 for(const film of films)for(const beat of film.beats){
  assert.ok(rounds[beat.round]);
  for(const id of film.cast){assert.ok(byId[id]);assert.ok(beat.positions[id]);}
  for(const id of beat.focus)assert.ok(film.cast.includes(id));
 }
});
import {coverRounds,teamRounds,winnerBallots} from '../src/reveal-data.js';
test('the company film preserves every ordinary Alan ballot and companion',()=>{
 assert.equal(coverRounds.length,9);
 for(const scene of coverRounds){const actual=rounds.find(r=>r.label===scene.label);assert.equal(scene.target,actual.votes.alan);assert.ok(scene.companions.length>0);assert.deepEqual(scene.companions,Object.keys(actual.votes).filter(v=>v!=='alan'&&actual.votes[v]===actual.votes.alan));}
 assert.deepEqual(coverRounds.at(-1).companions,['david','nick']);
});
test('the hidden-team film has no unanimous original-Traitor ballot',()=>{
 assert.equal(teamRounds.length,6);assert.ok(teamRounds.every(r=>new Set(r.targets).size>1));
});
test('winner lights represent 55 individual ballots with exactly three isolated votes',()=>{
 assert.equal(winnerBallots.length,5);assert.equal(winnerBallots.flatMap(w=>w.ballots).length,55);
 assert.deepEqual(winnerBallots.map(w=>[w.id,w.ballots.filter(b=>!b.company).length]),[['aaron',1],['hannah',0],['meryl',1],['harry',1],['alan',0]]);
});
import {storyFrames,frameVotes} from '../src/story-scenes.js';
test('new story scenes keep real vote targets and the murder order',()=>{
 assert.deepEqual(frameVotes(storyFrames.agreement),[['joe','cat'],['david','cat'],['nick','cat']]);
 assert.deepEqual(frameVotes(storyFrames.switch),[['alan','joe'],['david','joe'],['nick','joe']]);
 assert.deepEqual(frameVotes(storyFrames.joeOut),[['joe','alan']]);
 assert.equal(frameVotes(storyFrames.jonathanOut).length,6);
 assert.ok(frameVotes(storyFrames.jonathanOut).every(([,target])=>target==='jonathan'));
 for(const frame of Object.values(storyFrames))for(const [v,t]of frameVotes(frame)){
  assert.ok(frame.positions[v]);assert.ok(frame.positions[t]);
 }
 assert.ok(byId.ruth.lastRound<storyFrames.lucy.round);
 assert.ok(byId.lucy.lastRound<storyFrames.jonathanOut.round);
});
import {exits,remainingTraitors} from '../src/season-sequence.js';
test('season sequence includes the chest tiebreak and ends with one Traitor',()=>{
 assert.deepEqual(exits.map(e=>e.id),['niko','tameka','clare','mark','stephen','jonathan','kate','cat','joe']);
 assert.deepEqual(Array.from({length:10},(_,i)=>remainingTraitors(i)),[3,3,3,3,3,3,2,2,1,1]);
});
import {storyOrder,nextStoryIndex} from '../src/story-route.js';
import {reels} from '../src/reveal-data.js';
test('guided story route visits every film once and ends without a loop',()=>{
 const seen=[];let index=reels.findIndex(r=>r.id===storyOrder[0]);
 while(index>=0){assert.ok(!seen.includes(reels[index].id));seen.push(reels[index].id);index=nextStoryIndex(reels,index);}
 assert.deepEqual(seen,storyOrder);assert.equal(new Set(seen).size,5);assert.ok(!seen.includes('isolation'));
});
import {stepVoteForces,voteGroups} from '../src/vote-forces.js';
test('vote forces preserve motion and settle changed groups within the stage',()=>{
 const votes=rounds[8].votes,nodes=Object.keys(votes).map((id,i)=>({id,group:votes[id],live:true,x:80+i*110,y:120+i*30,vx:0,vy:0}));
 const groups=voteGroups(votes,800,590);
 for(let i=0;i<700;i++)stepVoteForces(nodes,groups,800,590);
 const avg=ids=>{const ns=nodes.filter(n=>ids.includes(n.id));return ns.reduce((s,n)=>s+n.x,0)/ns.length;};
 assert.ok(Math.abs(avg(['joe','nick','david'])-avg(['alan','cat']))>200);
 const joe=nodes.find(n=>n.id==='joe'),oldX=joe.x;nodes.forEach(n=>n.group=rounds[9].votes[n.id]||null);
 stepVoteForces(nodes,voteGroups(rounds[9].votes,800,590),800,590);
 assert.ok(Math.abs(joe.x-oldX)<=5); // No jump to a new preset position.
 for(let i=0;i<700;i++)stepVoteForces(nodes,voteGroups(rounds[9].votes,800,590),800,590);
 assert.ok(nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)&&n.x>=55&&n.x<=745&&n.y>=48&&n.y<=525));
});
import {updateLinks,fadeLinks} from '../src/network-transitions.js';
test('network links persist, fade away, or wait for nearby settled players',()=>{
 const a={id:'a',x:0,y:0,vx:0,vy:0},b={id:'b',x:50,y:0,vx:0,vy:0},c={id:'c',x:800,y:0,vx:0,vy:0};
 let links=updateLinks([{a,b,alpha:1,wanted:true}],[[a,b],[b,c]]);
 fadeLinks(links,1000,1,180);assert.equal(links[0].alpha,1);assert.equal(links[1].alpha,0);
 c.x=100;fadeLinks(links,1000,1,180);assert.ok(links[1].alpha>0&&links[1].alpha<.1);
 links=updateLinks(links,[[b,c]]);fadeLinks(links,0,1,180);assert.ok(links.find(e=>e.a===a).alpha<1);
});

import {networkStories} from '../src/network-stories.js';
import {existsSync} from 'node:fs';
test('guided network stories use present players and available narration',()=>{
 for(const story of networkStories)for(const step of story.steps){
  const r=rounds[step.round];assert.ok(r);for(const id of step.focus)assert.ok(r.candidates.includes(id));
  if(step.exit)assert.equal(step.exit,r.eliminated);
  if(step.audio)assert.ok(existsSync(`assets/narration/${step.audio}.mp3`));
 }
 assert.equal(Object.values(rounds[5].votes).filter(t=>t==='jonathan').length,2);
 assert.equal(Object.values(rounds[6].votes).filter(t=>t==='jonathan').length,6);
});

import {episodeCuts} from '../src/episode-pacing.js';
test('episode reveals match the vote ledger and include narration',()=>{
 assert.deepEqual(episodeCuts[0].final,rounds[0].expected.slice(0,2));
 assert.deepEqual(episodeCuts[1].final,rounds[4].expected);
 assert.equal(rounds[4].eliminated,'mark');
 assert.ok(murders.some(m=>m.id==='lucy'&&m.before===6));
 for(const cut of episodeCuts){assert.equal(cut.to,cut.from+1);assert.ok(existsSync(`assets/narration/${cut.audio}.mp3`));}
 for(const story of networkStories)for(const step of story.steps)assert.ok(step.audio);
});
