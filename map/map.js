(function(){
'use strict';
var G=window.GRAPH; if(!G) return;
var TC={met:'#9e9e9e',collab:'#ffffff',inspo:'#c4c4c4',signed:'#7d7d7d',personal:'#b2b2b2'};
var TL={met:'Met',collab:'Collab',inspo:'Inspo',signed:'Signed',personal:'Personal'};
var RANK={collab:4,signed:4,met:3,personal:3,inspo:2};
var MAJOR={'john-legend':1,'pharrell':1,'clipse':1,'usher':1,'lauryn-hill':1,'alicia-keys':1,'common':1,'stevie-wonder':1,'jay-z':1,'voices-of-fire':1,'michael-jackson':1,'taylor-swift':1,'daft-punk':1,'snoop-dogg':1,'the-roots':1};
var byId={},nodes=G.nodes.map(function(n){var o=Object.assign({},n);byId[n.id]=o;o.deg=0;o.first=9999;o.edges=[];o.nb={};return o;});
var edges=G.edges.map(function(e){var o=Object.assign({},e);o.a=byId[e.from];o.b=byId[e.to];o.a.deg++;o.b.deg++;o.a.edges.push(o);o.b.edges.push(o);o.a.first=Math.min(o.a.first,e.year);o.b.first=Math.min(o.b.first,e.year);(o.a.nb[o.b.id]=o.a.nb[o.b.id]||[]).push(o);(o.b.nb[o.a.id]=o.b.nb[o.a.id]||[]).push(o);return o;});
var J=byId['john-legend']; J.first=0;
var minYear=edges.reduce(function(m,e){return Math.min(m,e.year);},9999);
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function dom(u){try{return new URL(u).hostname.replace(/^www\./,'').replace(/^en\./,'');}catch(e){return 'source';}}
function initials(n){return n.replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).slice(0,2).map(function(w){return w[0];}).join('').toUpperCase();}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();}
function yl(e){return e.year_label||e.year;}
function escore(e){return (RANK[e.type]||1)*10+(e.quote?3:0)+(e.song?2:0)+(/kanye/i.test(e.title+' '+(e.story||''))?-30:0)+e.year/10000;}
function bestEdge(a,b){var l=(a.nb[b.id]||[]).slice().sort(function(x,y){return escore(y)-escore(x);});return l;}
// ---- distances
function bfs(src){var d={};d[src.id]=0;var q=[src];while(q.length){var u=q.shift();Object.keys(u.nb).forEach(function(k){if(d[k]==null){d[k]=d[u.id]+1;q.push(byId[k]);}});}return d;}
var DJ=bfs(J);nodes.forEach(function(n){n.dj=DJ[n.id];});
function path(from,to){if(from===to)return [from];var d=bfs(to);if(d[from.id]==null)return null;var p=[from],cur=from;
  while(cur!==to){var cands=Object.keys(cur.nb).filter(function(k){return d[k]===d[cur.id]-1;}).map(function(k){return byId[k];});
    cands.sort(function(x,y){var sx=escore(bestEdge(cur,x)[0]),sy=escore(bestEdge(cur,y)[0]);return (sy-sx)||(y.deg-x.deg);});
    cur=cands[0];p.push(cur);}return p;}
