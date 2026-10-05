// Persistent velocity makes each new vote reshape the existing network.
export function stepVoteForces(nodes,groups,width,height,dt=1){
 const live=nodes.filter(n=>n.live),padding=width<500?37:55;
 for(const n of nodes){const g=groups.get(n.group);const x=g?.x??width/2,y=g?.y??height/2;
  n.vx+=(x-n.x)*.018*dt;n.vy+=(y-n.y)*.018*dt;
 }
 for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){
  const a=live[i],b=live[j];let dx=b.x-a.x,dy=b.y-a.y;
  if(Math.abs(dx)+Math.abs(dy)<.001){dx=.1;dy=.1;}
  const d=Math.max(1,Math.hypot(dx,dy)),same=a.group===b.group;
  const rest=width<500?86:108;
  let force=-Math.min(1.6,650/(d*d));
  if(same)force+=(d-rest)*.002/Math.sqrt(live.filter(n=>n.group===a.group).length);
  // Keep names apart, including players in different vote groups.
  const overlap=Math.hypot(dx/rest,dy/65);
  if(overlap<1)force-=8*(1-overlap);
  const fx=dx/d*force*dt,fy=dy/d*force*dt;
  a.vx+=fx;a.vy+=fy;b.vx-=fx;b.vy-=fy;
 }
 for(const n of nodes){n.vx*=Math.pow(.76,dt);n.vy*=Math.pow(.76,dt);n.x+=Math.max(-5,Math.min(5,n.vx))*dt;n.y+=Math.max(-5,Math.min(5,n.vy))*dt;
  n.x=Math.max(padding,Math.min(width-padding,n.x));n.y=Math.max(48,Math.min(height-65,n.y));
 }
}
export function voteGroups(votes,width,height){
 const counts=new Map();Object.values(votes).forEach(id=>counts.set(id,(counts.get(id)||0)+1));
 const items=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])),result=new Map();
 function divide(list,x,y,w,h){
  if(list.length===1){result.set(list[0][0],{x:x+w/2,y:y+h/2});return;}
  const total=list.reduce((s,a)=>s+a[1],0);let split=1,sum=list[0][1];
  while(split<list.length-1&&Math.abs(sum+list[split][1]-total/2)<Math.abs(sum-total/2)){sum+=list[split++][1];}
  const ratio=sum/total;
  if(w>h){divide(list.slice(0,split),x,y,w*ratio,h);divide(list.slice(split),x+w*ratio,y,w*(1-ratio),h);}
  else{divide(list.slice(0,split),x,y,w,h*ratio);divide(list.slice(split),x,y+h*ratio,w,h*(1-ratio));}
 }
 if(items.length)divide(items,20,35,width-40,height-95);return result;
}
