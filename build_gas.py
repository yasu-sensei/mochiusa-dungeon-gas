"""Build a standalone HTML release from the local, approved game source.
Run: python3 build_gas.py
"""
from pathlib import Path
import base64, json, mimetypes, re

root = Path(__file__).resolve().parent
scripts = {p.relative_to(root).as_posix(): p.read_text(encoding="utf-8") for p in (root/"js").glob("*.js")}
assets = {}
for p in (root/"images").rglob("*"):
    if p.is_file():
        mime = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
        assets[p.relative_to(root).as_posix()] = "data:"+mime+";base64,"+base64.b64encode(p.read_bytes()).decode("ascii")

def safe_json(x):
    return json.dumps(x, ensure_ascii=True).replace("<", "\\u003c")

bootstrap = r"""
(function(){
 const pack=window.__releasePack || parent.__releasePack;
 window.__releasePack=pack;
 const close='</'+'script>';
 const open='<scr'+'ipt>';
 function asset(s){return pack.assets[s]||s}
 function images(s){return s.replace(/images\/[\w.-]+\.(?:webp|png|jpg|jpeg|gif|svg)/gi,asset)}
 function transform(s){
   s=images(s);
   s=s.replace(/<script\b([^>]*?)\bsrc=["'](js\/[^"']+)["']([^>]*)>\s*<\/script>/gi,
    (all,a,path,b)=>{
      if(!(path in pack.scripts))throw Error('Missing script '+path);
      return '<script'+a+b+'>'+images(pack.scripts[path]).replace(/<\/script/gi,'<\\/script')+close;
    });
   return s.replace(/<head(?:\s[^>]*)?>/i,m=>m+open+'('+install.toString()+')();'+close);
 }
 function install(){
   const pack=window.__releasePack||parent.__releasePack;
   window.__releasePack=pack;
   const close='</'+'script>',open='<scr'+'ipt>';
   function asset(s){return pack.assets[s]||s}
   function images(s){return s.replace(/images\/[\w.-]+\.(?:webp|png|jpg|jpeg|gif|svg)/gi,asset)}
   function transform(s){
     s=images(s);
     s=s.replace(/<script\b([^>]*?)\bsrc=["'](js\/[^"']+)["']([^>]*)>\s*<\/script>/gi,(all,a,path,b)=>{
       if(!(path in pack.scripts))throw Error('Missing script '+path);
       return '<script'+a+b+'>'+images(pack.scripts[path]).replace(/<\/script/gi,'<\\/script')+close;
     });
     const hook=open+'('+install.toString()+')();'+close;
     return /<head(?:\s[^>]*)?>/i.test(s)?s.replace(/<head(?:\s[^>]*)?>/i,m=>m+hook):hook+s;
   }
   const f=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'srcdoc');
   Object.defineProperty(HTMLIFrameElement.prototype,'srcdoc',{...f,set(v){f.set.call(this,transform(String(v)))}});
   const set=Element.prototype.setAttribute;
   Element.prototype.setAttribute=function(k,v){if(this instanceof HTMLIFrameElement&&k.toLowerCase()==='srcdoc')v=transform(String(v));if(k.toLowerCase()==='src')v=asset(String(v));return set.call(this,k,v)};
   const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
   Object.defineProperty(HTMLImageElement.prototype,'src',{...d,set(v){d.set.call(this,asset(String(v)))}});
 }
 install();
})();
"""
html=(root/"index.html").read_text(encoding="utf-8")
def images(s):
    return re.sub(r"images/[\w.-]+\.(?:webp|png|jpg|jpeg|gif|svg)",lambda m:assets.get(m.group(),m.group()),s,flags=re.I)
def script(m):
    a,path,b=m.groups()
    return "<script"+a+b+">"+images(scripts[path]).replace("</script","<\\/script")+"</script>"
html=re.sub(r'<script\b([^>]*?)\bsrc=["\'](js/[^"\']+)["\']([^>]*)>\s*</script>',script,html,flags=re.I)
def css(m):
    return "<style>"+images((root/m.group(1)).read_text(encoding="utf-8"))+"</style>"
html=re.sub(r'<link\b[^>]*href=["\'](css/[^"\']+)["\'][^>]*>',css,html,flags=re.I)
payload="<script>window.__releasePack="+safe_json({"scripts":scripts,"assets":assets})+";"+bootstrap+"</script>"
html=html.replace("</head>",payload+"</head>",1)
out=root/"dist"/"index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html,encoding="utf-8")
print(f"{out}: {out.stat().st_size:,} bytes")
