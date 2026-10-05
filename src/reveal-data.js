import {seasonReel} from './season-sequence.js';
import {storyReels} from './story-scenes.js';
import {rounds,byId} from './data.js';
import {winnerBallots} from './winner-ballots.js';
export {winnerBallots};
export const coverRounds=rounds.filter(r=>!r.restricted).map(r=>({label:r.label,target:r.votes.alan,companions:Object.entries(r.votes).filter(([p,t])=>p!=='alan'&&t===r.votes.alan).map(([p])=>p)}));
export const teamRounds=rounds.filter(r=>!r.restricted&&['alan','cat','jonathan'].every(id=>r.votes[id])).map(r=>({label:r.label,targets:['alan','cat','jonathan'].map(id=>r.votes[id])}));
export const reels=[
 {id:'company',name:'Never alone',hook:'He never voted alone.',strap:'One man. Nine votes. Watch the company change.',takeaway:'Next series: watch who always finds company.',beats:[
 {audio:'cover-intro',mode:'intro',seconds:18,title:'Meet Alan.',caption:'Comedian. Secretly, a Traitor. The others must find him.'},
 {audio:'cover-early',mode:'cover',indices:[0,1,2,3],seconds:14,title:'The company changes.',caption:'These people wrote the same name as Alan.'},
 {audio:'cover-late-plain',mode:'cover',indices:[4,5,6,7,8],seconds:16,title:'He keeps finding company.',caption:'Different rounds. Different companions.'},
 {audio:'cover-reveal-plain',mode:'cover-end',seconds:18,title:'Nine votes. Never alone.',caption:'He voted with different people throughout the game.'}
 ]},
 {id:'secret',name:'Same secret. Different votes.',hook:'Would you spot the hidden team?',strap:'Three Traitors. Follow their ballots, not their secret.',takeaway:'Next series: Traitors can vote differently from each other.',beats:[
 {audio:'team-intro',mode:'team-intro',seconds:18,title:'One hidden team.',caption:'Alan · comedian. Cat · singer. Jonathan · presenter.'},
 {audio:'team-votes',mode:'team',seconds:15,title:'Their votes pull apart.',caption:'The name below each card is the person they voted against.'},
 {audio:'team-reveal-plain',mode:'team-end',seconds:17,title:'Same secret. Different votes.',caption:'Six ordinary rounds together. Zero unanimous targets.'}
 ]},
 {id:'isolation',name:'The lonely vote',hook:'What do winners have in common?',strap:'Five winners. Three series. Let their votes speak.',takeaway:'Next series: who is right—and who is left alone?',beats:[
 {audio:'winners-intro',mode:'winners',seconds:17,title:'Fifty-five votes.',caption:'Each light is one ordinary ballot cast by a winner.'},
 {audio:'winners-reveal',mode:'winners-reveal',seconds:14,title:'Take away every vote with company.',caption:'Watch how few lights remain.'},
 {audio:'winners-outro-plain',mode:'winners-end',seconds:18,title:'Only three stood alone.',caption:'In 52 of their 55 votes, someone else chose the same target.'}
 ]}
,...storyReels,seasonReel
];
