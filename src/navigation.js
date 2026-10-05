export function mountNavigation(){
 const entries=[['revelation-cinema','Watch the stories'],['cast-of-shadows','Meet the players'],['theatre','Follow the vote groups'],['episode-pacing','Feel the episode breaks'],['players','Compare the players'],['anatomy','See every round']];
 const $=s=>document.querySelector(s),appendix=$('#evidence-room');
 // The reading order and the navigation order are the same.
 for(const [id] of entries.slice(2))appendix.append($('#'+id));
 const closing=appendix.querySelector('.closing');if(closing)appendix.append(closing);
 const hud=document.createElement('nav');hud.className='journey-hud';hud.setAttribute('aria-label','Page navigation');
 hud.innerHTML=`<button class="hud-return" hidden>↶ Return</button><button class="hud-previous" aria-label="Previous section">←</button><div class="hud-location"><small>You are here</small><strong id="hud-location"></strong><span class="hud-progress"><i></i></span></div><button class="hud-menu-button" aria-expanded="false" aria-controls="hud-menu">Sections <span aria-hidden="true">☰</span></button><button class="hud-next">Next <span aria-hidden="true">→</span></button><div id="hud-menu" hidden><span class="eyebrow">Choose where to go</span>${entries.map(([id,label])=>`<a href="#${id}">${label}<span aria-hidden="true">→</span></a>`).join('')}<button data-open-method>Sources and methods ↗</button></div>`;
 document.body.append(hud);let current=0,origin=null,queued=false;
 const menu=$('#hud-menu'),toggle=$('.hud-menu-button');
 function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');}
 function currentSection(){let found=0;for(let i=0;i<entries.length;i++){const el=$('#'+entries[i][0]);if(el.getClientRects().length&&el.getBoundingClientRect().top<innerHeight*.38)found=i;}return found;}
 function update(){queued=false;current=currentSection();const el=$('#'+entries[current][0]),rect=el.getBoundingClientRect();
  $('#hud-location').textContent=entries[current][1];
  const activeFilm=document.querySelector('.reel-picker [aria-pressed="true"]');
  $('.hud-location small').textContent=current===0&&activeFilm?'Story '+activeFilm.querySelector('small').textContent+' of '+document.querySelectorAll('.reel-picker button').length:'You are here';
$('.hud-previous').disabled=current===0;
  $('.hud-next').textContent=current===entries.length-1?'Back to stories ↑':'Next →';$('.hud-next').setAttribute('aria-label',current===entries.length-1?'Back to stories':'Next: '+entries[current+1][1]);
  $('.hud-previous').setAttribute('aria-label',current?'Previous: '+entries[current-1][1]:'Previous section');
  $('.hud-progress i').style.width=Math.max(0,Math.min(100,(innerHeight*.38-rect.top)/Math.max(1,rect.height)*100))+'%';
  menu.querySelectorAll('a').forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
 function remember(){origin={id:entries[current][0],offset:$('#'+entries[current][0]).getBoundingClientRect().top};$('.hud-return').hidden=false;$('.hud-return').setAttribute('aria-label','Return to '+entries[current][1]);}
 function go(id){closeMenu();remember();document.dispatchEvent(new CustomEvent('unseen:navigate'));const el=$('#'+id);if(appendix.contains(el))appendix.open=true;if(location.hash==='#'+id)land();else location.hash=id;}
 function land(){closeMenu();if(location.hash==='#ghosts')history.replaceState(null,'','#theatre');const id=location.hash.slice(1),el=document.getElementById(id);if(el&&entries.some(([key])=>key===id)){if(appendix.contains(el))appendix.open=true;requestAnimationFrame(()=>{el.setAttribute('tabindex','-1');el.focus({preventScroll:true});el.scrollIntoView({block:'start',behavior:'instant'});schedule();});}}
 toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));});
 $('.hud-next').addEventListener('click',()=>go(entries[(current+1)%entries.length][0]));
 $('.hud-previous').addEventListener('click',()=>{if(current)go(entries[current-1][0]);});
 $('.hud-return').addEventListener('click',()=>{if(!origin)return;closeMenu();document.dispatchEvent(new CustomEvent('unseen:navigate'));const el=$('#'+origin.id);if(appendix.contains(el))appendix.open=true;history.replaceState(null,'','#'+origin.id);el.setAttribute('tabindex','-1');el.focus({preventScroll:true});window.scrollTo({top:scrollY+el.getBoundingClientRect().top-origin.offset,behavior:'instant'});origin=null;$('.hud-return').hidden=true;schedule();});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&!a.classList.contains('skip-link')){remember();closeMenu();document.dispatchEvent(new CustomEvent('unseen:navigate'));}if(!hud.contains(e.target))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});
 document.addEventListener('unseen:watch',remember,true);document.addEventListener('unseen:jump',e=>{if(entries.some(([id])=>id===e.detail))go(e.detail);});document.addEventListener('unseen:navigate',closeMenu);
 new MutationObserver(schedule).observe(document.querySelector('.reel-picker'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('hashchange',land);appendix.addEventListener('toggle',schedule);update();land();
}
