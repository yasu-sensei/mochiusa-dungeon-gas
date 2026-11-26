
const sprites={"0_0": "images/d53232930153cc8f.webp", "1_0": "images/f5dcbe15f535a4df.webp", "2_0": "images/bb3db842589154ec.webp", "3_0": "images/b55a6d9923b5e164.webp", "0_1": "images/730627ffc9482751.webp", "1_1": "images/09cf6c5b24dd376d.webp", "2_1": "images/3b0c448009ba91e7.webp", "3_1": "images/897f4e9810605dfa.webp", "0_2": "images/debc4eea12212ab4.webp", "1_2": "images/c0034a1b1a4ef1c9.webp", "2_2": "images/434981431e8e88d7.webp", "3_2": "images/55db315f32922f5a.webp"};
const N=10, TOTAL=100, KEY='mochiusa_underground_B1_prototype_10x10_v1';
const FLOOR_KEY_2='mochiusa_underground_B2_prototype_10x10_v1';
const FLOOR_ACTIVE_KEY='mochiusa_underground_active_floor_v16';
const tutorialDone='mochiusa_core_tutorial_done',tutorialPhaseKey='mochiusa_core_tutorial_phase';let tutorialPhase=Number(localStorage.getItem(tutorialPhaseKey))||0;let tutorialActive=parent.__coreTutorialReplay===true||(!localStorage.getItem(tutorialDone)&&!localStorage.getItem(KEY));if(parent.__coreTutorialReplay){localStorage.removeItem('mochiusa_core_floor0');localStorage.removeItem(tutorialPhaseKey);tutorialPhase=0;}let currentFloor=tutorialActive?(tutorialPhase===1?1:0):Math.max(1,Math.min(17,Number(localStorage.getItem(FLOOR_ACTIVE_KEY))||1));
function floorKey(f){return f===0?'mochiusa_core_floor0':f===1?KEY:f===2?FLOOR_KEY_2:'mochiusa_underground_B'+f+'_prototype_10x10_v1';}
function readFloor(f){try{return JSON.parse(localStorage.getItem(floorKey(f)))}catch(e){return null}}
function validFloor(s){return s&&Array.isArray(s.open)&&Array.isArray(s.found)&&Array.isArray(s.types)&&s.types.length===TOTAL}

