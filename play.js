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
  for(var l=0;l<5;l++)add('line','<line class="pm-ln pm-k" x1="0" x2="'+W+'" y1="'+(y0+l*sp)+'" y2="'+(y0+l*sp)+'" pathLength="1"/>');
  if(opt.clef!==false)add('clef','<g transform="translate(2,'+(y0-20)+')"><path class="pm-clef pm-k" pathLength="1" d="M14 57C10 57 9 52 13 50C19 47 24 53 21 60C18 67 6 66 5 57C4 46 16 39 21 29C25 21 25 11 21 9C16 7 13 18 14 30L19 82C20 90 13 93 10 87"/><circle class="pm-hd pm-k" cx="11.5" cy="86" r="2.6"/></g>');
  var x=30;
  if(opt.time){add('time','<g class="pm-hd pm-k"><text class="pm-ts" x="'+(x+2)+'" y="'+(y0+19)+'">4</text><text class="pm-ts" x="'+(x+2)+'" y="'+(y0+39)+'">4</text></g>');x+=24}
  var M=opt.m,mw=(W-x-4)/M,s=4+Math.floor(r()*3);
  var pats=[['q','q','q','q'],['e','e','q','e','e','q'],['q','e','e','h'],['h','q','q'],['e','e','e','e','q','q'],['q','q','h']];
  function step(){var d=[-2,-1,-1,1,1,2,0][Math.floor(r()*7)];s=Math.max(0,Math.min(8,s+d));return s}
  var slurFrom=null;
  for(var m=0;m<M;m++){
    var p=pats[(opt.seed+m*5+Math.floor(r()*3))%pats.length],bx=x+m*mw+9,beats=0,cell=(mw-14)/4,pend=null;
    for(var n=0;n<p.length;n++){
      var d=p[n],len=d=='h'?2:d=='q'?1:.5,nx=bx+n*((mw-16)/p.length)+4,ss=step(),ny=Y(ss),up=ss<4;
      var sx=up?nx+5.3:nx-5.3,sy2=up?ny-30:ny+30;
      var head=d=='h'?'<g class="pm-hh pm-k"><ellipse cx="'+nx.toFixed(1)+'" cy="'+ny+'" rx="5.4" ry="3.7" transform="rotate(-20 '+nx.toFixed(1)+' '+ny+')"/></g>':'<g class="pm-hd pm-k"><ellipse cx="'+nx.toFixed(1)+'" cy="'+ny+'" rx="5.6" ry="4" transform="rotate(-20 '+nx.toFixed(1)+' '+ny+')"/></g>';
      add('note',head);
      if(d=='e'&&pend){
        /* beam the pair: stems to a shared height */
        var a=pend,upb=(a.ss+ss)/2<4,ex1=upb?a.nx+5.3:a.nx-5.3,ex2=upb?nx+5.3:nx-5.3,by=upb?Math.min(a.ny,ny)-30:Math.max(a.ny,ny)+30;
        add('stem','<line class="pm-st pm-k" pathLength="1" x1="'+ex1.toFixed(1)+'" y1="'+a.ny+'" x2="'+ex1.toFixed(1)+'" y2="'+by+'"/>');
        add('stem','<line class="pm-st pm-k" pathLength="1" x1="'+ex2.toFixed(1)+'" y1="'+ny+'" x2="'+ex2.toFixed(1)+'" y2="'+by+'"/>');
        add('beam','<line class="pm-bm pm-k" pathLength="1" x1="'+ex1.toFixed(1)+'" y1="'+by+'" x2="'+ex2.toFixed(1)+'" y2="'+by+'"/>');
        pend=null;
      }else if(d=='e'){pend={nx:nx,ny:ny,ss:ss}}
      else add('stem','<line class="pm-st pm-k" pathLength="1" x1="'+sx.toFixed(1)+'" y1="'+ny+'" x2="'+sx.toFixed(1)+'" y2="'+sy2+'"/>');
      if(m==0&&n==0)slurFrom=[nx,ny];
      beats+=len;
    }
    var blx=(x+(m+1)*mw).toFixed(1);
    add('bar','<line class="pm-st pm-k" pathLength="1" x1="'+blx+'" x2="'+blx+'" y1="'+y0+'" y2="'+(y0+40)+'"/>');
    if(m==1&&slurFrom&&opt.slur!==false){var sx2=x+2*mw-14,top=y0-12;add('slur','<path class="pm-sl pm-k" pathLength="1" d="M'+(slurFrom[0]-2).toFixed(1)+' '+top+'Q'+((slurFrom[0]+sx2)/2).toFixed(1)+' '+(top-14)+' '+sx2.toFixed(1)+' '+top+'"/>')}
  }
  if(opt.end){var ex=W-1.5;add('bar','<line class="pm-bm2 pm-k" pathLength="1" x1="'+ex+'" x2="'+ex+'" y1="'+y0+'" y2="'+(y0+40)+'"/>')}
  var n=items.length;
  for(var i=0;i<n;i++){var k=opt.order?i/n:0;out.push(items[i][1].replace('class="','data-k="'+(i/n).toFixed(3)+'" class="'))}
  return '<svg class="pm-svg" viewBox="0 '+(y0-34)+' '+W+' '+(opt.h||100)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+out.join('')+'</svg>';
}
/* hero: writes itself as you scroll */
var hero=document.getElementById('pm-hero'),stage=document.getElementById('pm-stage');
hero.innerHTML=staff({w:250,seed:5,m:2,time:true,h:84})+staff({w:250,seed:9,m:2,end:true,slur:false,h:84});
var hk=[];[].forEach.call(hero.querySelectorAll('svg'),function(svg,si){[].forEach.call(svg.querySelectorAll('.pm-k'),function(e){hk.push([e,(si+(+e.getAttribute('data-k')))/2])})});
var last=-1,ticking=false;
function prog(){var r=stage.getBoundingClientRect(),vh=innerHeight;return Math.max(0,Math.min(1,(vh*.6-r.top)/Math.max(1,r.height-vh*.4)))}
function paint(){ticking=false;var p=RM?1:prog(),q=Math.round(p*200)/200;if(q===last)return;last=q;
  var w=Math.min(1,Math.max(0,(q-.08)/.62));
  for(var i=0;i<hk.length;i++){var on=hk[i][1]<=w;if(on!==hk[i][0].__on){hk[i][0].__on=on;hk[i][0].classList.toggle('w',on)}}
  sec.classList.toggle('pm-t-on',q>.01);sec.classList.toggle('pm-l-on',q>.76)}
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(paint)}}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);paint();
/* minis and fan */
[].forEach.call(sec.querySelectorAll('.pm-mini'),function(el){el.innerHTML=staff({w:240,seed:+el.getAttribute('data-seed'),m:2,time:true,h:82})});
var fan=document.getElementById('pm-fan');
[].forEach.call(fan.querySelectorAll('.pm-k'),function(e){e.style.transitionDelay=(RM?0:(.7+(+e.getAttribute('data-k'))*1.2)).toFixed(2)+'s'});
function fanOn(){fan.classList.add('on');[].forEach.call(fan.querySelectorAll('.pm-k'),function(e){e.classList.add('w')})}
if(RM||!('IntersectionObserver' in window))fanOn();
else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){fanOn();io.disconnect()}})},{threshold:.25});io.observe(fan)}
/* the opened page */
var dlg=document.getElementById('pm-dlg'),body=dlg.querySelector('.pm-dlg-body'),audio=null,opener=null;
function stopA(){if(audio){audio.pause()}var b=body.querySelector('.pm-play');if(b){b.setAttribute('aria-pressed','false');b.querySelector('.pm-lbl').textContent='Play 30s preview'}dlg.classList.remove('playing')}
function open(btn){
  var id=btn.getAttribute('data-song'),t=document.getElementById('pm-t-'+id);if(!t)return;opener=btn;
  body.innerHTML='';body.appendChild(t.content.cloneNode(true));
  var sc=body.querySelector('.pm-d-score'),sd=+t.getAttribute('data-seed'),h='';
  for(var s=0;s<3;s++)h+=staff({w:340,seed:sd+s*13,m:3,time:s==0,clef:true,end:s==2,slur:s!=1,h:92});
  sc.innerHTML=h;
  var ks=[].slice.call(sc.querySelectorAll('svg'));
  ks.forEach(function(svg,si){[].forEach.call(svg.querySelectorAll('.pm-k'),function(e){e.style.transitionDelay=(RM?0:(.35+si*1.1+(+e.getAttribute('data-k'))*1.05)).toFixed(2)+'s'})});
  dlg.setAttribute('aria-label',t.getAttribute('data-title')+' page');
  var pb=body.querySelector('.pm-play');pb.setAttribute('aria-label','Play 30s preview of '+t.getAttribute('data-title'));
  pb.addEventListener('click',function(){
    if(audio&&!audio.paused&&audio.__id===id){stopA();return}
    audio=audio||new Audio();if(audio.__id!==id){audio.src=t.getAttribute('data-src');audio.__id=id}audio.onended=stopA;
    var pr=audio.play();pb.setAttribute('aria-pressed','true');pb.querySelector('.pm-lbl').textContent='Pause preview';dlg.classList.add('playing');
    if(pr&&pr.catch)pr.catch(stopA)});
  document.documentElement.classList.add('pm-lock');
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
  dlg.querySelector('.pm-dlg-in').scrollTop=0;
  if(!RM&&dlg.animate){var r=btn.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,s=r.width/vw,dx=r.left+r.width/2-vw/2,dy=r.top+r.height/2-vh/2,rot=getComputedStyle(btn).getPropertyValue('--rot')||'0deg';
    dlg.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+s.toFixed(3)+') rotate('+rot.trim()+')',opacity:.6},{transform:'none',opacity:1}],{duration:560,easing:'cubic-bezier(.2,.8,.2,1)'})}
  requestAnimationFrame(function(){requestAnimationFrame(function(){[].forEach.call(sc.querySelectorAll('.pm-k'),function(e){e.classList.add('w')});dlg.classList.add('in')})});
}
function close(){stopA();dlg.classList.remove('in');if(dlg.close&&dlg.open)dlg.close();else dlg.removeAttribute('open');document.documentElement.classList.remove('pm-lock');if(opener)opener.focus({preventScroll:true})}
[].forEach.call(sec.querySelectorAll('.pm-page'),function(b){b.addEventListener('click',function(){open(b)})});
dlg.querySelector('.pm-close').addEventListener('click',close);
dlg.addEventListener('cancel',function(e){e.preventDefault();close()});
dlg.addEventListener('click',function(e){if(e.target===dlg)close()});
})();
