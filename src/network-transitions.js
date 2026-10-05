export const linkKey=(a,b)=>[a.id,b.id].sort().join(':');
export function updateLinks(old,pairs){
 const links=new Map(old.map(e=>[linkKey(e.a,e.b),{...e,previousWanted:e.wanted,wanted:false}]));
 for(const [a,b]of pairs){const key=linkKey(a,b),oldLink=links.get(key);links.set(key,{a,b,alpha:oldLink?.alpha||0,wanted:true,kept:!!oldLink?.previousWanted&&oldLink.alpha>.5});}
 return [...links.values()];
}
export function fadeLinks(links,age,dt,limit){
 for(const e of links){const distance=Math.hypot(e.a.x-e.b.x,e.a.y-e.b.y);
  const ready=e.kept||(age>650&&distance<limit&&Math.hypot(e.a.vx,e.a.vy)+Math.hypot(e.b.vx,e.b.vy)<3);
  const target=e.wanted&&ready?1:0;
  e.alpha+=(target-e.alpha)*Math.min(1,dt*(target?.035:.15));
 }
 return links.filter(e=>e.wanted||e.alpha>.008);
}
