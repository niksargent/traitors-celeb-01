import {rounds,byId} from './data.js';

// Positions stay fixed where possible so movement shows a change in the vote.
export const storyFrames={
 opening:{round:9,voters:['joe','alan','david','nick'],positions:{joe:[20,27],david:[50,67],nick:[80,67],alan:[80,27]},out:[],note:'JOE FINDS ALAN. THREE PLAYERS VOTE AGAINST JOE.',result:'Joe is right. Joe is banished.'},
 agreement:{round:8,voters:['joe','david','nick'],positions:{joe:[20,27],david:[50,27],nick:[80,27],cat:[50,69],alan:[84,69]},out:[],note:'THREE FAITHFULS VOTE FOR CAT',result:'Cat is banished. She is a Traitor.'},
 apology:{positions:{joe:[20,27],david:[50,27],nick:[80,27],cat:[50,69],alan:[84,69]},out:['cat'],note:'JOE APOLOGISES TO CAT',quote:'“I’m sorry.”',result:'Nick thinks Joe could be a Traitor too.'},
 switch:{round:9,voters:['alan','david','nick'],positions:{joe:[20,27],david:[50,67],nick:[80,67],alan:[80,27]},out:[],note:'NICK AND DAVID NOW VOTE AGAINST JOE',result:'Three votes for Joe. One for Alan.'},
 joeOut:{round:9,voters:['joe'],positions:{joe:[20,27],david:[50,67],nick:[80,67],alan:[80,27]},out:['joe'],note:'JOE’S VOTE WAS RIGHT',result:'Joe is banished. Alan stays.'},
 ruth:{round:1,voters:['ruth'],positions:{ruth:[23,43],jonathan:[72,43]},out:[],note:'RUTH VOTES FOR JONATHAN',result:'Jonathan wants Ruth removed.'},
 ruthOut:{positions:{ruth:[23,43],jonathan:[72,43]},out:['ruth'],note:'RUTH IS MURDERED',result:'Jonathan survives three more votes.'},
 lucy:{round:5,voters:['joe','lucy'],positions:{joe:[18,28],lucy:[18,70],jonathan:[72,45]},out:[],note:'JOE AND LUCY NOW VOTE FOR JONATHAN',result:'Stephen gets four votes and is banished.'},
 lucyOut:{positions:{joe:[18,28],lucy:[18,70],jonathan:[72,45]},out:['lucy'],note:'LUCY IS MURDERED',result:'Joe remains. At the next vote, others join him.'},
 jonathanOut:{round:6,voters:['joe','nick','cat','alan','celia','kate'],positions:{jonathan:[53,43],joe:[16,22],nick:[42,15],cat:[79,20],alan:[15,67],celia:[43,77],kate:[82,70]},out:['jonathan'],note:'SIX VOTES NOW GO TO JONATHAN',result:'Jonathan is banished. The suspicion did not end.'}
};

export function frameVotes(frame){return frame.round===undefined?[]:frame.voters.map(id=>[id,rounds[frame.round].votes[id]]);}

export function drawStory(frameId,{cast,threads,target,statement,clearStage,place}){
 const f=storyFrames[frameId];clearStage();
 for(const [id,xy]of Object.entries(f.positions)){
  place(id,...xy,Object.keys(f.positions).length>5?.83:1.12,true,f.out.includes(id)?(id==='ruth'||id==='lucy'?'MURDERED':'BANISHED'):'');
 }
 cast.querySelectorAll('.reveal-person').forEach(el=>el.classList.toggle('story-out',f.out.includes(el.dataset.revealPerson)));
 threads.innerHTML='<defs><marker id="story-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#d8c291"/></marker></defs>'+frameVotes(f).map(([v,t])=>{
  const a=f.positions[v],z=f.positions[t],dx=z[0]-a[0],dy=z[1]-a[1],d=Math.hypot(dx,dy),gap=11;
  return `<path class="story-vote" d="M${(a[0]+dx/d*gap)*10} ${(a[1]+dy/d*gap)*5} L${(z[0]-dx/d*gap)*10} ${(z[1]-dy/d*gap)*5}" marker-end="url(#story-arrow)"><title>${byId[v].name} voted for ${byId[t].name}</title></path>`;
 }).join('');
 statement.innerHTML=`<span class="story-note">${f.note}</span>${f.quote?`<strong class="story-quote">${f.quote}</strong>`:''}`;
 target.innerHTML=`<strong>${f.result}</strong>`;
}

export const storyReels=[
 {id:'fracture',name:'Why Joe lost',hook:'He found the Traitor. They voted him out.',strap:'Joe was Faithful. Alan was a Traitor. Nick and David chose the wrong man.',takeaway:'Watch who agrees with a player, then turns against them.',beats:[
  {audio:'fracture-opening',mode:'story',frame:'opening',seconds:9,title:'Joe found Alan. It did not save him.',caption:'Go back one vote to see how Nick changed his mind.'},
  {audio:'fracture-agree-v4',mode:'story',frame:'agreement',seconds:11,title:'Three votes catch Cat.',caption:'Joe, David and Nick all choose Cat.'},
  {audio:'fracture-apology',mode:'story',frame:'apology',seconds:13,title:'Nick hears Joe apologise.',caption:'Nick later says this made Joe look guilty to him.'},
  {audio:'fracture-switch',mode:'story',frame:'switch',seconds:10,title:'Nick and David turn against Joe.',caption:'Nick and David vote with Alan. Joe votes alone.'},
  {audio:'fracture-out',mode:'story',frame:'joeOut',seconds:10,title:'Joe was right about Alan.',caption:'But the other three voted Joe out.'}
 ]},
 {id:'murders',name:'After the murder',hook:'Remove a player. Does the suspicion stop?',strap:'Follow the votes against Jonathan after Ruth and Lucy leave.',takeaway:'After a murder, watch who keeps asking the same question.',beats:[
  {audio:'murder-ruth',mode:'story',frame:'ruth',seconds:11,title:'Ruth suspects Jonathan.',caption:'Jonathan worries that she will keep accusing him.'},
  {audio:'murder-ruth-out',mode:'story',frame:'ruthOut',seconds:10,title:'Ruth is murdered. Jonathan stays.',caption:'He survives the next three ordinary votes.'},
  {audio:'murder-lucy',mode:'story',frame:'lucy',seconds:10,title:'Joe and Lucy vote for Jonathan.',caption:'Their two votes are not enough. Stephen is banished.'},
  {audio:'murder-lucy-out',mode:'story',frame:'lucyOut',seconds:9,title:'Then Lucy is murdered.',caption:'Joe is still in the game.'},
  {audio:'murder-jonathan-out',mode:'story',frame:'jonathanOut',seconds:12,title:'Six votes remove Jonathan.',caption:'Five other players now vote with Joe.'}
 ]}
];
