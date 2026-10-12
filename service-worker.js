const VERSION='1.1.0';
const CACHE='venue-record-pwa-v'+VERSION;
const APP_SHELL=['./','./index.html','./style.css','./portal.css','./app.js','./manifest.webmanifest','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./campus/south.png','./campus/north.png','./campus/east.png','./campus/shenzhen.png','./campus/zhuhai.png','./campus/university-logo.png'];

// Install the entire new version before activating; an incomplete download keeps
// the previous worker/cache available. Never reload a user's unsent draft.
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('venue-record-pwa-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='GET_VERSION'&&event.source)event.source.postMessage({type:'APP_VERSION',version:VERSION});
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    // Hash routes share this shell. Query-string previews also work offline.
    if(event.request.mode==='navigate'){
      const shell=await cache.match('./index.html');
      if(shell)return shell;
    }
    const hit=await cache.match(event.request,{ignoreSearch:true});
    if(hit)return hit;
    // Missing images/external requests must not receive HTML as a fallback.
    return fetch(event.request);
  }));
});
