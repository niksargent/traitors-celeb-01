import {rounds} from './data.js';
export function validateScenario(input){
 if(!input||typeof input!=='object'||!['4','7','8','9'].includes(String(input.roundIndex)))throw new Error('Choose roundIndex 4, 7, 8 or 9.');
 const round=rounds[Number(input.roundIndex)],votes={...round.votes};
 if(input.changes!==undefined&&(!input.changes||typeof input.changes!=='object'||Array.isArray(input.changes)))throw new Error('changes must map voter IDs to target IDs.');
 for(const [v,t] of Object.entries(input.changes||{})){
  if(!Object.hasOwn(round.votes,v))throw new Error(`Ineligible voter: ${v}`);
  if(!round.candidates.includes(t)||v===t)throw new Error(`Invalid target for ${v}`);
  votes[v]=t;
 }
 return {index:Number(input.roundIndex),votes};
}
