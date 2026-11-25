/* SGM Operations Control — service worker
   Only job: show the weekly alert notifications and open the app when tapped.
   It does not cache pages, so the app is always loaded fresh from the server.
   Must be uploaded next to the app's HTML file (same folder on the website). */

self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(event){ event.waitUntil(self.clients.claim()); });

self.addEventListener("push", function(event){
  var d = {};
  try { d = event.data ? event.data.json() : {}; }
  catch(e){ d = { body: event.data ? event.data.text() : "" }; }
  var title = d.title || "SGM Operations Control";
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || "sgm-alert",
    renotify: true,
    data: { url: d.url || "./#alerts" }
  }));
});

self.addEventListener("notificationclick", function(event){
  event.notification.close();
  var target = new URL((event.notification.data && event.notification.data.url) || "./#alerts", self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(list){
      for(var i = 0; i < list.length; i++){
        var c = list[i];
        if(c.url.indexOf(self.registration.scope) === 0 && "focus" in c){
          if("navigate" in c) c.navigate(target);
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
