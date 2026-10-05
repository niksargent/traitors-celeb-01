export const scenes=[
 {
  "round": 0,
  "kicker": "ACT I · THE WITCH HUNT",
  "title": "Ten voted for Niko.<br><em>He was Faithful.</em>",
  "line": "Ten people wrote Niko. Nobody wrote a Traitor.",
  "metric": "10",
  "unit": "votes. An innocent target.",
  "reading": "Ten players agreed on Niko. He was Faithful. A popular suspicion can still be wrong.",
  "name": "The witch hunt",
  "focus": "niko"
 },
 {
  "round": 1,
  "kicker": "ACT II · THE FOG",
  "title": "Ten different suspects.<br><em>Tameka gets four votes.</em>",
  "line": "All three Traitors received votes. None received enough.",
  "metric": "10",
  "unit": "suspects. Sixteen ballots.",
  "reading": "Votes went to ten different people. All three Traitors were among them, but Tameka received the most and was banished.",
  "name": "The fog",
  "focus": "tameka"
 },
 {
  "round": 5,
  "kicker": "ACT III · THE UNHEARD WARNING",
  "title": "Joe and Lucy were right.<br><em>Jonathan stayed.</em>",
  "line": "Joe and Lucy voted Jonathan. Stephen was banished.",
  "metric": "2",
  "unit": "votes against Jonathan.",
  "reading": "Joe and Lucy were right about Jonathan. But four votes against Stephen outweighed their two, so Jonathan stayed.",
  "name": "The warning",
  "focus": "jonathan"
 },
 {
  "round": 6,
  "kicker": "ACT IV · THE SACRIFICE",
  "title": "Alan and Cat vote<br><em>against Jonathan.</em>",
  "line": "Alan and Cat voted to banish their fellow Traitor.",
  "metric": "2",
  "unit": "votes from fellow Traitors.",
  "reading": "Alan and Cat joined four Faithfuls in voting out Jonathan. That could help them look innocent, although the Faithful votes already put him ahead.",
  "name": "The sacrifice",
  "focus": "jonathan"
 },
 {
  "round": 8,
  "kicker": "ACT V · THE MOMENT OF CLARITY",
  "title": "Joe, David and Nick<br><em>agree on Cat.</em>",
  "line": "Joe, David and Nick all voted for Cat. She was a Traitor.",
  "metric": "3 / 3",
  "unit": "Faithfuls on the right target.",
  "reading": "Joe, David and Nick all voted for Cat. At the next vote, Nick and David voted against Joe.",
  "name": "The clarity",
  "focus": "cat"
 },
 {
  "round": 9,
  "kicker": "ACT VI · THE FINAL BETRAYAL",
  "title": "He found the Traitor.<br><em>They banished him anyway.</em>",
  "line": "Joe named Alan. Alan, Nick and David named Joe.",
  "metric": "1",
  "unit": "man right. Three against him.",
  "reading": "Nick and David voted with Alan to remove Joe. The only player who voted for the remaining Traitor was banished.",
  "name": "The betrayal",
  "focus": "joe"
 }
];
export const archetypes=[
 {
  "id": "alan",
  "roman": "I",
  "name": "The Mask",
  "subtitle": "People kept giving Alan the benefit of the doubt.",
  "maxim": "Only two people<br>ever voted for Alan.",
  "metric": "2",
  "unit": "votes received all series",
  "reading": "Alan seemed to get away with behaviour that might have made someone else look suspicious. Perhaps the others found it easier to believe the funny, flustered man they knew than to imagine him fooling them.",
  "shadow": "Would the same behaviour look suspicious in someone else?",
  "evidence": "Clare and Joe were the only players to vote for Alan. Nick, a Faithful, also received just two votes.",
  "scene": 5
 },
 {
  "id": "joe",
  "roman": "II",
  "name": "The Hunter",
  "subtitle": "Joe found Traitors, but could not always convince the others.",
  "maxim": "Joe was right about Alan.<br>Nobody voted with him.",
  "metric": "5 / 9",
  "unit": "ballots aimed at Traitors",
  "reading": "Joe voted for a Traitor five times. But in the final four, Nick and David suspected Joe instead. His correct vote could not save him when all three other players voted him out.",
  "shadow": "Who can persuade the others to vote with them?",
  "evidence": "Three votes for Jonathan, one for Cat, one for Alan. In the final four, the only ballot for a Traitor was Joe’s.",
  "scene": 5
 },
 {
  "id": "david",
  "roman": "III",
  "name": "The Martyr",
  "subtitle": "David kept being accused, but stayed in the game.",
  "maxim": "Eighteen votes against him.<br>Still in the final three.",
  "metric": "18",
  "unit": "votes received. Still a finalist.",
  "reading": "David attracted more votes than anyone else. They were spread across several rounds, and he survived a tied revote through the chest tiebreak. Being repeatedly suspected did not mean he would be the next to leave.",
  "shadow": "Are the votes adding up in one round, or spread across the series?",
  "evidence": "David survived a 5–5 restricted revote through the chest tiebreak and reached the final three. His last unrestricted vote before the final four targeted Cat.",
  "scene": 1
 },
 {
  "id": "jonathan",
  "roman": "IV",
  "name": "The Sacrifice",
  "subtitle": "Alan and Cat helped vote Jonathan out.",
  "maxim": "His fellow Traitors<br>voted against him too.",
  "metric": "6",
  "unit": "votes out. Two from his own side.",
  "reading": "Four Faithfuls voted for Jonathan. Alan and Cat joined them. Voting out a fellow Traitor might help you look innocent, especially when defending them is unlikely to save them.",
  "shadow": "Who gains credibility by helping remove a Traitor?",
  "evidence": "Alan and Cat both voted for Jonathan. Four Faithfuls did too. The Faithful-only tally already had Jonathan in the lead.",
  "scene": 3
 },
 {
  "id": "cat",
  "roman": "V",
  "name": "The Quiet Blade",
  "subtitle": "Cat stayed out of most votes until the final five.",
  "maxim": "Cat stayed quiet.<br>Then three votes ended her game.",
  "metric": "2",
  "unit": "votes received before the final five",
  "reading": "Cat seemed to do well by staying quiet: she received only two votes before the final five. But it did not last. When Joe, David and Nick all voted for her, she was banished.",
  "shadow": "Who is starting to agree on someone they previously overlooked?",
  "evidence": "Celia cast one early vote against Cat. Nick added one in round 07. At the final five, all three remaining Faithfuls voted for her.",
  "scene": 4
 },
 {
  "id": "nick",
  "roman": "VI",
  "name": "The Mirror",
  "subtitle": "Nick mistook Joe’s apology for a sign of guilt.",
  "maxim": "Joe said sorry to Cat.<br>Nick thought they were both Traitors.",
  "metric": "2 words",
  "unit": "Nick misread Joe’s apology",
  "reading": "After Cat was banished, Joe apologised to her. Nick later said this made him think Joe was a fellow Traitor. At the next vote, he helped banish Joe, who was Faithful.",
  "shadow": "Could an innocent person have done the same thing?",
  "evidence": "Nick voted with Joe against Cat, then against Joe at the final four. His account of the apology appears in his December 2025 Big Issue interview.",
  "scene": 5,
  "source": "https://www.bigissue.com/culture/tv/celebrity-traitors-nick-mohammed-interview/"
 }
];