const viewport=document.getElementById('viewport');const board=document.getElementById('board'),actor=document.getElementById('actor'),sprite=document.getElementById('sprite'),shadow=document.getElementById('shadow');
const msg=document.getElementById('msg');const eventOverlay=document.getElementById('eventOverlay'),eventText=document.getElementById('eventText'),eventHint=document.getElementById('eventHint');let eventDone=null;const ITEM_NAMES=['つるはし','つるはし','つるはし','つるはし','つるはし','つるはし','つるはし','かいふくやく','かいふくやく','かいふくやく','456ダイス','456ダイス','ぼろぼろの たて'];function itemName(i){if(currentFloor===0)return '456ダイス';const all=state.types.map((t,j)=>t==='item'?j:-1).filter(j=>j>=0).sort((a,b)=>a-b);return ITEM_NAMES[all.indexOf(i)]||'アイテム'}function showEvent(label,needsTap){eventText.textContent=label;eventHint.textContent=needsTap?'タップして すすむ':'';eventOverlay.hidden=false;return new Promise(resolve=>{let done=false;let timer=null;const finish=()=>{if(done)return;done=true;clearTimeout(timer);eventOverlay.hidden=true;eventOverlay.onclick=null;resolve()};eventOverlay.onclick=finish;if(!needsTap)timer=setTimeout(finish,1900)})}function updateInfo(){const foundItems=state.found.filter(i=>state.types[i]==='item').map(itemName);const counts={};for(const name of foundItems)counts[name]=(counts[name]||0)+1;const extra=state.wallet?.items||{};const lines=[['⛏️ つるはし',Math.max(0,state.pick||0)],['🧪 かいふくやく',Math.max(0,(counts['かいふくやく']||0)+(extra.heal||0)-(state.wallet?.itemsSpent?.heal||0))],['🎲 456ダイス',Math.max(0,(counts['456ダイス']||0)+(extra.dice||0)-(state.wallet?.itemsSpent?.dice||0))],['🛡️ ぼろぼろの たて',Math.max(0,(counts['ぼろぼろの たて']||0)+(extra.shield||0)-(state.wallet?.itemsSpent?.shield||0))]];document.getElementById('inventory').innerHTML=lines.map(([name,n])=>'<div class="inventoryLine"><span>'+name+'</span><strong>'+n+'</strong></div>').join('');const h=state.history||[];document.getElementById('history').innerHTML=h.length?h.slice(-5).reverse().map(t=>'<div class="historyLine">'+t+'</div>').join(''):'まだ はっけんは ないよ'}let x=5,y=5,dir=0,moving=false,activeTarget=-1;
function create(floor=currentFloor){
 if(floor===0){const types=Array(TOTAL).fill('empty');types[57]='item';types[47]='monster';types[37]='special';types[36]='stairs';return {x:5,y:5,pick:1,open:[55],types,found:[],steps:0,wallet:{ticket:0,items:{heal:0,dice:0,shield:0}}};}
  const types=Array(TOTAL).fill('empty'),start=55;
  const pool=[];for(let i=0;i<TOTAL;i++)if(i!==start)pool.push(i);
  let seed=20261117+floor*7919;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  let at=0;
  for(const [type,count] of [['item',13],['monster',10],['wood',3],['emptywood',1],['mimic',1],['silver',2],['gold',1],['stairs',1],['special',1]])
    for(let j=0;j<count;j++)types[pool[at++]]=type;
  return {x:5,y:5,pick:15,open:[start],types,found:[],steps:0,wallet:{ticket:0,items:{heal:0,dice:0,shield:0}}};
}
let state=tutorialActive&&currentFloor===1?create(1):readFloor(currentFloor);if(!validFloor(state))state=create(currentFloor);
if(!tutorialActive&&currentFloor===1&&localStorage.getItem('mochiusa_tutorial_bonus_pending')==='1'){state.pick=15;localStorage.setItem(floorKey(1),JSON.stringify(state));localStorage.removeItem('mochiusa_tutorial_bonus_pending');}
// つるはしとアイテムは階をまたいで引き継ぐ。
const priorFloor=Array.from({length:17},(_,i)=>i+1).filter(f=>f!==currentFloor).map(readFloor).filter(validFloor).sort((a,b)=>(b._sharedAt||0)-(a._sharedAt||0))[0];
if(!tutorialActive&&validFloor(priorFloor)&&priorFloor._sharedAt>(state._sharedAt||0)){state.pick=priorFloor.pick;state.wallet=priorFloor.wallet;}
x=state.x;y=state.y;
const icons={item:'',monster:'👾',wood:'‼️',emptywood:'‼️',mimic:'‼️',silver:'‼️',gold:'‼️',stairs:'🌀',special:'💎',empty:''};const cells=[];
function save(){updateFloorLabel();if(tutorialActive&&currentFloor===1)return;state._sharedAt=Date.now();localStorage.setItem(floorKey(currentFloor),JSON.stringify(state));if(!tutorialActive)localStorage.setItem(FLOOR_ACTIVE_KEY,String(currentFloor));updateFloorLabel();}function updateFloorLabel(){const label=document.getElementById('floorLabel');if(label)label.textContent='地下'+currentFloor+'階';const back=document.getElementById('backFloor1');if(back)back.style.display=(currentFloor>1||tutorialActive&&currentFloor===1)?'block':'none';}
function finishCoreTutorial(){localStorage.setItem(tutorialDone,'1');localStorage.removeItem(tutorialPhaseKey);localStorage.setItem('mochiusa_medal_00','1');if(!localStorage.getItem(KEY)){localStorage.setItem(FLOOR_ACTIVE_KEY,'1');localStorage.setItem('mochiusa_tutorial_bonus_pending','1');}moving=true;alert('🎉 チュートリアル クリア！\nタイトルから ぼうけんを はじめよう！');parent.__returnToTitle();}
function moveFloor(next){
 if(next<0||next>17||next===0&&!tutorialActive)return;
 if(tutorialActive){
 if(currentFloor===1&&next===0){finishCoreTutorial();return;}
 if(currentFloor===0&&next===1&&tutorialPhase===2){finishCoreTutorial();return;}
 if(currentFloor===0&&next===1){tutorialPhase=1;localStorage.setItem(tutorialPhaseKey,'1');}
 }
 save();const sharedPick=state.pick,sharedWallet=state.wallet;
 currentFloor=next;
 let nextState=tutorialActive&&next===1?create(1):readFloor(next);
 if(!validFloor(nextState))nextState=create(next);
 state=nextState; if(!tutorialActive){state.pick=sharedPick;state.wallet=sharedWallet;} if(!tutorialActive&&next===1&&tutorialPhase===2){state.pick=15;tutorialPhase=0;}
 x=state.x;y=state.y;dir=0;activeTarget=-1;
 position(x,y);frame(0);render();window.dispatchEvent(new Event('chitei-special-found'));
 if(tutorialActive)tutorialHint();else msg.textContent='🐰 ちか'+next+'かいに とうちゃく！ とくべつな おたからを さがそう！';
}
function idx(a,b){return b*N+a}function isNear(a,b){return Math.abs(a-x)+Math.abs(b-y)===1}function fitBoard(){const size=Math.min(viewport.clientWidth,viewport.clientHeight);board.style.width=size+'px';board.style.height=size+'px'}function camera(px,py){viewport.scrollLeft=0;viewport.scrollTop=0;drawMinimap()}function position(px,py,lift=0){actor.style.transform=`translate(${px*100}%,${py*100}%) translateY(${-lift}%)`;camera(px,py)}function frame(row){sprite.src=sprites[dir+'_'+row]}
const DUNGEON_TILE_THEMES={1:{2:'images/8668b57230f187c4.webp'},2:{0:'images/13d2f986df447f08.webp',1:'images/e10bd36c6faae98e.webp',2:'images/541c2e000b191b89.webp'},3:{0:'images/ea0f14b9dd0b8083.webp',1:'images/f23915ac1d006c79.webp',2:'images/b9e25da872c8bfcc.webp'},4:{0:'images/529ec98360a49069.webp',1:'images/8b19785143549fe0.webp',2:'images/6218f21965241e45.webp'},5:{0:'images/bae5d43bfcbdd4f9.webp',1:'images/685be9a2b4fc43ec.webp',2:'images/c5e8e4458661ca7c.webp'},6:{0:'images/c28ba2ec4eddc85c.webp',1:'images/21f2d158b392e456.webp',2:'images/7a2d130b3a9ef214.webp'},7:{0:'images/e366138e2de8316a.webp',1:'images/ffcc5bb602b96d7e.webp',2:'images/a0b8f23a0a370d61.webp'},8:{0:'images/9ef1665de543185a.webp',1:'images/24f06273d99b0c19.webp',2:'images/2adb202bbd3d99a2.webp'}};
const dungeonThemeStyle=document.createElement('style');dungeonThemeStyle.textContent=`
#board.dungeon-themed .cell.hidden{background-image:var(--dungeon-hidden)!important;background-size:100% 100%!important;background-position:center!important}
#board.dungeon-themed .cell.open{background-image:var(--dungeon-open)!important;background-size:100% 100%!important;background-position:center!important}
#board .cell.open.warp{background-image:var(--dungeon-warp)!important;background-size:100% 100%!important;background-position:center!important}
`;document.head.appendChild(dungeonThemeStyle);
let activeThemeZone=0;
function applyDungeonTheme(){
 const zone=Math.max(1,Math.min(8,Math.floor((currentFloor-1)/5)+1));
 if(zone===activeThemeZone)return;
 activeThemeZone=zone;
 const tiles=DUNGEON_TILE_THEMES[zone];
 // Preserve original first-area approved hidden/open textures exactly.
 if(zone===1){board.classList.remove('dungeon-themed');board.style.removeProperty('--dungeon-hidden');board.style.removeProperty('--dungeon-open');}
 else{board.classList.add('dungeon-themed');board.style.setProperty('--dungeon-hidden',`url("${tiles[0]}")`);board.style.setProperty('--dungeon-open',`url("${tiles[1]}")`);}
 board.style.setProperty('--dungeon-warp',`url("${tiles[2]}")`);
}
function tutorialTarget(){if(!tutorialActive||currentFloor!==0)return -1;if(!state.open.includes(56))return 56;if(!state.tutorialStudy?.kanji||!state.tutorialStudy?.katakana)return -1;if(state.pick===0&&!state.open.includes(36))return -1;if(!state.found.includes(57))return 57;if(!state.found.includes(47))return 47;if(!state.found.includes(37))return 37;if(!state.tutorialBook)return -1;return 36;}function tutorialHint(){if(!tutorialActive)return;const target=tutorialTarget();for(const c of cells)c.classList.remove('tutorialGlow');for(const id of ['openStudy','openBook','backFloor1'])document.getElementById(id)?.classList.remove('tutorialGlow');if(currentFloor===1){msg.textContent='ひとつ うえの かいに もどろう！';document.getElementById('backFloor1')?.classList.add('tutorialGlow');return;}if(target>=0){cells[target]?.classList.add('tutorialGlow');msg.textContent=target===36?'ひかる マスの ワープゲートへ！':'ひかる いわを タップして ほろう！';}else if(!state.tutorialStudy?.kanji||!state.tutorialStudy?.katakana||state.pick===0){msg.textContent='かん字と カタカナを 3もんずつ べんきょうしよう！';document.getElementById('openStudy')?.classList.add('tutorialGlow');}else{msg.textContent='ずかんで おたからを みよう！';document.getElementById('openBook')?.classList.add('tutorialGlow');}}const tutorialCSS=document.createElement('style');tutorialCSS.textContent='.tutorialGlow{outline:3px solid #fff18a!important;outline-offset:-3px;animation:tutorialGlow .7s infinite alternate}@keyframes tutorialGlow{to{filter:brightness(1.6)}}';document.head.append(tutorialCSS);function render(){applyDungeonTheme();for(let i=0;i<TOTAL;i++){const c=cells[i],open=state.open.includes(i),cx=i%N,cy=Math.floor(i/N);c.className='cell '+(open?'open':'hidden')+(open&&state.types[i]==='stairs'?' warp':'')+(open&&cx===x&&cy===y?' current':'')+(!open&&isNear(cx,cy)?' reachable':'')+(activeTarget===i?' target':'');c.textContent=open&&state.types[i]==='stairs'?'':open&&!state.found.includes(i)?(state.types[i]==='item'?(POP_ICONS[itemName(i)]||'❔'):icons[state.types[i]]):''}document.getElementById('pick').textContent='⛏️ つるはし：'+(parent.__teacherMode?'∞':Math.max(0,state.pick||0))+'ほん';document.getElementById('progress').textContent='発掘済み：'+state.open.length+'/100マス';document.getElementById('found').textContent='ジャンプ：'+state.steps+'回';updateInfo();save();drawMinimap();if(tutorialActive&&!moving)tutorialHint()}
for(let i=0;i<TOTAL;i++){const c=document.createElement('div');c.style.left=(i%N)*100/N+'%';c.style.top=Math.floor(i/N)*100/N+'%';c.addEventListener('click',()=>select(i));board.insertBefore(c,actor);cells.push(c)}
async function hop(nx,ny){let sx=x,sy=y,ms=440,start=performance.now();await new Promise(resolve=>{function tick(t){let p=Math.min(1,(t-start)/ms),lift=Math.sin(Math.PI*p)*32;position(sx+(nx-sx)*p,sy+(ny-sy)*p,lift);frame(p<.22?0:p<.63?1:2);shadow.style.transform=`scale(${1-lift/95})`;shadow.style.opacity=String(1-lift/65);if(p<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});x=nx;y=ny;state.x=x;state.y=y;state.steps++;position(x,y);frame(0);shadow.style.transform='';shadow.style.opacity='1'}
function findPath(destination){const start=idx(x,y);if(destination===start)return [start];const queue=[start],parent=Array(TOTAL).fill(-1);parent[start]=start;for(let qi=0;qi<queue.length;qi++){const cur=queue[qi],cx=cur%N,cy=Math.floor(cur/N);for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=N||ny>=N)continue;const ni=idx(nx,ny);if(parent[ni]!==-1||!state.open.includes(ni))continue;parent[ni]=cur;if(ni===destination){const path=[ni];while(path[0]!==start)path.unshift(parent[path[0]]);return path}queue.push(ni)}}return null}
function pause(ms){return new Promise(r=>setTimeout(r,ms))}
async function dig(i){const c=cells[i];c.classList.add('digging');msg.textContent='⛏️ つるはしで いわを くだいているよ！';await pause(850);c.classList.remove('digging');if(!parent.__teacherMode||tutorialActive)state.pick=Math.max(0,(state.pick||0)-1);state.open.push(i);render();msg.textContent='✨ いわが くだけた！'}
// v0.7: 宝箱・じゃんけんの試作。モチウサの画像とジャンプ関数は変更しない。
const interaction=document.getElementById('interaction'),interactionTitle=document.getElementById('interactionTitle'),interactionBody=document.getElementById('interactionBody'),interactionActions=document.getElementById('interactionActions');
function dialog(title,body,choices){return new Promise(resolve=>{interactionTitle.textContent=title;interactionBody.textContent=body;interactionActions.replaceChildren();interaction.hidden=false;for(const [label,value] of choices){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{interaction.hidden=true;interactionActions.replaceChildren();resolve(value)};interactionActions.append(b)}})}
function addHistory(t){state.history=state.history||[];state.history.push(t);state.history=state.history.slice(-12);msg.textContent=t;render()}
function ensureWallet(){
 state.wallet=state.wallet||{ticket:0,items:{}};
 state.wallet.items=state.wallet.items||{};
 return state.wallet;
}
// 報酬はショップ・コイン・旧コレクションを使わない。
function reward(type,amount=1){
 const w=ensureWallet();let text='';
 if(type==='ticket'){return reward('pick',amount)}
 else if(type==='pick'){state.pick+=amount;text='⛏️ つるはしを '+amount+'ほん ゲット！'}
 else{
  const defs={heal:['heal','🧪 かいふくやく'],dice:['dice','🎲 456ダイス'],shield:['shield','🛡️ ぼろぼろの たて']};
  const def=defs[type];if(!def)return '';
  w.items[def[0]]=(w.items[def[0]]||0)+amount;
  text=def[1]+'を '+amount+'こ ゲット！';
 }
 addHistory(text);return text;
}
const REWARD_POOL=[['heal',25],['dice',25],['shield',25],['pick',25]];
function chooseReward(pool=REWARD_POOL){const total=pool.reduce((n,r)=>n+r[1],0);let roll=Math.random()*total;for(const [name,weight] of pool){roll-=weight;if(roll<0)return name}return pool[pool.length-1][0]}
function rewardPreview(type){return ({heal:'🧪 かいふくやく 1こ',dice:'🎲 456ダイス 1こ',shield:'🛡️ ぼろぼろの たて 1こ',pick:'⛏️ つるはし 1ほん'})[type]||''}
function chanceReward(){// モンスター勝利時：50%でアイテムを1個ドロップ
 if(Math.random()>=0.5)return '';
 return reward(chooseReward([['pick',20],['heal',30],['dice',25],['shield',25]]));
}
// v1.7.2: 階が深くなるほど強敵が少しずつ増える。既存の10マス配置は維持。
const CHITEI_MONSTER_NAMES=['アリへい','ガンリュウム','ガイコツ騎士','マガンメン'];
// v1.7.3: 各階のモンスターマス10個を5/3/1/1に固定。既存のマス配置は変更しない。
let chiteiEncounterMonster=0;
function chiteiMonsterForCell(i){
 const monsterCells=state.types.map((type,index)=>type==='monster'?index:-1).filter(index=>index>=0);
 // マスごとに決定的な乱数を割り当て、保存・再開後も同じ敵になる。
 function hash(index){
  let n=((currentFloor*2654435761)^(index*2246822519)^0x8e6d32b1)>>>0;
  n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);n^=n>>>16;
  return n>>>0;
 }
 monsterCells.sort((a,b)=>hash(a)-hash(b)||a-b);
 const position=monsterCells.indexOf(i);
 if(position<0)return 0;
 if(position<5)return 0;
 if(position<8)return 1;
 if(position===8)return 2;
 return 3;
}
async function monsterEncounter(i,fromChest=false){
  const overlay=document.getElementById('monsterEncounter');
  const tile=(Number.isInteger(i)&&i>=0&&cells[i])?cells[i]:viewport;
  const rect=tile.getBoundingClientRect();
  const cx=fromChest?window.innerWidth/2:rect.left+rect.width/2,cy=fromChest?window.innerHeight*.48:rect.top+rect.height/2;
  overlay.style.setProperty('--enc-x',cx+'px');
  overlay.style.setProperty('--enc-y',cy+'px');
  // 毎回アニメーションを最初から再生する
  overlay.hidden=false;
  overlay.classList.remove('enc-shake');
  void overlay.offsetWidth;
  overlay.classList.add('enc-shake');
  await pause(2800);
  overlay.hidden=true;
  overlay.classList.remove('enc-shake');
}

