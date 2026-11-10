(function(){
var sec=document.getElementById('play');if(!sec)return;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var NS='http://www.w3.org/2000/svg';
sec.classList.add('pm-js');if(RM)sec.classList.add('pm-rm');
function rng(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
/* Illustrative notation, drawn here. Not a transcription of any song. */
function staff(opt){
  var W=opt.w,y0=opt.y0||30,sp=10,r=rng(opt.seed),out=[],items=[];
  function Y(s){return y0+40-s*5}
  function add(k,html){items.push([k,html])}
  for(var l=0;l<5;l++)add('line','<line class="pm-ln pm-k" style="--o:'+[1,-1,1,-1,1][l]+'" x1="0" x2="'+W+'" y1="'+(y0+l*sp)+'" y2="'+(y0+l*sp)+'" pathLength="1"/>');
  if(opt.clef!==false)add('clef','<g transform="translate(2,'+(y0-20)+')"><path class="pm-clef pm-k" pathLength="1" d="M14 57C10 57 9 52 13 50C19 47 24 53 21 60C18 67 6 66 5 57C4 46 16 39 21 29C25 21 25 11 21 9C16 7 13 18 14 30L19 82C20 90 13 93 10 87"/><circle class="pm-hd pm-k" cx="11.5" cy="86" r="2.6"/></g>');
  var x=30;
  if(opt.time){add('time','<g class="pm-hd pm-k"><text class="pm-ts" x="'+(x+2)+'" y="'+(y0+19)+'">4</text><text class="pm-ts" x="'+(x+2)+'" y="'+(y0+39)+'">4</text></g>');x+=24}
  var M=opt.m,mw=(W-x-4)/M,s=4+Math.floor(r()*3),ms=[],ni=0;
  var pats=[['q','q','q','q'],['e','e','q','e','e','q'],['q','e','e','h'],['h','q','q'],['e','e','e','e','q','q'],['q','q','h']];
  function step(){var d=[-2,-1,-1,1,1,2,0][Math.floor(r()*7)];s=Math.max(0,Math.min(8,s+d));return s}
  var slurFrom=null;
  for(var m=0;m<M;m++){
    var p=pats[(opt.seed+m*5+Math.floor(r()*3))%pats.length],bx=x+m*mw+9,beats=0,cell=(mw-14)/4,pend=null;ms.push(x+m*mw);
    for(var n=0;n<p.length;n++){
      var d=p[n],len=d=='h'?2:d=='q'?1:.5,nx=bx+n*((mw-16)/p.length)+4,ss=step(),ny=Y(ss),up=ss<4;
      var sx=up?nx+5.3:nx-5.3,sy2=up?ny-30:ny+30;
      var NA=' data-b="'+(m*4+beats)+'" data-x="'+nx.toFixed(1)+'" data-ni="'+ni+'"',head=d=='h'?'<g class="pm-hh pm-nt pm-k"'+NA+'><ellipse cx="'+nx.toFixed(1)+'" cy="'+ny+'" rx="5.4" ry="3.7" transform="rotate(-20 '+nx.toFixed(1)+' '+ny+')"/></g>':'<g class="pm-hd pm-nt pm-k"'+NA+'><ellipse cx="'+nx.toFixed(1)+'" cy="'+ny+'" rx="5.6" ry="4" transform="rotate(-20 '+nx.toFixed(1)+' '+ny+')"/></g>';
      add('note',head);
      if(d=='e'&&pend){
        /* beam the pair: stems to a shared height */
        var a=pend,upb=(a.ss+ss)/2<4,ex1=upb?a.nx+5.3:a.nx-5.3,ex2=upb?nx+5.3:nx-5.3,by=upb?Math.min(a.ny,ny)-30:Math.max(a.ny,ny)+30;
        add('stem','<line class="pm-st pm-stm pm-k '+(upb?'pm-up':'pm-dn')+'" data-ni="'+a.ni+'" pathLength="1" x1="'+ex1.toFixed(1)+'" y1="'+a.ny+'" x2="'+ex1.toFixed(1)+'" y2="'+by+'"/>');
        add('stem','<line class="pm-st pm-stm pm-k '+(upb?'pm-up':'pm-dn')+'" data-ni="'+ni+'" pathLength="1" x1="'+ex2.toFixed(1)+'" y1="'+ny+'" x2="'+ex2.toFixed(1)+'" y2="'+by+'"/>');
        add('beam','<line class="pm-bm pm-k '+(upb?'pm-up':'pm-dn')+'" data-ni="'+ni+'" pathLength="1" x1="'+ex1.toFixed(1)+'" y1="'+by+'" x2="'+ex2.toFixed(1)+'" y2="'+by+'"/>');
        pend=null;
      }else if(d=='e'){pend={nx:nx,ny:ny,ss:ss,ni:ni}}
      else add('stem','<line class="pm-st pm-stm pm-k '+(up?'pm-up':'pm-dn')+'" data-ni="'+ni+'" pathLength="1" x1="'+sx.toFixed(1)+'" y1="'+ny+'" x2="'+sx.toFixed(1)+'" y2="'+sy2+'"/>');
      if(m==0&&n==0)slurFrom=[nx,ny];
      beats+=len;ni++;
    }
    var blx=(x+(m+1)*mw).toFixed(1);
    add('bar','<line class="pm-st pm-k" pathLength="1" x1="'+blx+'" x2="'+blx+'" y1="'+y0+'" y2="'+(y0+40)+'"/>');
    if(m==1&&slurFrom&&opt.slur!==false){var sx2=x+2*mw-14,top=y0-12;add('slur','<path class="pm-sl pm-k" data-b="0" data-e="7" pathLength="1" d="M'+(slurFrom[0]-2).toFixed(1)+' '+top+'Q'+((slurFrom[0]+sx2)/2).toFixed(1)+' '+(top-14)+' '+sx2.toFixed(1)+' '+top+'"/>')}
  }
  if(opt.dyn!==false){var dy=y0+64,dn=opt.dyn||['mp','mf'];
    add('dyn','<text class="pm-dy pm-k" data-b="0" x="'+(ms[0]+6).toFixed(1)+'" y="'+dy+'">'+dn[0]+'</text>');
    if(M>1){var h0=ms[1]+8,h1=ms[1]+mw-10;add('hair','<path class="pm-hp pm-k" data-b="4" data-e="7.5" pathLength="1" d="M'+h1.toFixed(1)+' '+(dy-9)+'L'+h0.toFixed(1)+' '+(dy-5)+'L'+h1.toFixed(1)+' '+(dy-1)+'"/>')}
    if(M>2)add('dyn','<text class="pm-dy pm-k" data-b="8" x="'+(ms[2]+6).toFixed(1)+'" y="'+dy+'">'+dn[1]+'</text>')}
  if(opt.end){var ex=W-1.5;add('bar','<line class="pm-bm2 pm-k" pathLength="1" x1="'+ex+'" x2="'+ex+'" y1="'+y0+'" y2="'+(y0+40)+'"/>')}
  var n=items.length;
  for(var i=0;i<n;i++){var k=opt.order?i/n:0;out.push(items[i][1].replace('class="','data-k="'+(i/n).toFixed(3)+'" class="'))}
  out.push('<rect class="pm-ph" x="-1.1" y="'+(y0-16)+'" width="2.2" height="72"/>');
  return '<svg class="pm-svg" data-m="'+M+'" data-ms="'+ms.map(function(v){return v.toFixed(1)}).join(',')+','+(x+M*mw).toFixed(1)+'" viewBox="0 '+(y0-34)+' '+W+' '+(opt.h||100)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+out.join('')+'</svg>';
}
/* hero: writes itself as you scroll */
var hero=document.getElementById('pm-hero'),stage=document.getElementById('pm-stage');
hero.innerHTML=staff({w:250,seed:5,m:2,time:true,h:96,dyn:['mp','mf']})+staff({w:250,seed:9,m:2,end:true,slur:false,h:96,dyn:['mf','f']});
var hk=[];[].forEach.call(hero.querySelectorAll('svg'),function(svg,si){[].forEach.call(svg.querySelectorAll('.pm-k'),function(e){hk.push([e,(si+(+e.getAttribute('data-k')))/2])})});
var last=-1,ticking=false,heroLive=false;
function prog(){var r=stage.getBoundingClientRect(),vh=innerHeight;return Math.max(0,Math.min(1,(vh*.6-r.top)/Math.max(1,r.height-vh*.4)))}
function paint(){ticking=false;var p=RM?1:prog(),q=Math.round(p*200)/200;if(q===last)return;last=q;
  var w=Math.min(1,Math.max(0,(q-.08)/.62));
  if(heroLive)w=1;
  for(var i=0;i<hk.length;i++){var on=hk[i][1]<=w;if(on!==hk[i][0].__on){hk[i][0].__on=on;hk[i][0].classList.toggle('w',on)}}
  sec.classList.toggle('pm-t-on',q>.01);sec.classList.toggle('pm-l-on',q>.76)}
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(paint)}}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);paint();
/* minis and fan */
[].forEach.call(sec.querySelectorAll('.pm-mini'),function(el){el.innerHTML=staff({w:240,seed:+el.getAttribute('data-seed'),m:2,time:true,h:82,dyn:false})});
var fan=document.getElementById('pm-fan');
[].forEach.call(fan.querySelectorAll('.pm-k'),function(e){e.style.transitionDelay=(RM?0:(.7+(+e.getAttribute('data-k'))*1.2)).toFixed(2)+'s'});
function fanOn(){fan.classList.add('on');[].forEach.call(fan.querySelectorAll('.pm-k'),function(e){e.classList.add('w')})}
if(RM||!('IntersectionObserver' in window))fanOn();
else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){fanOn();io.disconnect()}})},{threshold:.25});io.observe(fan)}
/* ---- play along: the drawn score performs with the preview ----
   Notation is illustrative. Timing follows the audio clock (currentTime); the pulse follows the
   preview's real loudness when it can be decoded (Apple's preview CDN sends CORS *), else a steady tempo. */