// ---- radii, photos
nodes.forEach(function(n){
  n.r = n===J?32 : n.id==='pharrell'?23 : n.ring===2?11 : Math.min(18,10+Math.sqrt(n.deg)*2.4);
  if(n.size==='s') n.r=9;
  if(n.photo){n.img=new Image();n.img.src=n.photo.file;n.img.onload=function(){draw();};}
});
var pairs={};edges.forEach(function(e){var k=[e.from,e.to].sort().join('|');(pairs[k]=pairs[k]||{a:e.a,b:e.b,list:[]}).list.push(e);});
pairs=Object.keys(pairs).map(function(k){return pairs[k];});
// ---- layout
function ringOf(n){return n===J?0:n.ring===2?(n.dj>=3?5:4):n.group==='muse'?1:n.group==='inspo'?3:2;}
var RR=[0,190,385,545,730,890],K=1.3;
function layout(){
  K=Math.max(1,Math.min(1.6,(H||600)/(W||400)));
  var rings=[[],[],[],[],[],[]];nodes.forEach(function(n){rings[ringOf(n)].push(n);});
  [1,2,3].forEach(function(ri){var list=rings[ri];list.sort(function(a,b){return (a.first-b.first)||(a.name<b.name?-1:1);});
    list.forEach(function(n,i){n.ang=-Math.PI/2+Math.PI*2*(i+0.5)/list.length;});});
  [4,5].forEach(function(ri){rings[ri].forEach(function(n){var best=null;Object.keys(n.nb).forEach(function(k){var m=byId[k];if(m.ang!=null&&(!best||m.dj<best.dj))best=m;});n.ang=best?best.ang+(Math.random()-.5)*0.25:Math.random()*6.28;});});
  nodes.forEach(function(n){var R=RR[ringOf(n)];if(n===J){n.x=n.y=0;}else{n.x=Math.cos(n.ang)*R;n.y=Math.sin(n.ang)*R*K;}n.vx=n.vy=0;});
  for(var t=0;t<360;t++){var alpha=1-t/400,i,j,a,b,dx,dy,d,f;
    for(i=0;i<nodes.length;i++){a=nodes[i];for(j=i+1;j<nodes.length;j++){b=nodes[j];dx=b.x-a.x;dy=b.y-a.y;d=Math.sqrt(dx*dx+dy*dy)||0.1;
      var min=(a.r+b.r)*1.7+22;if(d<min){f=(min-d)/d*0.35;dx*=f;dy*=f;a.vx-=dx;a.vy-=dy;b.vx+=dx;b.vy+=dy;}}}
    pairs.forEach(function(p){if(p.a===J||p.b===J)return;var a=p.a,b=p.b;dx=b.x-a.x;dy=b.y-a.y;d=Math.sqrt(dx*dx+dy*dy)||1;f=(d-80)/d*0.014*alpha;dx*=f;dy*=f;a.vx+=dx;a.vy+=dy;b.vx-=dx;b.vy-=dy;});
    nodes.forEach(function(n){if(n===J){n.x=n.y=0;n.vx=n.vy=0;return;}var R=RR[ringOf(n)];var th=Math.atan2(n.y/K,n.x);var tx=Math.cos(th)*R,ty=Math.sin(th)*R*K;
      n.vx+=(tx-n.x)*0.07;n.vy+=(ty-n.y)*0.07;n.vx*=0.55;n.vy*=0.55;n.x+=n.vx;n.y+=n.vy;});
  }
  // even out each ring, keeping the order the forces found
  [1,2,3].forEach(function(ri){var list=rings[ri];if(!list.length)return;
    list.forEach(function(n){n.th=Math.atan2(n.y/K,n.x);});list.sort(function(a,b){return a.th-b.th;});
    var off=0;list.forEach(function(n,i){var base=-Math.PI+Math.PI*2*i/list.length;var dd=n.th-base;off+=Math.atan2(Math.sin(dd),Math.cos(dd));});off/=list.length;
    var stag=false;
    list.forEach(function(n,i){var a=-Math.PI+Math.PI*2*i/list.length+off;var R=RR[ri]+(stag&&i%2?40:0);n.ang=a;n.x=Math.cos(a)*R;n.y=Math.sin(a)*R*K;});});
  // outer rings: fan each person out beside the one who links them in
  var maxd=nodes.reduce(function(m,n){return Math.max(m,n.dj||0);},0);
  for(var lev=2;lev<=maxd;lev++){var groups={};
    nodes.forEach(function(n){if(n.ring!==2||n.dj!==lev)return;var anc=Object.keys(n.nb).map(function(k){return byId[k];}).filter(function(m){return m.dj===lev-1&&m.ang!=null;});
      anc.sort(function(x,y){return escore(bestEdge(n,y)[0])-escore(bestEdge(n,x)[0])||y.deg-x.deg;});var a=anc[0];if(!a)return;(groups[a.id]=groups[a.id]||[]).push(n);});
    Object.keys(groups).forEach(function(aid){var a=byId[aid],list=groups[aid];var R=Math.sqrt(a.x*a.x+(a.y/K)*(a.y/K))+(a.ring===2?150:Math.max(170,RR[3]+150-Math.sqrt(a.x*a.x+(a.y/K)*(a.y/K))));
      var step=Math.min(0.16,64/R);list.sort(function(x,y){return x.name<y.name?-1:1;});
      list.forEach(function(n,i){var ang=a.ang+(i-(list.length-1)/2)*step;n.ang=ang;n.x=Math.cos(ang)*R;n.y=Math.sin(ang)*R*K;});});}
  for(var t2=0;t2<120;t2++){for(var i2=0;i2<nodes.length;i2++){var a2=nodes[i2];for(var j2=i2+1;j2<nodes.length;j2++){var b2=nodes[j2];if(a2.ring!==2&&b2.ring!==2)continue;var ddx=b2.x-a2.x,ddy=b2.y-a2.y,dd=Math.sqrt(ddx*ddx+ddy*ddy)||0.1,mn=(a2.r+b2.r)*1.7+20;
    if(dd<mn){var ff=(mn-dd)/dd*0.5;ddx*=ff;ddy*=ff;if(a2.ring===2&&b2.ring===2){a2.x-=ddx/2;a2.y-=ddy/2;b2.x+=ddx/2;b2.y+=ddy/2;}else if(a2.ring===2){a2.x-=ddx;a2.y-=ddy;}else{b2.x+=ddx;b2.y+=ddy;}}}}}
}
// ---- canvas
var cv=document.getElementById('cv'),ctx=cv.getContext('2d'),wrap=document.getElementById('wrap');
var W=0,H=0,DPR=1,cam={s:1,x:0,y:0},anim=null;
function resize(){DPR=Math.min(window.devicePixelRatio||1,2.5);W=wrap.clientWidth;H=wrap.clientHeight;cv.width=W*DPR;cv.height=H*DPR;draw();}
function bounds(list){var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;list.forEach(function(n){x0=Math.min(x0,n.x-n.r*1.6);x1=Math.max(x1,n.x+n.r*1.6);y0=Math.min(y0,n.y-n.r*1.6);y1=Math.max(y1,n.y+n.r*1.6+20);});return{x0:x0,x1:x1,y0:y0,y1:y1};}
function camFor(list,maxS,pad){var b=bounds(list);pad=pad||24;var pr=pad+(pad>30?40:0);var s=Math.min((W-pad-pr)/(b.x1-b.x0),(H-pad*2)/(b.y1-b.y0));s=Math.min(maxS||5,Math.max(0.2,s));return{s:s,x:pad+(W-pad-pr)/2-(b.x0+b.x1)/2*s,y:H/2-(b.y0+b.y1)/2*s};}
function flyTo(t,ms){var f={s:cam.s,x:cam.x,y:cam.y},t0=performance.now();ms=ms||650;cancelAnimationFrame(anim);
  (function step(now){var k=Math.min(1,(now-t0)/ms);k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cam.s=f.s+(t.s-f.s)*k;cam.x=f.x+(t.x-f.x)*k;cam.y=f.y+(t.y-f.y)*k;draw();if(k<1)anim=requestAnimationFrame(step);})(t0);}