function chiteiBattleItemCounts(){
 const counts={heal:0,dice:0,shield:0};
 const lookup={'かいふくやく':'heal','456ダイス':'dice','ぼろぼろの たて':'shield'};
 if(Array.isArray(state.found))for(const i of state.found){
  if(state.types?.[i]==='item'){
   const k=lookup[itemName(i)];if(k)counts[k]++;
  }
 }
 const w=ensureWallet();
 for(const k of Object.keys(counts))counts[k]=Math.max(0,counts[k]+(Number(w.items[k])||0)-(Number(w.itemsSpent?.[k])||0));
 return counts;
}
async function battle(isMimic,testOnly=false){
  return new Promise(resolve=>{
    const layer=document.getElementById('integratedBattle');
    const frame=document.getElementById('integratedBattleFrame');
    const battleData=document.getElementById('integratedBattleData').textContent.trim();
    const battlePickReward=currentFloor===0?3:1+Math.floor(Math.random()*3);
    const pool=[['heal',30],['dice',25],['shield',25]];
    const battleDrops=currentFloor===0?[]:isMimic?['heal','dice','shield']:(chiteiEncounterMonster===2||chiteiEncounterMonster===3)?[chooseReward(pool),chooseReward(pool)]:Math.random()<0.5?[chooseReward(pool)]:[];
    let completed=false;
    function finish(ev){
      if(ev.source!==frame.contentWindow||!ev.data||ev.data.type!=='mochiusa-battle-result-v1'||completed)return;
      completed=true;window.removeEventListener('message',finish);window.removeEventListener('message',itemBridge);
      const win=ev.data.win===true;
      layer.hidden=true;frame.removeAttribute('srcdoc');
      if(testOnly){msg.textContent=win?'🧪 ミミックとの テストバトルに かった！':'🧪 テストバトルが おわったよ（きろくは そのまま）'}
      else if(win){
        const count=battlePickReward;
        reward('pick',count);
        for(const item of battleDrops)reward(item);
        msg.textContent='🎉 しょうり！ つるはしを '+count+'ほん ゲット！';
      }
      else{
        const lost=Math.min(2,Math.max(0,Number(state.pick)||0));
        state.pick=Math.max(0,(Number(state.pick)||0)-lost);
        msg.textContent='💦 まけちゃった… つるはしが '+lost+'ほん へったよ';
        addHistory(msg.textContent);
      }
      if(!testOnly)save();
      render();resolve(win);
    }
    function itemBridge(ev){
      if(ev.source!==frame.contentWindow||ev.data?.type!=='chitei-item-used'||completed)return;
      const k=ev.data.item;
      if(!['heal','dice','shield'].includes(k))return;
      const w=ensureWallet();
      w.itemsSpent=w.itemsSpent||{};
      if(chiteiBattleItemCounts()[k]<=0)return;
      w.itemsSpent[k]=(Number(w.itemsSpent[k])||0)+1;
      save();render();
    }
    window.addEventListener('message',itemBridge);
    function initItems(){try{frame.contentWindow?.postMessage({type:'chitei-item-init',items:chiteiBattleItemCounts()},'*')}catch(e){}}
    frame.addEventListener('load',initItems,{once:true});
    window.addEventListener('message',finish);
    layer.hidden=false;
    const monsterIndex=isMimic?3:Math.max(0,Math.min(3,Number(chiteiEncounterMonster)||0));
    frame.srcdoc=new TextDecoder().decode(Uint8Array.from(atob(battleData),c=>c.charCodeAt(0))).replace('__MONSTER_INDEX__',String(monsterIndex)).replace('<script src="js/dungeon-data2-1.js">','<script>window.__tutorialBattle='+String(currentFloor===0)+';<\/script><script src="js/dungeon-data2-1.js">').replace('<script src="js/dungeon-data2-2.js">','<script>window.__tutorialBattle='+String(currentFloor===0)+';window.__MONSTER_INDEX__='+monsterIndex+';window.__battlePickReward='+battlePickReward+';window.__battlePickLoss='+Math.min(2,Math.max(0,Number(state.pick)||0))+';window.__battleTestOnly='+Boolean(testOnly)+';window.__battleDrops='+JSON.stringify(battleDrops)+';<\/script><script src="js/dungeon-data2-2.js">');
  });
}
async function openChest(type,i,testOnly=false){
  const layer=document.getElementById('integratedChest'),frame=document.getElementById('integratedChestFrame');
  const data=document.getElementById('integratedChestData').textContent.trim();
  const source=new TextDecoder().decode(Uint8Array.from(atob(data),c=>c.charCodeAt(0)));
  return new Promise(resolve=>{
    let finished=false,opened=false;
    const cleanup=()=>{if(finished)return;finished=true;window.removeEventListener('message',receive);layer.hidden=true;frame.removeAttribute('srcdoc');resolve()};
    const receive=async ev=>{
      if(finished||ev.source!==frame.contentWindow||ev.data?.type!=='mochiusa-chest-v1')return;
      if(ev.data.event==='ready'){frame.contentWindow.postMessage({type:'mochiusa-chest-start',kind:type},'*')}
      else if(ev.data.event==='mimic'){
        cleanup();if(!testOnly)addHistory('😈 ミミックが あらわれた！');await monsterEncounter(i,true);await battle(true,testOnly);
      }else if(ev.data.event==='opened'&&!opened){
        opened=true;let rewards=[];
        if(type==='emptywood'){if(!testOnly)addHistory('📦 からっぽ だった！');rewards=['📦 からっぽ だった！']}
        else{
          // 木箱1個・銀箱2個・金箱3個。4種類を均等確率で独立抽選（重複可）。交換チケットは対象外。
          const count=type==='gold'?3:type==='silver'?2:1;
          for(let n=0;n<count;n++){
            const choice=chooseReward();
            rewards.push(testOnly?rewardPreview(choice):reward(choice));
          }
        }
        frame.contentWindow.postMessage({type:'mochiusa-chest-reward',text:rewards.join(' ／ ')},'*');
      }else if(ev.data.event==='closed'){cleanup()}
    };
    window.addEventListener('message',receive);layer.hidden=false;frame.srcdoc=source;
  });
}
const POP_ICONS={'つるはし':'⛏️','かいふくやく':'🧪','456ダイス':'🎲','ぼろぼろの たて':'🛡️'};
async function excavationPop(i,emoji){
 const el=document.getElementById('excavationPop');
 const target=cells[i];if(!el||!target)return;
 const rect=target.getBoundingClientRect();
 el.style.left=(rect.left+rect.width/2)+'px';el.style.top=(rect.top+rect.height/2)+'px';
 el.textContent=emoji;el.classList.remove('pop-active');void el.offsetWidth;el.classList.add('pop-active');
 await pause(850);el.classList.remove('pop-active');el.textContent='';
}
async function discover(i){const type=state.types[i];if(state.found.includes(i)||type==='empty')return false;
// 一度だけ処理する。イベント中の二重操作を防ぐ。
if(type==='special'&&typeof window.chiteiAwardTreasure==='function')await window.chiteiAwardTreasure(currentFloor);state.found.push(i);if(type==='special')window.dispatchEvent(new Event('chitei-special-found'));let label='',tap=false;
if(type==='item'){const name=itemName(i);await excavationPop(i,POP_ICONS[name]||'❔');if(name==='つるはし')label=reward('pick');else{const labels={'かいふくやく':'🧪 かいふくやくを ゲット！','456ダイス':'🎲 456ダイスを ゲット！','ぼろぼろの たて':'🛡️ ぼろぼろの たてを ゲット！'};label=labels[name]||'✨ アイテムを ゲット！';addHistory(label)}await showEvent(label,false)}
else if(['wood','emptywood','mimic','silver','gold'].includes(type)){label='📦 たからばこを はっけん！';addHistory(label);await openChest(type,i)}
else if(type==='monster'){chiteiEncounterMonster=chiteiMonsterForCell(i);label='👾 '+CHITEI_MONSTER_NAMES[chiteiEncounterMonster]+'が あらわれた！';addHistory(label);await monsterEncounter(i);if(currentFloor===0){while(!await battle(false)){state.pick=Math.max(state.pick,3);ensureWallet().items.dice=(ensureWallet().items.dice||0)+1;}}else await battle(false)}
else if(type==='special'&&typeof window.chiteiAwardTreasure==='function'){addHistory('💎 おたからを はっけん！')}else{const messages={stairs:'🌀 ワープゲートを はっけん！',special:'💎 おたからを はっけん！'};label=messages[type]||'✨ なにかを はっけん！';addHistory(label);await showEvent(label,true)}
render();return true}
function showPickStudyGuide(){if(parent.__teacherMode&&!tutorialActive||document.getElementById('pickStudyGuide'))return;const d=document.createElement('dialog');d.id='pickStudyGuide';d.style.cssText='width:min(90vw,480px);border:2px solid #dfb96d;border-radius:18px;background:#172b46;color:#ffe6a5;text-align:center;padding:24px';const h=document.createElement('h2');h.textContent='⛏️ つるはしが なくなったよ！';const p=document.createElement('p');p.textContent='べんきょうを して、つるはしを ゲットしよう！';p.style.fontSize='20px';const go=document.createElement('button'),close=document.createElement('button');go.textContent='📖 べんきょうする';close.textContent='とじる';for(const b of [go,close])b.style.cssText='padding:12px;margin:6px;border-radius:10px;font-size:18px;font-weight:bold';go.style.background='#dfb96d';go.onclick=()=>{d.close();document.getElementById('openStudy')?.click()};close.onclick=()=>d.close();d.addEventListener('close',()=>d.remove(),{once:true});d.append(h,p,go,close);document.body.append(d);d.showModal()}
async function select(i){if(moving)return;if(tutorialActive){if(currentFloor===1)return;const target=tutorialTarget();if(i!==target){tutorialHint();return;}}const nx=i%N,ny=Math.floor(i/N),open=state.open.includes(i);if(nx===x&&ny===y){if(tutorialActive&&i===36&&confirm('つぎの かいに いく？')){moveFloor(1);tutorialHint()}return;}
if(!open&&!isNear(nx,ny)){msg.textContent='まだ ほっていないマスは、となりだけ ほれるよ';return}
if(!parent.__teacherMode&&!open&&(state.pick||0)<=0){msg.textContent='⛏️ つるはしが たりないよ！ べんきょうして ふやそう！';showPickStudyGuide();return}
const path=open?findPath(i):[idx(x,y),i];if(!path){msg.textContent='そこへ いく みちが まだ つながっていないよ';return}
const startFloor=currentFloor;moving=true;activeTarget=i;render();if(!open){dir=nx>x?1:nx<x?3:ny>y?0:2;frame(0);await pause(100);await dig(i)}else msg.textContent='🐰 えらんだマスまで じどうで いどうするよ！';
for(let k=1;k<path.length;k++){const dest=path[k],tx=dest%N,ty=Math.floor(dest/N);dir=tx>x?1:tx<x?3:ty>y?0:2;await hop(tx,ty);render();if(await discover(dest)){render()}
// 階段は発見済みでも、到着するたびに次の階への移動を確認する。
if(state.types[dest]==='stairs'){
 const goNext=confirm('🌀 ワープゲートに ついたよ！\nつぎの かいに いく？');
 if(goNext){if(currentFloor<17)moveFloor(currentFloor+1);else msg.textContent='🌀 ちか18かいは まだ じゅんびちゅうだよ。';}
 else{msg.textContent='🐰 この かいを もうすこし たんけんしよう！';}
 break;
}
}
activeTarget=-1;render();if(currentFloor===startFloor&&!state.found.includes(i)&&state.types[i]==='empty')msg.textContent='ぴょん！ とうちゃくしたよ';moving=false;if(tutorialActive)tutorialHint();if(!open&&!parent.__teacherMode&&(state.pick||0)<=0)showPickStudyGuide()}
document.querySelectorAll('[data-chest-test]').forEach(b=>b.addEventListener('click',async()=>{if(moving)return;moving=true;try{await openChest(b.dataset.chestTest,-1,true)}finally{moving=false;render()}}));
document.getElementById('add').onclick=()=>{if(moving)return;render();msg.textContent='🧪 テスト中は つるはしを なんどでも つかえるよ'};document.getElementById('reset').onclick=()=>{if(moving)return;if(!confirm('この階のテスト記録を消して、はじめからにしますか？'))return;state=create(currentFloor);x=5;y=5;dir=0;position(x,y);frame(0);render();msg.textContent='まんなかから スタート！'};
const miniCanvas=document.getElementById('minimap');
const miniCtx=miniCanvas.getContext('2d');
const tileDark=new Image(),tileOpen=new Image();
tileDark.src="images/3dcde5a2816061fa.webp";
tileOpen.src="images/5511c4b58cffa033.webp";
tileDark.onload=drawMinimap;tileOpen.onload=drawMinimap;
function drawMinimap(){
  if(!miniCtx||!state)return;
  const c=miniCtx,W=c.canvas.width,T=W/N;
  miniCtx.clearRect(0,0,W,W);
  for(let i=0;i<TOTAL;i++){
    const xx=i%N,yy=Math.floor(i/N),opened=state.open.includes(i),tile=opened?tileOpen:tileDark;
    if(tile.complete&&tile.naturalWidth)miniCtx.drawImage(tile,xx*T,yy*T,T,T);
    else{miniCtx.fillStyle=opened?'#cba16d':'#49342d';miniCtx.fillRect(xx*T,yy*T,T,T)}
    miniCtx.strokeStyle='#221d1a77';miniCtx.lineWidth=.65;miniCtx.strokeRect(xx*T,yy*T,T,T);
    if(opened&&!state.found.includes(i)&&state.types[i]!=='empty'){
      miniCtx.fillStyle='#fff3a3';miniCtx.beginPath();miniCtx.arc((xx+.5)*T,(yy+.5)*T,Math.max(2,T*.12),0,Math.PI*2);miniCtx.fill();
    }
  }
  // Viewport rectangle: exact scroll offset, clamped naturally at board edges.
  const scale=W/board.clientWidth;
  miniCtx.strokeStyle='#ffdf68';miniCtx.lineWidth=3;
  miniCtx.strokeRect(viewport.scrollLeft*scale+1.5,viewport.scrollTop*scale+1.5,Math.min(viewport.clientWidth*scale,W-3-viewport.scrollLeft*scale),Math.min(viewport.clientHeight*scale,W-3-viewport.scrollTop*scale));
  miniCtx.fillStyle='#f58cbd';miniCtx.strokeStyle='#fff';miniCtx.lineWidth=2;
  miniCtx.beginPath();miniCtx.arc((x+.5)*T,(y+.5)*T,T*.24,0,Math.PI*2);miniCtx.fill();miniCtx.stroke();
}
viewport.addEventListener('scroll',drawMinimap,{passive:true});

interaction.hidden=true;fitBoard();position(x,y);frame(0);render();drawMinimap();window.addEventListener('resize',()=>{fitBoard();camera(x,y);drawMinimap()});
