(()=>{
const box=document.createElement('div');
box.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#14253e;color:#fff;display:grid;place-content:center;text-align:center;font:700 24px system-ui;padding:24px';
box.innerHTML='<div style="font-size:42px">🌙</div><h2>ぼうけんは おやすみちゅう</h2><p>あそべる じかん<br>8:00 ～ 18:00</p><p>また あそびに きてね！</p>';
const warning=document.createElement('div');
warning.style.cssText='position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:2147483646;background:#ffe19a;color:#342500;padding:10px 18px;border-radius:0 0 12px 12px;font:bold 18px system-ui;pointer-events:none';
warning.textContent='あと 5ふん いないで おしまいだよ！';
let server=null,stamp=0,pending=false,locked=false;
function now(){return server===null?Date.now():server+Math.max(0,performance.now()-stamp)}
function tick(){
 const d=new Date(now()+9*3600000),m=d.getUTCHours()*60+d.getUTCMinutes();
 const allowed=window.__teacherMode||(m>=480&&m<1080);
 if(!allowed&&!locked){
  locked=true;
  const frame=document.getElementById('game');
  try{const w=frame.contentWindow;if(typeof w.save==='function')w.save()}catch(e){}
  if(typeof window.__returnToTitle==='function')window.__returnToTitle();
  document.body.append(box);
 }else if(allowed&&locked){locked=false;box.remove()}
 if(allowed&&!window.__teacherMode&&m>=1075&&m<1080){if(!warning.isConnected)document.body.append(warning)}else warning.remove();
}
function sync(){
 if(pending||typeof google==='undefined'||!google.script||!google.script.run)return;
 pending=true;
 google.script.run.withSuccessHandler(v=>{pending=false;if(Number.isFinite(v)){server=v;stamp=performance.now();tick()}}).withFailureHandler(()=>{pending=false}).getGameServerTime();
}
tick();sync();setInterval(tick,1000);setInterval(sync,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync();tick()}});
})();