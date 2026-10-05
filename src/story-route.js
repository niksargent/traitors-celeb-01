// Keep stable film IDs while changing the order of the guided visit.
export const storyOrder=['fracture','company','secret','murders','season'];
export const storyLinks={
 fracture:{question:'How did Alan avoid the same fate?',next:'company'},
 company:{question:'Did the Traitors vote as a team?',next:'secret'},
 secret:{question:'Could murder stop a correct suspicion?',next:'murders'},
 murders:{question:'How often did the Faithful get it right?',next:'season'},
 season:{question:'Which player would you watch more closely?',next:null},
 isolation:{question:'Which player would you watch more closely?',next:null}
};
export function nextStoryIndex(reels,index){const id=storyLinks[reels[index].id]?.next;return id?reels.findIndex(r=>r.id===id):-1;}
