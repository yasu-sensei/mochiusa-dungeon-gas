(function(){
 const layout=document.querySelector('.layout'),left=layout?.querySelector('.left');
 const quick=document.querySelector('#dungeonTop .quick');
 if(!layout||!left||!quick)return;
 const status=document.createElement('aside');status.id='dungeonStatusPanel';
 const label=document.createElement('div');label.className='status-label';label.textContent='⛏️ つるはし';status.append(label);
 const pick=document.getElementById('topPick');if(pick)status.append(pick);
 const actions=document.createElement('nav');actions.id='dungeonActionPanel';actions.setAttribute('aria-label','ゲームメニュー');
 for(const id of ['openStudy','openItems','openBook']){const btn=document.getElementById(id);if(btn)actions.append(btn)}
 const stack=document.createElement('div');stack.id='dungeonStatusStack';
 const treasure=document.createElement('aside');treasure.id='floorTreasureStatus';treasure.setAttribute('aria-live','polite');
 const heading=document.createElement('div');heading.textContent='💎 おたから';const value=document.createElement('div');treasure.append(heading,value);
 const css=document.createElement('style');css.textContent='#dungeonStatusStack{grid-column:1;grid-row:1;align-self:center;justify-self:stretch;display:flex;flex-direction:column;gap:12px;min-width:0}#dungeonStatusStack #dungeonStatusPanel{width:100%;box-sizing:border-box}#floorTreasureStatus{box-sizing:border-box;width:100%;border:2px solid #8291a5;border-radius:16px;background:#34445c;color:#e0e5ed;padding:14px 5px;text-align:center;font-weight:900;font-size:clamp(16px,1.7vw,23px)}#floorTreasureStatus div+div{font-size:clamp(19px,2.2vw,30px);margin-top:8px}#floorTreasureStatus[data-owned="true"]{background:#665025;border-color:#efce75;color:#ffe49b}@media(max-width:720px){#dungeonStatusStack{order:0;flex-direction:row;gap:5px;align-self:stretch}#floorTreasureStatus{padding:3px 5px;font-size:14px;border-radius:9px}#floorTreasureStatus div+div{font-size:16px;margin-top:0}}';document.head.append(css);
 function refreshTreasure(){const got=!!floorTreasureFound(currentFloor);treasure.hidden=tutorialActive;treasure.dataset.owned=String(got);value.textContent=got?'✓ ゲット！':'？ まだ';}
 stack.append(treasure,status);layout.insertBefore(stack,left);layout.append(actions);
 window.addEventListener('chitei-special-found',refreshTreasure);refreshTreasure();
 const reset=document.getElementById('resetDungeonTest');if(reset)reset.remove();
})();