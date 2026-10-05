// Manually transcribed and cross-checked against both public voting tables.
// Round order, not episode order: cliffhangers and the restricted revote are explicit.
export const sources = [
  {name:'Wikipedia · voting and elimination record', url:'https://en.wikipedia.org/wiki/The_Celebrity_Traitors_series_1#Elimination_history'},
  {name:'The Traitors Wiki · voting history', url:'https://thetraitors.fandom.com/wiki/The_Traitors_(UK)/Celebrity_Series_1#Voting_History'}
];
export const players = [
  ['alan','Alan Carr','Alan','T',10,'Winner'],
  ['cat','Cat Burns','Cat','T',8,'Banished · final five'],
  ['jonathan','Jonathan Ross','Jonathan','T',6,'Banished · episode 7'],
  ['david','David Olusoga','David','F',10,'Finalist'],
  ['nick','Nick Mohammed','Nick','F',10,'Finalist'],
  ['joe','Joe Marler','Joe M.','F',9,'Banished · final four'],
  ['kate','Kate Garraway','Kate','F',7,'Banished · episode 8'],
  ['celia','Celia Imrie','Celia','F',6,'Murdered · episode 8'],
  ['lucy','Lucy Beaumont','Lucy','F',5,'Murdered · episode 7'],
  ['stephen','Stephen Fry','Stephen','F',5,'Banished · episode 6'],
  ['wilkinson','Joe Wilkinson','Joe W.','F',4,'Murdered · episode 6'],
  ['mark','Mark Bonnar','Mark','F',4,'Banished · chest tiebreak'],
  ['charlotte','Charlotte Church','Charlotte','F',2,'Murdered · episode 5'],
  ['clare','Clare Balding','Clare','F',2,'Banished · episode 4'],
  ['ruth','Ruth Codd','Ruth','F',1,'Murdered · episode 4'],
  ['tameka','Tameka Empson','Tameka','F',1,'Banished · episode 3'],
  ['tom','Tom Daley','Tom','F',0,'Murdered · episode 3'],
  ['niko','Niko Omilana','Niko','F',0,'Banished · episode 3'],
  ['paloma','Paloma Faith','Paloma','F',-1,'Murdered · episode 2']
].map(([id,name,short,role,lastRound,result])=>({id,name,short,role,lastRound,result}));
export const byId = Object.fromEntries(players.map(p=>[p.id,p]));
const records = {
  alan:      ['niko','celia','david','mark','mark','joe','jonathan','david','david','joe'],
  david:     ['niko','stephen','clare','stephen',null,'stephen','nick','kate','cat','joe'],
  nick:      ['niko','tameka','celia','kate','mark','stephen','jonathan','cat','cat','joe'],
  joe:       ['niko','kate','jonathan','mark','mark','jonathan','jonathan','kate','cat','alan'],
  cat:       ['kate','stephen','stephen','david','david','stephen','jonathan','kate','david'],
  kate:      ['tameka','tameka','clare','mark','mark','nick','jonathan','david'],
  celia:     ['charlotte','cat','david','jonathan','david','joe','jonathan'],
  jonathan:  ['niko','ruth','clare','david','david','stephen','david'],
  lucy:      ['niko','david','clare','mark','mark','jonathan'],
  stephen:   ['niko','charlotte','clare','david','david','david'],
  wilkinson: ['tom','jonathan','clare','david','david'],
  mark:      ['tameka','tameka','charlotte','kate',null],
  charlotte: ['niko','tameka','clare'],
  clare:     ['niko','alan','charlotte'],
  ruth:      ['kate','jonathan'],
  tameka:    ['kate','celia'],
  tom:       ['niko'],
  niko:      ['tom'],
  paloma:    []
};
const meta = [
  ['r1','01','2–3','niko','The first consensus','Ten votes. The wrong person.','A majority forms around Niko. None of the 18 ballots targets a Traitor. Niko is Faithful.', [10,3,2,2,1]],
  ['r2','02','3','tameka','A room in fragments','Ten names. Sixteen votes.','Tameka is banished with only a quarter of the vote. Four ballots hit Traitors, but they are split across all three of them.', [4,2,2,2,1,1,1,1,1,1]],
  ['r3','03','4','clare','The lone vote disappears','Clare named Alan. Then Clare left.','Clare cast the only vote against Alan before the final four. In the next round, seven players vote to banish her. Alan votes for David.', [7,2,2,1,1,1]],
  ['r4','04','5',null,'A divided room','Four against David. Four against Mark.','Neither leading target is a Traitor. The tied players lose their own votes in the restricted revote.', [4,4,2,1,1]],
  ['r5','R','5–6','mark','The game hands over to chance','Five against five.','The revote stays tied. Mark is banished through the chest tiebreak, not by a voting majority. A single changed ballot here would have settled the vote.', [5,5]],
  ['r6','05','6','stephen','Two right votes. No result.','Jonathan survives. Stephen leaves.','Joe Marler and Lucy vote for Jonathan. Four votes for Stephen outweigh them. Jonathan stays because more players vote for Stephen.', [4,2,2,1,1]],
  ['r7','06','7','jonathan','The first Traitor falls','Six players vote out Jonathan.','Six of eight ballots target Jonathan, including Alan’s and Cat’s. Their votes reinforce a result that the Faithful-only tally also supports.', [6,1,1]],
  ['r8','07','8','kate','One vote from reversal','Kate goes. Cat gets one vote.','Kate’s three votes beat David’s two. Switch one Kate voter to David and the result reverses. Both leading targets are Faithful.', [3,2,1]],
  ['r9','08','9','cat','The Faithful finally coordinate','Three Faithful. Three votes for Cat.','David, Nick and Joe vote together for Cat. Alan and Cat target David. One Faithful switching to David would reverse this result.', [3,2]],
  ['r10','09','9','joe','The final fracture','One right vote cannot beat three.','Joe votes for Alan. Alan, David and Nick vote for Joe. One switch to Alan creates a tie; two would give Alan the most votes.', [3,1]]
];
export const rounds = meta.map(([id,label,episode,eliminated,title,headline,description,expected], index)=>({
  id,label,episode,eliminated,title,headline,description,expected,index,
  restricted:index===4,
  candidates:index===4?['david','mark']:players.filter(p=>p.lastRound>=index).map(p=>p.id),
  votes:Object.fromEntries(Object.entries(records).filter(([,v])=>v[index]).map(([voter,v])=>[voter,v[index]]))
}));
export const murders = [
 {id:'paloma',before:0}, {id:'tom',before:1}, {id:'ruth',before:2},
 {id:'charlotte',before:3}, {id:'wilkinson',before:5}, {id:'lucy',before:6}, {id:'celia',before:7}
];
export const reviewed='3 October 2026';