function fit(animate){var c=camFor(nodes.filter(nodeVis),5,10);if(animate)flyTo(c);else{cam=c;draw();}}
var year=2026,types={met:1,collab:1,inspo:1,signed:1,personal:1},sel=null,chainP=null,chainT=0,chainStart=0;
function rs(n){var k=cam.s<1?Math.pow(1/cam.s,0.55):1;return n.r*k;}
function vis(e){return types[e.type]&&e.year<=year;}
function nodeVis(n){if(n===J) return true;for(var i=0;i<n.edges.length;i++){if(vis(n.edges[i]))return true;}return false;}
function onChain(a,b){if(!chainP)return -1;for(var i=0;i<chainP.length-1;i++){if((chainP[i]===a&&chainP[i+1]===b)||(chainP[i]===b&&chainP[i+1]===a))return i;}return -1;}
function draw(){
  if(!W) return;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
  ctx.translate(cam.x,cam.y);ctx.scale(cam.s,cam.s);
  var hi=null;
  if(chainP){hi={};chainP.forEach(function(n){hi[n.id]=2;});}
  else if(sel){hi={};hi[sel.id]=2;sel.edges.forEach(function(e){if(vis(e)){hi[e.from]=hi[e.from]||1;hi[e.to]=hi[e.to]||1;}});}
  var prog=chainP?(performance.now()-chainStart)/700:0;
  pairs.forEach(function(p){
    var ci=onChain(p.a,p.b);
    var vl=ci>=0?p.list:p.list.filter(vis); if(!vl.length) return;
    var tset=[];vl.forEach(function(e){if(tset.indexOf(e.type)<0)tset.push(e.type);});
    var on=hi?(chainP?ci>=0:(p.a===sel||p.b===sel)):true;
    var dx=p.b.x-p.a.x,dy=p.b.y-p.a.y,d=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/d,ny=dx/d;
    if(ci>=0){var t=Math.max(0,Math.min(1,prog-ci));if(t<=0)return;var A=chainP[ci],B=chainP[ci+1];var e0=bestEdge(A,B)[0];
      ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(A.x+(B.x-A.x)*t,A.y+(B.y-A.y)*t);ctx.strokeStyle='#d6b06a';ctx.globalAlpha=1;ctx.lineWidth=5/cam.s;ctx.lineCap='round';ctx.stroke();return;}
    tset.forEach(function(ty,k){var off=(k-(tset.length-1)/2)*3/cam.s;
      ctx.beginPath();ctx.moveTo(p.a.x+nx*off,p.a.y+ny*off);ctx.lineTo(p.b.x+nx*off,p.b.y+ny*off);
      var isJ=(p.a===J||p.b===J);ctx.strokeStyle=TC[ty];ctx.globalAlpha=on?(hi?0.95:(isJ?0.2:0.55)):0.05;ctx.lineWidth=(on&&hi?2.6:1.2)/cam.s;ctx.stroke();});
  });
  ctx.globalAlpha=1;
  var order=nodes.slice().sort(function(a,b){return (hi?((hi[a.id]||0)-(hi[b.id]||0)):0)||(a.r-b.r);});
  var labels=[];
  order.forEach(function(n){
    if(!nodeVis(n)&&!(hi&&hi[n.id])) return;
    var dim=hi&&!hi[n.id];
    ctx.globalAlpha=dim?0.16:1;
    var R=rs(n);if(hi&&hi[n.id]===2&&n!==J)R=Math.max(R,15/cam.s);
    ctx.save();ctx.beginPath();ctx.arc(n.x,n.y,R,0,Math.PI*2);ctx.closePath();
    if(n.img&&n.img.complete&&n.img.naturalWidth){ctx.clip();ctx.drawImage(n.img,n.x-R,n.y-R,R*2,R*2);}
    else{ctx.fillStyle='#252525';ctx.fill();ctx.fillStyle='#b3b3b3';ctx.font='400 '+(R*0.66)+'px "Josefin Sans", Inter, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(initials(n.name),n.x,n.y+1);}
    ctx.restore();
    ctx.beginPath();ctx.arc(n.x,n.y,R,0,Math.PI*2);ctx.lineWidth=((n===sel||(hi&&hi[n.id]===2))?3.4:1.6)/cam.s;ctx.strokeStyle=(n===sel||(hi&&hi[n.id]===2))?'#d6b06a':(n.ring===2?'rgba(214.0,176.0,106.0,0.55)':'#b3b3b3');ctx.stroke();
    var px=R*cam.s;
    var show=hi?!!hi[n.id]:(MAJOR[n.id]||cam.s>=1.25||(cam.s>=0.85&&px>=13));
    if(show)labels.push({n:n,R:R,dim:dim,strong:hi&&hi[n.id]===2||n===J});
  });
  // labels on top, screen-sized, with collision skip
  var placed=[];
  labels.sort(function(a,b){return (b.strong?1:0)-(a.strong?1:0)||(MAJOR[b.n.id]?1:0)-(MAJOR[a.n.id]?1:0)||b.R-a.R;});
  labels.forEach(function(L){var n=L.n;var fs=(L.strong?15:(MAJOR[n.id]?14:12.5));var sx=n.x*cam.s+cam.x,sy=(n.y+L.R)*cam.s+cam.y+4;
    ctx.setTransform(DPR,0,0,DPR,0,0);ctx.font='600 '+fs+'px "Josefin Sans", Inter, sans-serif';try{ctx.letterSpacing='0.1em';}catch(_){}var NM=n.name.toUpperCase();var w=ctx.measureText(NM).width;
    var box={x0:sx-w/2-3,x1:sx+w/2+3,y0:sy,y1:sy+fs+3};
    if(!L.strong&&placed.some(function(b){return !(box.x1<b.x0||box.x0>b.x1||box.y1<b.y0||box.y0>b.y1);})){ctx.translate(cam.x,cam.y);ctx.scale(cam.s,cam.s);return;}
    placed.push(box);
    ctx.globalAlpha=L.dim?0.3:1;ctx.textAlign='center';ctx.textBaseline='top';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='rgba(9,9,9,0.92)';ctx.strokeText(NM,sx,sy);ctx.fillStyle=L.strong?'#ffffff':'#f0f0f0';ctx.fillText(NM,sx,sy);try{ctx.letterSpacing='0px';}catch(_){}
    ctx.translate(cam.x,cam.y);ctx.scale(cam.s,cam.s);});
  ctx.globalAlpha=1;
  if(chainP&&prog<chainP.length)requestAnimationFrame(draw);
}
// ---- interaction
var ptrs={},moved=0,pinch=null;
function world(px,py){return{x:(px-cam.x)/cam.s,y:(py-cam.y)/cam.s};}
function hit(px,py){var w=world(px,py),best=null,bd=1e9;nodes.forEach(function(n){if(!nodeVis(n))return;var dx=n.x-w.x,dy=n.y-w.y,d=Math.sqrt(dx*dx+dy*dy);var tol=rs(n)+12/cam.s;if(d<tol&&d<bd){bd=d;best=n;}});return best;}
function rel(e){var r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);var p=rel(e);ptrs[e.pointerId]=p;moved=0;cancelAnimationFrame(anim);
  var ids=Object.keys(ptrs);if(ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:cam.s,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,camx:cam.x,camy:cam.y};}});
