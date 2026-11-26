(function(){
 const left=document.querySelector('.layout>.left');
 const label=document.getElementById('floorLabel');
 const back=document.getElementById('backFloor1');
 const viewport=document.getElementById('viewport');
 if(!left||!label||!back||!viewport)return;
 const row=document.createElement('div');row.id='dungeonFloorRow';
 left.insertBefore(row,viewport);row.append(label,back);
 // Retain the existing floor-change handlers and show/hide behavior.
 if(typeof fitBoard==='function')fitBoard();
 window.addEventListener('resize',()=>{if(typeof fitBoard==='function')fitBoard()});
})();

(function(){
 const unlockKey='mochiusa_character_unlock_tenseiryu_v1', choiceKey='mochiusa_character_choice_v1';
 const panel=document.getElementById('dungeonActionPanel'),book=document.getElementById('openBook');
 if(!panel||!book)return;
 const button=document.createElement('button');button.type='button';button.id='openCharacter';button.textContent='🐉 キャラ へんこう';button.hidden=true;book.insertAdjacentElement('afterend',button);
 const originalFrame=frame;
 const directions=['down','right','up','left'];
 const catKey='mochiusa_character_unlock_kagineko_v1',chronoKey='mochiusa_character_unlock_jikuronosu_v1',images=new Map();
 function unlocked(){return parent.__teacherMode===true||localStorage.getItem(unlockKey)==='1'}
 function catUnlocked(){return parent.__teacherMode===true||localStorage.getItem(catKey)==='1'}
 function chronoUnlocked(){return parent.__teacherMode===true||localStorage.getItem(chronoKey)==='1'}
 function selected(){if(tutorialActive)return 'mochiusa';const k=localStorage.getItem(choiceKey);return k==='tenseiryu'&&unlocked()?k:k==='kagineko'&&catUnlocked()?k:k==='jikuronosu'&&chronoUnlocked()?k:'mochiusa'}
 function preload(k){if(k==='mochiusa'||images.has(k))return;const list=[];for(const d of directions)for(let i=0;i<4;i++){const img=new Image();img.src='images/'+k+'_'+d+'_'+i+(k==='tenseiryu'?'.png':'.webp');list.push(img)}images.set(k,list)}
 function dragonFrame(i){const k=selected();sprite.src='images/'+k+'_'+directions[dir]+'_'+i+(k==='tenseiryu'?'.png':'.webp')}
 frame=function(row){const k=selected();sprite.style.scale=k==='jikuronosu'?'1.4':'';sprite.style.transformOrigin=k==='jikuronosu'?'center bottom':'';if(k!=='mochiusa'){preload(k);dragonFrame(row===2?3:row===1?2:0)}else originalFrame(row)};
 const originalHop=hop;
 hop=async function(nx,ny){
  const k=selected();if(k==='mochiusa')return originalHop(nx,ny);
  const sx=x,sy=y,start=performance.now(),ms=k==='jikuronosu'?650:440;
  await new Promise(resolve=>{function tick(t){const p=Math.min(1,(t-start)/ms),lift=Math.sin(Math.PI*p)*(k==='kagineko'?12:k==='jikuronosu'?0:32);position(sx+(nx-sx)*p,sy+(ny-sy)*p,lift);dragonFrame(k!=='tenseiryu'?Math.min(3,Math.floor(p*4)):p<.18?1:p<.78?2:3);shadow.style.transform='scale('+(1-lift/95)+')';shadow.style.opacity=String(1-lift/65);if(p<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});
  x=nx;y=ny;state.x=x;state.y=y;state.steps++;position(x,y);frame(0);shadow.style.transform='';shadow.style.opacity='1';
 };
 function refresh(){if(!tutorialActive){if(currentFloor>=5||Array.from({length:13},(_,i)=>i+5).some(f=>validFloor(readFloor(f))))localStorage.setItem(unlockKey,'1');if(currentFloor>=3||Array.from({length:15},(_,i)=>i+3).some(f=>validFloor(readFloor(f))))localStorage.setItem(catKey,'1');if(currentFloor>=10||Array.from({length:8},(_,i)=>i+10).some(f=>validFloor(readFloor(f))))localStorage.setItem(chronoKey,'1')}const visible=!tutorialActive&&(unlocked()||catUnlocked()||chronoUnlocked());button.hidden=!visible;button.style.display=visible?'':'none'}
 const originalSave=save;save=function(){originalSave();refresh()};
 button.addEventListener('click',()=>{
  if(moving||tutorialActive||(!unlocked()&&!catUnlocked()&&!chronoUnlocked()))return;
  const modal=document.getElementById('dungeonModal'),body=document.getElementById('dungeonModalBody'),heading=document.getElementById('dungeonModalTitle');
  heading.textContent='キャラクターを えらぼう';body.replaceChildren();
  const grid=document.createElement('div');grid.style.cssText='display:flex;gap:12px;justify-content:center;flex-wrap:wrap';
  for(const [key,name,src] of [['mochiusa','モチウサ',sprites['0_0']],['kagineko','カギネコ','images/kagineko_down_0.webp'],['tenseiryu','テンセイリュウ','images/tenseiryu_down_0.png'],['jikuronosu','ジクロノス','images/jikuronosu_down_0.webp']].filter(([k])=>k==='mochiusa'||(k==='kagineko'?catUnlocked():k==='jikuronosu'?chronoUnlocked():unlocked()))){
   const b=document.createElement('button');b.type='button';b.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;min-width:120px';
   const img=document.createElement('img');img.src=src;img.alt='';img.style.cssText='width:100px;height:100px;object-fit:contain';if(key==='jikuronosu')img.style.scale='1.4';if(key===selected()){b.style.outline='3px solid #fff4a0';b.style.outlineOffset='2px'}b.append(img,document.createTextNode(name));
   b.onclick=()=>{localStorage.setItem(choiceKey,key);frame(0);modal.classList.remove('active')};grid.append(b);
  }body.append(grid);modal.classList.add('active');
 });
 refresh();frame(0);
})();

(function(){const panel=document.getElementById('dungeonActionPanel');if(!panel||document.getElementById('backTitle'))return;const b=document.createElement('button');b.type='button';b.id='backTitle';b.textContent='🏠 タイトルへ';panel.append(b);b.addEventListener('click',()=>{if(moving)return;if(!confirm('タイトルがめんに もどる？'))return;save();parent.__returnToTitle()});if(typeof fitBoard==='function')fitBoard()})();
