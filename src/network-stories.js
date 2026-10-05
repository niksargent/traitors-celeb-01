const nickSource='https://www.bigissue.com/culture/tv/celebrity-traitors-nick-mohammed-interview/';
const ruthSource='https://www.standard.co.uk/culture/music/jonathan-ross-clare-balding-alan-carr-bbc-one-celia-imrie-b1253383.html';
export const networkStories=[
 {id:'split',name:'How Joe lost his support',steps:[
  {round:7,focus:['joe','nick','david'],title:'They did not start together.',text:'Joe and David vote for Kate. Nick votes for Cat.',result:'Two different targets',seconds:9,audio:'network-split-start'},
  {round:8,focus:['joe','nick','david'],title:'Then all three choose Cat.',text:'Follow Nick. He now shares a target with Joe and David. Their three votes banish Cat.',result:'3 Faithful votes for a Traitor',seconds:11,audio:'fracture-agree-v4'},
  {round:8,focus:['joe','nick'],title:'The same vote. A different meaning.',text:'Nick had already wondered if Joe was a Traitor. Joe’s apology to Cat reinforced that suspicion.',result:'Nick begins to suspect Joe',seconds:13,audio:'fracture-apology',source:nickSource,sourceLabel:'Nick explains his decision'},
  {round:9,focus:['nick','david','alan','joe'],title:'Now they vote against Joe.',text:'Nick and David join Alan’s group. Joe is left alone, voting for Alan.',result:'3 against Joe · 1 against Alan',seconds:13,audio:'fracture-switch'},
  {round:9,focus:['joe','alan'],title:'Joe is right. He still loses.',text:'The three Faithful players found one Traitor together. Their next vote helped the other Traitor win.',result:'Joe is banished · Alan survives',seconds:13,audio:'fracture-out',exit:'joe'}
 ]},
 {id:'accusers',name:'Why removing an accuser was not enough',steps:[
  {round:1,focus:['ruth','wilkinson','jonathan'],title:'Ruth has the right suspect.',text:'Ruth and Joe Wilkinson both vote for Jonathan. In the turret, Jonathan argues for Ruth’s removal.',result:'2 votes for Jonathan',seconds:13,audio:'murder-ruth',source:ruthSource,sourceLabel:'The reported turret discussion'},
  {round:2,focus:['joe','jonathan'],title:'Ruth leaves. The suspicion remains.',text:'Ruth is murdered. Joe Marler now votes for Jonathan, but seven votes banish Clare.',result:'Jonathan survives',seconds:12,audio:'murder-ruth-out'},
  {round:5,focus:['joe','lucy','jonathan'],title:'Two correct votes still lose.',text:'Joe Marler and Lucy choose Jonathan. Four players choose Stephen instead.',result:'2 for Jonathan · 4 for Stephen',seconds:12,audio:'murder-lucy'},
  {round:6,focus:['joe','nick','cat','alan','celia','kate'],title:'Lucy leaves. Five others join Joe.',text:'Six players now vote for Jonathan. Alan and Cat, his fellow Traitors, are among them.',result:'2 → 6 votes for Jonathan',seconds:14,audio:'murder-jonathan-out'},
  {round:6,focus:['joe','jonathan'],title:'Jonathan is still banished.',text:'Ruth and Lucy are gone. Jonathan is banished anyway. Watch whether an accusation spreads beyond the first person to make it.',result:'Jonathan is banished',seconds:10,audio:'network-accusers-end',exit:'jonathan'}
 ]}
];
