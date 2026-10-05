import {rounds} from './data.js';

// Co-voting is observable. Friendship, persuasion and defence need dialogue evidence.
export function coalitionChanges(before,after){
 const a=rounds[before].votes,b=rounds[after].votes;
 const common=Object.keys(b).filter(id=>a[id]);
 const joined=[],broken=[],held=[],turned=[];
 for(let i=0;i<common.length;i++)for(let j=i+1;j<common.length;j++){
  const x=common[i],y=common[j],was=a[x]===a[y],now=b[x]===b[y];
  if(was&&now)held.push([x,y]);else if(was)broken.push([x,y]);else if(now)joined.push([x,y]);
 }
 for(const [v,t] of Object.entries(b))if(a[v]&&a[t]&&a[v]===a[t])turned.push([v,t]);
 return {joined,broken,held,turned};
}
export function votingPairs(index){
 const entries=Object.entries(rounds[index].votes),pairs=[];
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++)if(entries[i][1]===entries[j][1])pairs.push([entries[i][0],entries[j][0]]);
 return pairs;
}

export const films=[
 {id:'fracture',title:'The winning coalition breaks',subtitle:'Three people find a Traitor. Then two turn on the third.',cast:['alan','cat','david','nick','joe','kate'],beats:[
  {round:7,title:'Three against the wrong woman.',caption:'Joe, David and Cat vote for Kate.',focus:['joe','david','cat','kate'],positions:{joe:[22,28],david:[42,28],cat:[62,28],kate:[42,76],alan:[82,76],nick:[82,28]},out:'Kate is banished. A Faithful.',duration:6500},
  {round:8,title:'Nick, Joe and David agree on Cat.',caption:'Nick joins Joe and David. All three target Cat.',focus:['joe','david','nick','cat'],positions:{joe:[22,28],david:[42,28],nick:[62,28],cat:[42,76],alan:[76,76],kate:[96,95]},out:'Cat is banished. A Traitor.',duration:7500},
  {round:9,title:'Then they turn on their own.',caption:'David and Nick leave Joe’s side. Alan joins theirs.',focus:['david','nick','alan','joe'],positions:{alan:[22,28],david:[42,28],nick:[62,28],joe:[42,76],cat:[96,95],kate:[96,95]},out:'Joe is banished. Alan survives.',duration:8500},
  {round:9,title:'Nick and David vote together again.',caption:'David and Nick stay together. This time, they help Alan banish Joe.',focus:['alan','david','nick','joe'],positions:{alan:[42,28],david:[22,62],nick:[62,62],joe:[85,80],cat:[96,95],kate:[96,95]},out:'Joe was right about Alan, but Nick and David voted against Joe.',duration:7000,ending:true}
 ]},
 {id:'sacrifice',title:'Traitors vote out a teammate',subtitle:'Watch a shared vote become a vote against a partner.',cast:['alan','cat','jonathan','david','nick','joe','lucy','stephen','celia','kate'],beats:[
  {round:5,title:'Cat and Jonathan vote together.',caption:'With David and Nick, they help send Stephen out.',focus:['cat','jonathan','david','nick','stephen'],positions:{cat:[18,24],jonathan:[38,24],david:[58,24],nick:[78,24],stephen:[48,76],alan:[10,76],joe:[90,76],lucy:[90,50],celia:[10,50],kate:[48,50]},out:'Stephen leaves. Jonathan is still protected by the result.',duration:7500},
  {round:6,title:'Next round, Cat votes against Jonathan.',caption:'Cat votes against Jonathan. So does Alan.',focus:['cat','alan','jonathan'],positions:{cat:[25,25],alan:[75,25],jonathan:[50,70],nick:[10,52],joe:[90,52],david:[80,82],celia:[20,82],kate:[50,20],lucy:[95,95],stephen:[95,95]},out:'Jonathan is banished: six votes, two from Traitors.',duration:8500},
  {round:6,title:'They joined a verdict already strong enough.',caption:'Four Faithfuls voted Jonathan. His fellow Traitors added two.',focus:['cat','alan','jonathan','nick','joe','celia','kate'],positions:{cat:[20,23],alan:[80,23],jonathan:[50,68],nick:[12,56],joe:[88,56],celia:[25,84],kate:[75,84],david:[50,17],lucy:[95,95],stephen:[95,95]},out:'Voting out Jonathan could help Alan and Cat look innocent.',duration:7500,ending:true}
 ]},
 {id:'warning',title:'Lucy is murdered. Jonathan still goes.',subtitle:'Lucy voted for Jonathan. After her murder, six others did too.',cast:['alan','cat','jonathan','david','nick','joe','lucy','stephen','celia','kate'],beats:[
  {round:5,title:'Joe and Lucy vote for Jonathan.',caption:'Joe and Lucy share the right target. Four others choose Stephen.',focus:['joe','lucy','jonathan','stephen'],positions:{joe:[22,28],lucy:[42,28],jonathan:[32,75],stephen:[75,75],cat:[62,24],nick:[82,24],david:[62,47],alan:[10,55],celia:[10,80],kate:[85,50]},out:'Stephen is banished. Jonathan stays.',duration:7500},
  {round:6,title:'Lucy is gone. Her suspicion spreads.',caption:'Lucy is murdered. Joe again votes Jonathan—now with five others.',focus:['joe','lucy','jonathan','nick','cat','alan','celia','kate'],positions:{joe:[20,28],lucy:[42,28],jonathan:[50,76],cat:[63,24],alan:[82,28],nick:[13,56],celia:[87,56],kate:[50,20],david:[80,82],stephen:[95,95]},out:'Six votes remove Jonathan. Lucy never sees that ballot.',duration:8500},
  {round:9,title:'At the end, Joe is alone again.',caption:'His target is right. This time, nobody votes with him.',focus:['joe','alan','nick','david'],positions:{joe:[28,62],alan:[72,62],nick:[62,25],david:[82,25],lucy:[10,92],jonathan:[10,92],cat:[10,92],stephen:[10,92],celia:[10,92],kate:[10,92]},out:'Joe was right again. This time, nobody joined him.',duration:7500,ending:true}
 ]}
];