var A={el:null,id:null,src:null,perf:null,raf:0,an:{},ui:null,lastCT:-1,lastAt:0};sec.__pm=A;
function analyze(id,url){
  if(A.an[id])return;A.an[id]={ok:false};
  var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!OAC||!window.fetch)return;
  fetch(url,{mode:'cors',credentials:'omit'}).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(function(buf){
    var ctx=new OAC(1,44100,44100);
    return new Promise(function(res,rej){var p=ctx.decodeAudioData(buf,res,rej);if(p&&p.then)p.then(res,rej)})
  }).then(function(ab){
    var FPS=60,sr=ab.sampleRate,hop=Math.floor(sr/FPS),c0=ab.getChannelData(0),c1=ab.numberOfChannels>1?ab.getChannelData(1):null,n=Math.floor(c0.length/hop),env=new Float32Array(n),on=new Float32Array(n),pe=0;
    for(var f=0;f<n;f++){var s=0,o=f*hop;for(var i=0;i<hop;i+=2){var v=c1?(c0[o+i]+c1[o+i])*.5:c0[o+i];s+=v*v}var e=Math.sqrt(s/(hop/2));env[f]=e;var le=Math.log(1e-4+e);on[f]=Math.max(0,le-pe);pe=le}
    var srt=Array.prototype.slice.call(env).sort(function(a,b){return a-b}),hi=srt[Math.floor(n*.97)]||1,lo=srt[Math.floor(n*.1)]||0;
    for(f=0;f<n;f++)env[f]=Math.max(0,Math.min(1,(env[f]-lo)/Math.max(1e-6,hi-lo)));
    var best=0,bl=36;for(var L=24;L<=52;L++){var acc=0;for(f=L;f<n;f++)acc+=on[f]*on[f-L];acc*=1-Math.abs(60*FPS/L-104)/400;if(acc>best){best=acc;bl=L}}
    var bpm=60*FPS/bl,bo=0,bs=-1;for(var ph=0;ph<bl;ph++){var sc=0;for(f=ph;f<n;f+=bl)sc+=on[f];if(sc>bs){bs=sc;bo=ph}}
    A.an[id]={ok:true,env:env,fps:FPS,bpm:bpm,phase:bo/FPS};
    if(A.perf&&A.id===id)A.perf.jump=true;
  }).catch(function(){});
}
function Perf(root,scroller){
  var P={root:root,sys:[],beats:0,pass:-1,cur:-1,jump:true,scroller:scroller};
  [].forEach.call(root.querySelectorAll('.pm-svg'),function(svg){
    var ms=(svg.getAttribute('data-ms')||'').split(',').map(Number),S={svg:svg,b0:P.beats,len:(+svg.getAttribute('data-m'))*4,ms:ms,notes:[],marks:[],lines:[].slice.call(svg.querySelectorAll('.pm-ln')),ph:svg.querySelector('.pm-ph'),anc:[]};
    [].forEach.call(svg.querySelectorAll('.pm-nt'),function(h){var ni=h.getAttribute('data-ni');S.notes.push({b:+h.getAttribute('data-b'),x:+h.getAttribute('data-x'),els:[h].concat([].slice.call(svg.querySelectorAll('.pm-stm[data-ni="'+ni+'"],.pm-bm[data-ni="'+ni+'"]'))),on:false})});
    S.notes.sort(function(a,b){return a.b-b.b});
    [].forEach.call(svg.querySelectorAll('.pm-dy,.pm-sl,.pm-hp'),function(e){S.marks.push({el:e,b:+e.getAttribute('data-b'),e:+(e.getAttribute('data-e')||0),on:false})});
    for(var m=0;m<ms.length-1;m++){S.anc.push([m*4,ms[m]]);S.notes.forEach(function(nt){if(nt.b>=m*4&&nt.b<m*4+4)S.anc.push([nt.b,nt.x])})}
    S.anc.push([S.len,ms[ms.length-1]]);
    S.anc.sort(function(a,b){return a[0]-b[0]});
    P.beats+=S.len;P.sys.push(S)});
  P.xAt=function(S,b){var a=S.anc;for(var i=1;i<a.length;i++){if(b<=a[i][0]){var p=a[i-1],q=a[i],u=(b-p[0])/Math.max(1e-6,q[0]-p[0]);return p[1]+(q[1]-p[1])*u}}return a[a.length-1][1]};
  P.start=function(){root.classList.add('pm-pa');[].forEach.call(root.querySelectorAll('.pm-k'),function(e){e.style.transitionDelay='0s';e.classList.add('w')});P.jump=true};
  P.stop=function(){root.classList.remove('pm-pa');P.sys.forEach(function(S){S.svg.classList.remove('pm-act','pm-loud');S.svg.style.removeProperty('--f');S.svg.style.removeProperty('--v');
    S.notes.forEach(function(nt){nt.on=false;nt.els.forEach(function(e){e.classList.remove('pm-hit','pm-pop')})});S.marks.forEach(function(mk){mk.on=false;mk.el.classList.remove('pm-r');mk.el.style.transitionDuration=''})});P.pass=-1;P.cur=-1};
  P.frame=function(t,bpm,phase,loud,spb){
    var beat=(t-phase)*bpm/60,jump=P.jump;P.jump=false;
    if(beat<0)beat=0;
    var pass=Math.floor(beat/P.beats),lb=beat-pass*P.beats;
    if(pass!==P.pass){if(P.pass!==-1)jump=jump||pass!==P.pass+1;P.pass=pass;P.sys.forEach(function(S){S.notes.forEach(function(nt){if(nt.on){nt.on=false;nt.els.forEach(function(e){e.classList.remove('pm-hit','pm-pop')})}});S.marks.forEach(function(mk){if(mk.on){mk.on=false;mk.el.classList.remove('pm-r')}})})}
    var pulse=Math.pow(1-(beat%1),2.4)*(.35+.65*loud);
    for(var i=0;i<P.sys.length;i++){var S=P.sys[i],sb=lb-S.b0,act=sb>=0&&sb<S.len;
      if(act&&P.cur!==i){if(P.cur!==-1)P.sys[P.cur].svg.classList.remove('pm-act');S.svg.classList.add('pm-act');P.cur=i;P.page(S)}
      for(var j=0;j<S.notes.length;j++){var nt=S.notes[j],on=sb>=nt.b-.02;if(on!==nt.on){nt.on=on;var pop=on&&!jump&&!RM&&sb-nt.b<.75;
        for(var k=0;k<nt.els.length;k++){var e=nt.els[k];e.classList.toggle('pm-hit',on);if(e.classList.contains('pm-nt')){e.classList.remove('pm-pop');if(pop)e.classList.add('pm-pop')}}}}
      for(j=0;j<S.marks.length;j++){var mk=S.marks[j],mo=sb>=mk.b-.02;if(mo!==mk.on){mk.on=mo;if(mo&&mk.e)mk.el.style.transitionDuration=(jump?0:Math.max(.3,(mk.e-mk.b)*spb*.9)).toFixed(2)+'s';mk.el.classList.toggle('pm-r',mo)}}
      if(act){if(!RM){S.ph.style.transform='translateX('+P.xAt(S,sb).toFixed(2)+'px)';S.svg.style.setProperty('--f',pulse.toFixed(3));S.svg.style.setProperty('--v',(loud*loud*1.1*Math.sin(t*2*Math.PI*7.5)).toFixed(3))}
        var ld=loud>.82;if(ld!==S.ld){S.ld=ld;S.svg.classList.toggle('pm-loud',ld)}}}
  };
  P.page=function(S){var sc=P.scroller;if(!sc)return;var r=S.svg.getBoundingClientRect(),vh=innerHeight;if(r.top<8||r.bottom>vh-8){var to=sc.scrollTop+r.top-Math.max(16,(vh-r.height)/2.6);if(sc.scrollTo)sc.scrollTo({top:to,behavior:RM?'auto':'smooth'});else sc.scrollTop=to}};
  return P;
}
function clock(){var a=A.el,ct=a.currentTime,now=performance.now();
  if(a.paused){A.lastCT=ct;A.lastAt=now;return ct}
  if(ct!==A.lastCT){A.lastCT=ct;A.lastAt=now;return ct}
  return ct+Math.min(.3,(now-A.lastAt)/1000)*(a.playbackRate||1)}
