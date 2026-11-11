/* MFN Workplace – Service Worker
   Netz zuerst: ein hochgeladenes Update kommt sofort an.
   Ohne Netz: die zuletzt geladene Version aus dem Zwischenspeicher.
   Bilder und Inhalte liegen NICHT hier, sondern im Browser-Speicher (IndexedDB). */
const CACHE="mfn-studio-2026.11.11-1";
const CORE=["./","index.html","dunkel.html","manifest.webmanifest","favicon.ico","icons/icon-16.png","icons/icon-32.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:"reload"})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.indexOf("mfn-studio-")===0&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  let u;try{u=new URL(r.url);}catch(_){return;}
  if(u.origin!==self.location.origin){
    // Schriften von Google: einmal laden, danach aus dem Zwischenspeicher
    if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
      e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res;}))));
    }
    return;
  }
  const nav=r.mode==="navigate";
  e.respondWith(
    (nav?fetch(r.url,{cache:"no-cache",credentials:"same-origin"}):fetch(r)).then(res=>{
      if(res&&res.ok&&!u.search){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});}
      return res;
    }).catch(()=>caches.match(r,{ignoreSearch:true}).then(hit=>hit||(nav?caches.match("index.html"):undefined)).then(hit=>hit||Response.error()))
  );
});