cv.addEventListener('pointermove',function(e){if(!ptrs[e.pointerId])return;var p=rel(e),o=ptrs[e.pointerId];ptrs[e.pointerId]=p;var ids=Object.keys(ptrs);
  if(ids.length===2&&pinch){var a=ptrs[ids[0]],b=ptrs[ids[1]];var d=Math.hypot(a.x-b.x,a.y-b.y);var ns=Math.max(0.2,Math.min(5,pinch.s*d/pinch.d));var cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
    cam.x=cx-(pinch.cx-pinch.camx)*ns/pinch.s;cam.y=cy-(pinch.cy-pinch.camy)*ns/pinch.s;cam.s=ns;moved=99;draw();return;}
  var dx=p.x-o.x,dy=p.y-o.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>6){cam.x+=dx;cam.y+=dy;draw();}});
function up(e){var p=ptrs[e.pointerId];delete ptrs[e.pointerId];if(Object.keys(ptrs).length<2)pinch=null;
  if(p&&moved<=6&&e.type==='pointerup'){var n=hit(p.x,p.y);if(n){chainP=null;select(n,true);}else if(sel||chainP){chainP=null;select(null);}}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function zoomAt(px,py,ns){ns=Math.max(0.2,Math.min(5,ns));cam.x=px-(px-cam.x)*ns/cam.s;cam.y=py-(py-cam.y)*ns/cam.s;cam.s=ns;draw();}
cv.addEventListener('wheel',function(e){e.preventDefault();var p=rel(e);zoomAt(p.x,p.y,cam.s*Math.exp(-e.deltaY*0.0015));},{passive:false});
document.getElementById('zin').addEventListener('click',function(){zoomAt(W/2,H/2,cam.s*1.4);});
document.getElementById('zout').addEventListener('click',function(){zoomAt(W/2,H/2,cam.s/1.4);});
document.getElementById('fit').addEventListener('click',function(){chainP=null;select(null);fit(true);});
var lw=0;window.addEventListener('resize',function(){resize();if(Math.abs(wrap.clientWidth-lw)>40){lw=wrap.clientWidth;fit();}});
// ---- card
var card=document.getElementById('card'),cardin=document.getElementById('cardin'),audio=null;
function stopAudio(){if(audio){audio.pause();audio=null;}var b=document.querySelector('.listen button');if(b)b.textContent='\u25B6';}
function photoHTML(n,cls,size){size=size||76;return n.photo?'<img src="'+esc(n.photo.file)+'" alt="" width="'+size+'" height="'+size+'" loading="lazy"'+(cls?' class="'+cls+'"':'')+'>':'<span class="ini">'+esc(initials(n.name))+'</span>';}
function srcHTML(e,cls){var a=[e.source].concat(e.also||[]);return '<p class="srcs'+(cls?' '+cls:'')+'">Source: '+a.map(function(u){return '<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(dom(u))+'</a>';}).join(' · ')+'</p>';}
function degText(n,to){to=to||J;var d=n===to?0:(to===J?n.dj:(bfs(to)[n.id]));return d===0?'This is '+to.name:d===1?'1 link from '+to.name:d+' links from '+to.name;}
function select(n,fromMap){
  sel=n;stopAudio();
  if(!n){card.hidden=true;draw();return;}
  draw();
  var list=n.edges.slice().sort(function(a,b){return a.year-b.year;});
  var h='<div class="ch">'+photoHTML(n)+'<div><h3>'+esc(n.name)+'</h3><p class="role">'+esc(n.role)+'</p>'+(n!==J?'<span class="dg">'+esc(degText(n))+'</span>':'')+'</div></div>';
  if(n.blurb)h+='<p class="blurb">'+esc(n.blurb)+'</p>';
  if(n!==J&&fromMap)h+='<button class="cbtn" type="button" id="cchain">Show the chain to '+esc(curTo.name)+'</button>';
  if(n.track){h+='<div class="listen"><button type="button" aria-label="Play a preview of '+esc(n.track.title)+'">\u25B6</button><div><b>'+esc(n.track.title)+'</b>'+esc(n.track.artist)+' · <a href="'+esc(n.track.url)+'" target="_blank" rel="noopener">Apple Music</a></div></div>';}
  h+='<ul class="conns">';
  list.forEach(function(e){var o=e.a===n?e.b:e.a;
    h+='<li style="--tc:'+TC[e.type]+'"><div class="cmeta"><span class="tag">'+TL[e.type]+'</span><span>'+esc(yl(e))+'</span><span>with <button class="who" data-id="'+o.id+'">'+esc(o.name)+'</button></span></div>';
    h+='<h4>'+esc(e.title)+'</h4>';
    if(e.story)h+='<p>'+esc(e.story)+'</p>';
    if(e.place)h+='<p class="place">'+esc(e.place)+'</p>';
    if(e.quote)h+='<blockquote class="q">\u201C'+esc(e.quote)+'\u201D<cite>'+esc(e.quote_by)+'</cite></blockquote>';
    h+=srcHTML(e)+'</li>';});
  h+='</ul>';
  if(n.photo)h+='<p class="pc">Photo: '+esc(n.photo.credit)+', <a href="'+esc(n.photo.source)+'" target="_blank" rel="noopener">'+esc(n.photo.license)+'</a>, via Wikimedia Commons</p>';
  cardin.innerHTML=h;card.hidden=false;card.scrollTop=0;
  var cb=document.getElementById('cchain');if(cb)cb.addEventListener('click',function(){card.hidden=true;runChain(n,curTo,true);});
  var lb=cardin.querySelector('.listen button');
  if(lb)lb.addEventListener('click',function(){if(audio){stopAudio();return;}audio=new Audio(n.track.preview);audio.play().catch(function(){});lb.textContent='\u275A\u275A';audio.addEventListener('ended',stopAudio);});
  Array.prototype.forEach.call(cardin.querySelectorAll('.who'),function(b){b.addEventListener('click',function(){var m=byId[b.dataset.id];chainP=null;focusOn(m);select(m,true);});});
  document.getElementById('hint').style.opacity=0;
  if(fromMap)focusOn(n);
}
function focusOn(n){if(!n)return;var s=Math.max(cam.s,1.1);var desk=window.innerWidth>=900;flyTo({s:s,x:(desk?(W-440)/2:W/2)-n.x*s,y:(desk?H/2:H*0.3)-n.y*s});}
document.getElementById('close').addEventListener('click',function(){select(null);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){select(null);closeRes();}});
// ---- chain
var curTo=J,chainEl=document.getElementById('chain');
function hopHTML(A,B,i){var l=bestEdge(A,B),e=l[0];
  var h='<li class="lk" style="--tc:'+TC[e.type]+';animation-delay:'+(0.25+i*0.7)+'s"><div class="lh"><span class="tag">'+TL[e.type]+'</span><span class="yr">'+esc(yl(e))+'</span></div>';
  h+='<h4><small>'+esc(A.name)+' and '+esc(B.name)+'</small>'+esc(e.title)+(e.song&&norm(e.song).indexOf(norm(e.title))!==0?' <span style="font-weight:600;color:var(--sub)">· '+esc(e.song)+'</span>':'')+'</h4>';
  if(e.story)h+='<p>'+esc(e.story)+'</p>';
  if(e.place)h+='<p class="pl">'+esc(e.place)+'</p>';
  if(e.quote)h+='<blockquote>\u201C'+esc(e.quote)+'\u201D<cite>'+esc(e.quote_by)+'</cite></blockquote>';
  h+=srcHTML(e);
  if(l.length>1)h+='<p class="more">'+(l.length-1)+' more '+(l.length===2?'link':'links')+' between them on the map</p>';
  return h+'</li>';}
function runChain(from,to,scroll){
  to=to||curTo;var p=path(from,to);if(!p){chainEl.innerHTML='<p class="chd">No chain found.</p>';return;}
  chainP=p.length>1?p:null;sel=null;card.hidden=true;stopAudio();
  year=2026;yr.value=2026;yrv.textContent=2026;count();
  var d=p.length-1;
  var h='<div class="chd"><div class="deg"><b>'+d+'</b>'+(d===1?'degree':'degrees')+'</div><p>'+esc(from.name)+' to '+esc(to.name)+(d===1?', directly.':', '+d+' real links.')+'</p></div>';
  h+='<div class="hops">';p.forEach(function(n,i){if(i)h+='<span class="arr" style="animation-delay:'+(i*0.7-0.2)+'s"></span>';h+='<button class="hp'+(i===0||i===p.length-1?' end':'')+'" data-id="'+n.id+'" style="animation-delay:'+(i*0.7)+'s">'+photoHTML(n,'',62)+'<span>'+esc(n.name)+'</span></button>';});h+='</div>';
  h+='<ol class="links">';for(var i=0;i<p.length-1;i++)h+=hopHTML(p[i],p[i+1],i);h+='</ol>';
  h+='<div class="chact"><button type="button" id="ccard">'+esc(from.name)+'\u2019s story card</button><button type="button" id="cmap">See it on the map</button><button type="button" id="cagain">Random artist</button></div>';
  chainEl.innerHTML=h;
  Array.prototype.forEach.call(chainEl.querySelectorAll('.hp'),function(b){b.addEventListener('click',function(){var m=byId[b.dataset.id];select(m,true);document.getElementById('wrap').scrollIntoView({behavior:'smooth',block:'center'});});});
  document.getElementById('ccard').addEventListener('click',function(){select(from,false);});
  document.getElementById('cmap').addEventListener('click',function(){document.getElementById('wrap').scrollIntoView({behavior:'smooth',block:'center'});});
  document.getElementById('cagain').addEventListener('click',function(){randomPick(true);});
  chainStart=performance.now()+150;
  if(chainP){flyTo(camFor(p,2.2,70),700);}else{flyTo(camFor([from].concat(Object.keys(from.nb).map(function(k){return byId[k];})),2.2,40));sel=from;}
  draw();
  try{history.replaceState(null,'','#'+from.id+(to!==J?'~'+to.id:''));}catch(e){}
  if(scroll)chainEl.scrollIntoView({behavior:'smooth',block:'start'});
  if(window.innerWidth>=900&&!chainP)select(from,false);
}
// ---- search
var IDX=[];
nodes.forEach(function(n){IDX.push({k:'Person',t:n.name,s:n.role+(n!==J&&n.dj!=null?' · '+n.dj+(n.dj===1?' link':' links')+' from Legend':''),n:n,q:norm(n.name+' '+n.name.replace(/\./g,'')),r:3});});
var seenS={};
edges.forEach(function(e){var o=e.a===J?e.b:e.a;
  [e.song,e.title].forEach(function(sg,ix){if(!sg)return;if(ix===1&&!e.song&&e.type!=='collab')return;var key=norm(sg)+'|'+o.id;if(seenS[key])return;seenS[key]=1;
    IDX.push({k:ix===0||e.type==='collab'?'Song':'Link',t:sg,s:e.a.name+' and '+e.b.name+', '+yl(e),n:o,e:e,q:norm(sg),r:2});});
  if(e.place){var pk=norm(e.place)+'|'+o.id;if(!seenS[pk]){seenS[pk]=1;IDX.push({k:'Place',t:e.place,s:e.a.name+' and '+e.b.name+': '+e.title,n:o,e:e,q:norm(e.place),r:1});}}});
nodes.forEach(function(n){if(n.track){var key=norm(n.track.title)+'|'+n.id;if(!seenS[key]){seenS[key]=1;IDX.push({k:'Song',t:n.track.title,s:n.track.artist,n:n,q:norm(n.track.title),r:2});}}});
function search(q){q=norm(q);if(!q)return [];var words=q.split(' ');
  var out=IDX.map(function(it){var sc=0;if(it.q.indexOf(q)===0)sc=100;else if((' '+it.q).indexOf(' '+q)>=0)sc=80;else if(words.every(function(w){return (' '+it.q).indexOf(' '+w)>=0;}))sc=60;else if(it.q.indexOf(q)>=0)sc=40;if(!sc)return null;return{it:it,sc:sc+it.r*5-(it.t.length/100)};}).filter(Boolean);
  out.sort(function(a,b){return b.sc-a.sc;});return out.slice(0,9).map(function(x){return x.it;});}
function hl(t,q){var nq=norm(q);if(!nq)return esc(t);var i=t.toLowerCase().indexOf(q.toLowerCase().trim());if(i<0)return esc(t);return esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+q.trim().length))+'</mark>'+esc(t.slice(i+q.trim().length));}
function wire(inp,ul,onPick){var items=[],act=-1;
  function render(){var q=inp.value;items=search(q);
    if(!items.length){items=IDX.filter(function(it){return it.k==='Person';}).slice().sort(function(a,b){return a.t.localeCompare(b.t);});q='';}
    act=items.length?0:-1;
    ul.innerHTML=items.length?items.map(function(it,i){var n=it.n;var av=it.k==='Person'?(n.photo?'<img class="av" src="'+esc(n.photo.file)+'" alt="">':'<span class="av">'+esc(initials(n.name))+'</span>'):'<span class="av">'+(it.k==='Place'?'\u25CF':'\u266A')+'</span>';
      return '<li role="option" id="'+ul.id+'-'+i+'" aria-selected="'+(i===act)+'" data-i="'+i+'">'+av+'<span class="rt"><span class="rn">'+hl(it.t,q)+'</span><span class="rs">'+esc(it.s)+'</span></span><span class="rk">'+it.k+'</span></li>';}).join(''):'';
    ul.hidden=false;inp.setAttribute('aria-expanded','true');}
  function mark(){Array.prototype.forEach.call(ul.querySelectorAll('li[data-i]'),function(li){li.setAttribute('aria-selected',+li.dataset.i===act?'true':'false');});var a=ul.querySelector('[aria-selected=true]');if(a)a.scrollIntoView({block:'nearest'});}
  function pick(i){var it=items[i];if(!it)return;ul.hidden=true;inp.setAttribute('aria-expanded','false');inp.value=it.k==='Person'?it.n.name:it.t;inp.blur();onPick(it);}
  inp.addEventListener('input',render);inp.addEventListener('focus',render);inp.addEventListener('click',render);
  inp.addEventListener('keydown',function(e){if(ul.hidden)return;if(e.key==='ArrowDown'){act=Math.min(items.length-1,act+1);mark();e.preventDefault();}else if(e.key==='ArrowUp'){act=Math.max(0,act-1);mark();e.preventDefault();}else if(e.key==='Enter'){pick(act);e.preventDefault();}});
  ul.addEventListener('mousedown',function(e){e.preventDefault();});
  ul.addEventListener('click',function(e){var li=e.target.closest('li[data-i]');if(li)pick(+li.dataset.i);});
  document.addEventListener('click',function(e){if(!e.target.closest||(!e.target.closest('#'+ul.id)&&e.target!==inp))ul.hidden=true;});
  return {close:function(){ul.hidden=true;}};}
var w1=wire(document.getElementById('q'),document.getElementById('sres'),function(it){
  var n=it.n;if(n===curTo){chainP=null;select(n,false);focusOn(n);return;}
  runChain(n,curTo,true);
  if(window.innerWidth>=900){setTimeout(function(){select(n,false);},350);}
});
var sbox2=document.getElementById('sbox2'),toname=document.getElementById('toname'),toreset=document.getElementById('toreset'),q2=document.getElementById('q2');
var w2=wire(q2,document.getElementById('sres2'),function(it){setTo(it.n);});
function closeRes(){w1.close();w2.close();}
function setTo(n){curTo=n;toname.textContent=n.name;toreset.hidden=n===J;sbox2.hidden=true;
  var qv=norm(document.getElementById('q').value);var from=nodes.filter(function(m){return norm(m.name)===qv;})[0]||lastFrom;
  if(from&&from!==n)runChain(from,n,false);tries();}
document.getElementById('tobtn').addEventListener('click',function(){sbox2.hidden=!sbox2.hidden;if(!sbox2.hidden){q2.value='';q2.focus();}});
toreset.addEventListener('click',function(){setTo(J);});
var lastFrom=null;var _rc=runChain;runChain=function(a,b,c){lastFrom=a;_rc(a,b,c);};
// random
var POOL=nodes.filter(function(n){return n!==J&&n.id!=='kanye-west'&&(n.dj>=2||n.photo);});
var lastR=null;
function randomPick(scroll){var pool=curTo===J?POOL.filter(function(n){return n.dj>=2;}):POOL.filter(function(n){return n!==curTo;});var n;do{n=pool[Math.floor(Math.random()*pool.length)];}while(n===lastR&&pool.length>1);lastR=n;document.getElementById('q').value=n.name;runChain(n,curTo,scroll);}
document.getElementById('rand').addEventListener('click',function(){randomPick(false);});
function tries(){var ids=curTo===J?['taylor-swift','daft-punk','eminem','michael-jackson','usher','amy-winehouse']:['john-legend','pharrell','stevie-wonder'];
  var el=document.getElementById('tries');el.innerHTML='Try: '+ids.filter(function(i){return byId[i]&&byId[i]!==curTo;}).map(function(i){return '<button type="button" data-id="'+i+'">'+esc(byId[i].name)+'</button>';}).join('');
  Array.prototype.forEach.call(el.querySelectorAll('button'),function(b){b.addEventListener('click',function(){var n=byId[b.dataset.id];document.getElementById('q').value=n.name;runChain(n,curTo,false);});});}
// ---- filters + years
Array.prototype.forEach.call(document.querySelectorAll('.chip'),function(c){c.addEventListener('click',function(){var t=c.dataset.type;types[t]=types[t]?0:1;if(t==='met')types.personal=types[t];c.classList.toggle('on',!!types[t]);c.setAttribute('aria-pressed',types[t]?'true':'false');count();draw();});});
var yr=document.getElementById('yr'),yrv=document.getElementById('yrv'),yrc=document.getElementById('yrc');
yr.min=minYear;var tk=document.querySelector('.ticks');tk.innerHTML=[minYear,Math.round(minYear+(2026-minYear)/3),Math.round(minYear+2*(2026-minYear)/3),2026].map(function(y){return '<span>'+y+'</span>';}).join('');
function count(){var c=0,ppl={};edges.forEach(function(e){if(vis(e)){c++;ppl[e.from]=1;ppl[e.to]=1;}});yrc.textContent=c+' links · '+Object.keys(ppl).length+' people';}
yr.addEventListener('input',function(){year=+yr.value;yrv.textContent=year;chainP=null;count();draw();});
var timer=null,playb=document.getElementById('play');
playb.addEventListener('click',function(){if(timer){clearInterval(timer);timer=null;playb.classList.remove('on');playb.innerHTML='\u25B6';return;}
  chainP=null;if(+yr.value>=2026){yr.value=minYear;}playb.classList.add('on');playb.innerHTML='\u275A\u275A';
  timer=setInterval(function(){var v=+yr.value+1;if(v>2026){clearInterval(timer);timer=null;playb.classList.remove('on');playb.innerHTML='\u25B6';return;}yr.value=v;year=v;yrv.textContent=v;count();draw();},300);});
// ---- stats, A to Z, highlights, list, credits
var maxD=nodes.reduce(function(m,n){return Math.max(m,n.dj||0);},0);

var az=document.getElementById('azlist'),azj=document.getElementById('azjump'),groups={};
function sortKey(n){return n.name.replace(/^The /,'').replace(/^[^A-Za-z]+/,'');}
nodes.slice().sort(function(a,b){return sortKey(a).localeCompare(sortKey(b));}).forEach(function(n){var L=sortKey(n)[0].toUpperCase();(groups[L]=groups[L]||[]).push(n);});
Object.keys(groups).sort().forEach(function(L){azj.insertAdjacentHTML('beforeend','<a href="#az-'+L+'">'+L+'</a>');
  var h='<div class="azg"><h3 id="az-'+L+'">'+L+'</h3><ul>';groups[L].forEach(function(n){h+='<li><button type="button" data-id="'+n.id+'">'+photoHTML(n,'',42)+'<span class="an"><b>'+esc(n.name)+'</b><small>'+esc(n.role)+'</small></span><span class="dn" title="links from John Legend">'+(n===J?'JL':n.dj)+'</span></button></li>';});
  az.insertAdjacentHTML('beforeend',h+'</ul></div>');});
az.addEventListener('click',function(e){var b=e.target.closest('button[data-id]');if(!b)return;var n=byId[b.dataset.id];if(n===J){chainP=null;select(J,true);document.getElementById('wrap').scrollIntoView({behavior:'smooth',block:'center'});return;}document.getElementById('q').value=n.name;runChain(n,curTo,true);});
var hls=document.getElementById('hls');
G.highlights.forEach(function(h){var n=byId[h.node];var li=document.createElement('li');li.tabIndex=0;li.innerHTML=photoHTML(n,'',58)+'<div><h3>'+esc(h.title)+'</h3><p>'+esc(h.text)+'</p></div>';
  var go=function(){chainP=null;year=2026;yr.value=2026;yrv.textContent=2026;count();document.getElementById('wrap').scrollIntoView({behavior:'smooth',block:'center'});select(n,true);};
  li.addEventListener('click',go);li.addEventListener('keydown',function(e){if(e.key==='Enter')go();});hls.appendChild(li);});
var el=document.getElementById('elist'),byYear={};
edges.forEach(function(e){(byYear[e.year]=byYear[e.year]||[]).push(e);});
Object.keys(byYear).sort().forEach(function(y){var g='<div class="yrgrp"><h3>'+y+'</h3>';byYear[y].forEach(function(e){
  g+='<div class="erow" style="--tc:'+TC[e.type]+'"><p><span class="tag" style="color:'+TC[e.type]+'">'+TL[e.type]+'</span> · <span class="et">'+esc(e.a.name)+' and '+esc(e.b.name)+': '+esc(e.title)+'.</span> '+esc(e.story||'')+(e.place?' ('+esc(e.place)+')':'')+'</p>'+srcHTML(e)+'</div>';});
  el.insertAdjacentHTML('beforeend',g+'</div>');});
var pc=nodes.filter(function(n){return n.photo;}).map(function(n){return esc(n.name)+': '+esc(n.photo.credit)+', <a href="'+esc(n.photo.source)+'" target="_blank" rel="noopener">'+esc(n.photo.license)+'</a>';});
document.getElementById('pcred').innerHTML='Portraits are cropped from Wikimedia Commons photos. '+pc.join('; ')+'. Song previews play from Apple Music.';
// ---- boot
resize();layout();fit();count();tries();
var hs=(location.hash||'').replace('#','').split('~');
var start=byId[hs[0]]||byId['michael-jackson']||POOL[0];
if(hs[1]&&byId[hs[1]]){curTo=byId[hs[1]];toname.textContent=curTo.name;toreset.hidden=false;}
if(byId[hs[0]])document.getElementById('q').value=start.name;
setTimeout(function(){runChain(start,curTo,false);},250);
})();