function render(){var a=A.el;if(!a||!A.perf)return;var t=clock(),an=A.an[A.id],bpm=96,phase=0,loud=.55,spb;
  if(an&&an.ok){bpm=an.bpm;phase=an.phase;var f=Math.min(an.env.length-1,Math.max(0,Math.floor(t*an.fps)));loud=an.env[f]}
  else loud=.5+.12*Math.sin(t*Math.PI*bpm/120);
  spb=60/bpm;A.perf.frame(t,bpm,phase,loud,spb);
  if(A.ui)A.ui(t,a.duration||30);
}
function loop(){A.raf=0;render();if(A.el&&!A.el.paused&&!A.el.ended)A.raf=requestAnimationFrame(loop)}
function kick(){if(!A.raf)A.raf=requestAnimationFrame(loop)}
function ensureAudio(){if(A.el)return A.el;var a=A.el=new Audio();a.preload='auto';
  a.addEventListener('play',function(){A.perf&&(A.perf.jump=true);kick();A.sync&&A.sync(true)});
  a.addEventListener('playing',kick);
  a.addEventListener('pause',function(){if(A.raf){cancelAnimationFrame(A.raf);A.raf=0}render();A.sync&&A.sync(false)});
  a.addEventListener('seeked',function(){if(A.perf){A.perf.jump=true;render()}});
  a.addEventListener('ended',function(){var p=A.perf;A.sync&&A.sync(false);if(p)p.stop()});
  return a}
