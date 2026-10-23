(function(){
var S=window.PL_STOPS||[];var el=document.getElementById('pl-map');if(!el||!window.L)return;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var map=L.map(el,{zoomControl:false,attributionControl:true,scrollWheelZoom:false,dragging:true,tap:true,worldCopyJump:true});
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
var all=L.latLngBounds(S.map(function(s){return[s.lat,s.lng]}));
map.fitBounds(all,{padding:[24,24]});
var seen={};var markers={};var pts=[];
S.forEach(function(s,i){var k=s.lat+','+s.lng;if(markers[k]){markers[k].nums.push(s.n);return;}
 var icon=L.divIcon({className:'',html:'<div class="pl-pin" data-k="'+k+'">'+s.n+'</div>',iconSize:[26,26],iconAnchor:[13,13]});
 var m=L.marker([s.lat,s.lng],{icon:icon,keyboard:false,title:s.place}).addTo(map);
 m.nums=[s.n];m.on('click',function(){var c=document.getElementById(s.id);if(c)c.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});});
 markers[k]=m;});
var route=L.polyline([],{color:'#b8893b',weight:2.5,opacity:.9,dashArray:'5 7'}).addTo(map);
var label=document.getElementById('pl-maplabel');var cur=-1;
function pin(k){var m=markers[k];return m&&m.getElement()&&m.getElement().querySelector('.pl-pin');}
function go(i){if(i===cur)return;cur=i;
 document.querySelectorAll('.pl-stop.on,.pl-end.on').forEach(function(c){c.classList.remove('on')});
 if(i>=S.length){var e=document.getElementById('muse');if(e)e.classList.add('on');
  route.setLatLngs(S.map(function(s){return[s.lat,s.lng]}));
  Object.keys(markers).forEach(function(k){var p=pin(k);if(p){p.classList.remove('on');p.classList.add('seen')}});
  map.flyToBounds(all,{padding:[24,24],duration:reduce?0:1.4});label.innerHTML='<b>Muse</b>Every stop, one album';return;}
 var s=S[i];var c=document.getElementById(s.id);if(c)c.classList.add('on');
 Object.keys(markers).forEach(function(k){var p=pin(k);if(p)p.classList.remove('on')});
 var k=s.lat+','+s.lng;var p=pin(k);if(p){p.classList.add('on');p.classList.add('seen')}
 route.setLatLngs(S.slice(0,i+1).map(function(x){return[x.lat,x.lng]}));
 var prev=i>0?S[i-1]:null;
 if(prev&&(prev.lat!==s.lat||prev.lng!==s.lng)&&map.distance([prev.lat,prev.lng],[s.lat,s.lng])>400000){
  var b=L.latLngBounds([[prev.lat,prev.lng],[s.lat,s.lng]]);
  if(reduce){map.setView([s.lat,s.lng],s.zoom)}else{map.flyToBounds(b,{padding:[40,40],duration:.9});setTimeout(function(){if(cur===i)map.flyTo([s.lat,s.lng],s.zoom,{duration:1.1})},950);}
 }else{map.flyTo([s.lat,s.lng],s.zoom,{duration:reduce?0:1.2});}
 label.innerHTML='<b>'+(s.n<10?'0':'')+s.n+'</b>'+s.place+' · '+s.when;}
var cards=[].slice.call(document.querySelectorAll('.pl-stop,.pl-end'));
function pick(){var mapH=window.innerWidth>=900?0:document.querySelector('.pl-mapwrap').offsetHeight;
 var line=mapH+(window.innerHeight-mapH)*0.42;var best=-1;
 for(var j=0;j<cards.length;j++){var r=cards[j].getBoundingClientRect();if(r.top<=line)best=j;}
 if(best<0){if(cur!==-1){cur=-1;map.flyToBounds(all,{padding:[24,24],duration:reduce?0:1});label.innerHTML='Springfield to Muse';}return;}
 var c=cards[best];go(c.classList.contains('pl-end')?S.length:+c.getAttribute('data-i'));}
var t=null;window.addEventListener('scroll',function(){if(t)return;t=requestAnimationFrame(function(){t=null;pick()})},{passive:true});
window.addEventListener('resize',function(){map.invalidateSize();pick()});
label.innerHTML='Springfield to Muse';
setTimeout(function(){map.invalidateSize();pick()},200);
})();
