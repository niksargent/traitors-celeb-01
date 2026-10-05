import {byId} from './data.js';
import {archetypes} from './drama-data.js';
const posters={
 fracture:{lines:['He found the Traitor.','They voted him out.'],cast:['joe','nick','david','alan'],fact:'Joe voted for Alan. Alan, Nick and David voted for Joe.',label:'THE FINAL FOUR'},
 company:{lines:['Nine votes.','Never alone.'],cast:['alan','nick','david'],fact:'In every ordinary round, someone voted for the same person as Alan.',label:'ALAN’S VOTING RECORD'},
 secret:{lines:['Three Traitors.','Never one shared target.'],cast:['alan','cat','jonathan'],fact:'In six ordinary rounds together, they never all voted for the same person.',label:'THE ORIGINAL TRAITORS'},
 murders:{lines:['Lucy was murdered.','Jonathan still went.'],cast:['joe','jonathan'],fact:'After Lucy’s murder, Joe and five others voted Jonathan out.',label:'WHAT HAPPENED NEXT'},
 season:{lines:['Two Traitors caught.','One still there.'],cast:['jonathan','cat','alan'],fact:'Jonathan and Cat were banished. Alan survived and won.',label:'THE SEASON’S RESULT'},
 isolation:{lines:['Five winners.','Only three lone votes.'],cast:[],fact:'Across UK1, UK2 and Celebrity1, 52 of their 55 ordinary votes had a shared target.',label:'A PATTERN ACROSS THREE SERIES'}
};
export function storyShareText(id){const p=posters[id];return p.lines.join(' ')+' '+p.fact;}
export async function showStoryPoster(id){
 const model=posters[id],canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');const art=new Image();art.src='assets/tarot-atlas.png';await art.decode();await document.fonts.ready;
 ctx.fillStyle='#0b100e';ctx.fillRect(0,0,1080,1350);ctx.strokeStyle='#746749';ctx.strokeRect(35,35,1010,1280);
 const text=(str,x,y,size,color='#ede8db',font='Georgia')=>{ctx.fillStyle=color;ctx.font=`${size}px ${font}`;ctx.fillText(str,x,y);};
 const wrap=(str,y,size=32)=>{let line='';ctx.font=`${size}px Arial`;for(const word of str.split(' ')){if(ctx.measureText(line+word).width>900){text(line,90,y,size,'#c1c7b7','Arial');y+=48;line='';}line+=word+' ';}text(line,90,y,size,'#c1c7b7','Arial');};
 text('THE UNSEEN GAME',90,110,23,'#d8c291','Arial');text(id==='isolation'?'UK 1 + 2 · CELEBRITY 1 · SPOILERS':'CELEBRITY TRAITORS · UK 1 · SPOILERS',90,155,18,'#a7ae9e','Arial');text(model.label,90,240,20,'#e58973','Arial');
 model.lines.forEach((line,i)=>text(line,90,350+i*85,line.length>23?59:70));
 const n=model.cast.length;
 if(n){const width=n===4?185:240,height=width*1.5,gap=24,start=(1080-(n*width+(n-1)*gap))/2;
  model.cast.forEach((id,i)=>{const slot=archetypes.findIndex(a=>a.id===id),x=start+i*(width+gap),y=565;ctx.drawImage(art,(slot%3)*art.width/3,Math.floor(slot/3)*art.height/2,art.width/3,art.height/2,x,y,width,height);ctx.strokeStyle=byId[id].role==='T'?'#f18068':'#d8c291';ctx.lineWidth=4;ctx.strokeRect(x,y,width,height);ctx.fillStyle='#0b100eee';ctx.fillRect(x,y+height-63,width,63);text(byId[id].short,x+12,y+height-30,26);text(byId[id].role==='T'?'TRAITOR':'FAITHFUL',x+12,y+height-10,12,ctx.strokeStyle,'Arial');});
 }else{text('52 / 55',160,790,180,'#d8c291');text('VOTES WITH A SHARED TARGET',160,860,24,'#c1c7b7','Arial');}
 wrap(model.fact,1050);text('Explore the votes and watch the stories.',90,1230,23,'#d8c291','Arial');
 const url=canvas.toDataURL('image/png'),dialog=document.querySelector('#poster-dialog');document.querySelector('#poster-title').textContent='Save this story';
 const content=document.querySelector('#poster-content');content.replaceChildren();const preview=document.createElement('img');preview.src=url;preview.alt=model.lines.join(' ')+' '+model.fact;preview.style.cssText='display:block;width:100%;height:auto';content.append(preview);
 const download=document.createElement('a');download.href=url;download.download=`the-unseen-game-${id}.png`;download.className='primary-button';download.style.cssText='display:inline-block;margin-top:18px';download.textContent='Download image';content.append(download);
 const source=document.createElement('p');source.textContent='Use Share this story to copy its link.';content.append(source);dialog.showModal();
}