/* bind the shared preview to a score; target switches without restarting when the song is the same */
function perform(id,src,root,scroller,ui,sync){var a=ensureAudio();
  if(A.perf&&A.perf.root!==root){A.perf.stop()}
  if(A.sync&&A.sync!==sync)A.sync(false);
  A.ui=ui;A.sync=sync;
  if(A.id!==id){a.src=src;A.id=id;A.src=src}
  if(!A.perf||A.perf.root!==root){A.perf=Perf(root,scroller);}
  A.perf.start();analyze(id,src);
  if(a.ended||a.currentTime>=(a.duration||30)-.05)a.currentTime=0;
  var pr=a.play();if(pr&&pr.catch)pr.catch(function(){sync(false);A.perf&&A.perf.stop()});
  sync(true);kick();
}
function pauseAll(){if(A.el&&!A.el.paused)A.el.pause()}
function fmt(t){t=Math.max(0,Math.floor(t));return '0:'+(t<10?'0':'')+t}
/* hero: Play makes the scroll-in staff perform with Daylight */
var dsrc=(document.getElementById('pm-t-daylight')||{getAttribute:function(){return ''}}).getAttribute('data-src');
var hn=sec.querySelector('.pm-hero-note');
if(hn&&dsrc){var hp=document.createElement('p');hp.className='pm-hp-row';
  hp.innerHTML='<button class="pm-play pm-hplay" type="button" aria-pressed="false" aria-label="Play the Daylight preview and watch the staff perform"><span class="pm-ico" aria-hidden="true"></span><span class="pm-lbl">Play</span></button><span class="pm-hp-cap">Daylight, 30s preview. The staff plays along.</span>';
  hn.parentNode.insertBefore(hp,hn.nextSibling);
  var hb=hp.querySelector('button');
  function hsync(on){hb.setAttribute('aria-pressed',on?'true':'false');hb.querySelector('.pm-lbl').textContent=on?'Pause':'Play';if(!on&&A.el&&A.el.ended){heroLive=false;last=-1;onScroll()}}
  hb.addEventListener('click',function(){
    if(A.el&&!A.el.paused&&A.perf&&A.perf.root===hero){pauseAll();return}
    heroLive=true;last=-1;paint();
    perform('daylight',dsrc,hero,null,null,hsync)});
}
/* the opened page */
var dlg=document.getElementById('pm-dlg'),body=dlg.querySelector('.pm-dlg-body'),opener=null;
function stopA(){pauseAll();if(A.perf&&A.perf.root===body){A.perf.stop();A.perf=null}}
function open(btn){
  var id=btn.getAttribute('data-song'),t=document.getElementById('pm-t-'+id);if(!t)return;opener=btn;
  var carry=A.el&&!A.el.paused&&A.id===id&&A.perf&&A.perf.root===hero;
  if(!carry){pauseAll()}
  if(A.perf&&A.perf.root===hero){A.perf.stop();A.perf=null;heroLive=false;last=-1;paint()}
  body.innerHTML='';body.appendChild(t.content.cloneNode(true));
  var sc=body.querySelector('.pm-d-score'),sd=+t.getAttribute('data-seed'),h='';
  for(var s=0;s<3;s++)h+=staff({w:340,seed:sd+s*13,m:3,time:s==0,clef:true,end:s==2,slur:s!=1,h:104,dyn:[['mp','mf'],['mf','f'],['f','mp']][s]});
  sc.innerHTML=h;
  var bar=document.createElement('div');bar.className='pm-pa-bar';
  bar.innerHTML='<button class="pm-play pm-pa-btn" type="button" aria-pressed="false"><span class="pm-ico" aria-hidden="true"></span><span class="pm-lbl">Play along</span></button><span class="pm-pa-t" aria-hidden="true">0:00 / 0:30</span><span class="pm-pa-prog" aria-hidden="true"><span></span></span>';
  sc.parentNode.insertBefore(bar,sc);
  var ks=[].slice.call(sc.querySelectorAll('svg'));
  ks.forEach(function(svg,si){[].forEach.call(svg.querySelectorAll('.pm-k'),function(e){e.style.transitionDelay=(RM?0:(.35+si*1.1+(+e.getAttribute('data-k'))*1.05)).toFixed(2)+'s'})});
  dlg.setAttribute('aria-label',t.getAttribute('data-title')+' page');
  var pb=body.querySelector('.pm-d-acts .pm-play'),bb=bar.querySelector('.pm-play'),tt=bar.querySelector('.pm-pa-t'),pg=bar.querySelector('.pm-pa-prog'),pgi=pg.firstChild,shown=-1;
  pb.setAttribute('aria-label','Play 30s preview of '+t.getAttribute('data-title'));bb.setAttribute('aria-label','Play along with the 30s preview of '+t.getAttribute('data-title'));
  function ui(tm,d){var s2=Math.floor(tm);if(s2!==shown){shown=s2;tt.textContent=fmt(tm)+' / '+fmt(d||30)}pgi.style.transform='scaleX('+Math.min(1,tm/(d||30)).toFixed(4)+')'}
  function sync(on){[pb,bb].forEach(function(b){b.setAttribute('aria-pressed',on?'true':'false')});pb.querySelector('.pm-lbl').textContent=on?'Pause preview':'Play 30s preview';bb.querySelector('.pm-lbl').textContent=on?'Pause':'Play along'}
  var scroller=dlg.querySelector('.pm-dlg-in');
  function toggle(fromBottom){
    if(A.el&&!A.el.paused&&A.id===id&&A.perf&&A.perf.root===body){pauseAll();return}
    perform(id,t.getAttribute('data-src'),body,scroller,ui,sync);
    if(fromBottom){var r=bar.getBoundingClientRect();if(scroller.scrollTo)scroller.scrollTo({top:scroller.scrollTop+r.top-12,behavior:RM?'auto':'smooth'});else scroller.scrollTop+=r.top-12}}
  pb.addEventListener('click',function(){toggle(true)});bb.addEventListener('click',function(){toggle(false)});
  pg.addEventListener('click',function(e){if(!A.el||A.id!==id)return;var r=pg.getBoundingClientRect(),d=A.el.duration||30;A.el.currentTime=Math.max(0,Math.min(d-.1,(e.clientX-r.left)/r.width*d));render()});
  document.documentElement.classList.add('pm-lock');
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
  scroller.scrollTop=0;
  if(!RM&&dlg.animate){var r=btn.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,s1=r.width/vw,dx=r.left+r.width/2-vw/2,dy=r.top+r.height/2-vh/2,rot=getComputedStyle(btn).getPropertyValue('--rot')||'0deg';
    dlg.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+s1.toFixed(3)+') rotate('+rot.trim()+')',opacity:.6},{transform:'none',opacity:1}],{duration:560,easing:'cubic-bezier(.2,.8,.2,1)'})}
  requestAnimationFrame(function(){requestAnimationFrame(function(){[].forEach.call(sc.querySelectorAll('.pm-k'),function(e){e.classList.add('w')});dlg.classList.add('in')})});
  if(carry){A.ui=null;perform(id,t.getAttribute('data-src'),body,scroller,ui,sync)}
}
function close(){stopA();dlg.classList.remove('in');if(dlg.close&&dlg.open)dlg.close();else dlg.removeAttribute('open');document.documentElement.classList.remove('pm-lock');if(opener)opener.focus({preventScroll:true})}
[].forEach.call(sec.querySelectorAll('.pm-page'),function(b){b.addEventListener('click',function(){open(b)})});
dlg.querySelector('.pm-close').addEventListener('click',close);
dlg.addEventListener('cancel',function(e){e.preventDefault();close()});
dlg.addEventListener('click',function(e){if(e.target===dlg)close()});
})();
