(function(){
var sec=document.getElementById('play');if(!sec)return;
var songs=sec.querySelectorAll('.pm-song');
function size(){songs.forEach(function(s){s.style.setProperty('--w',(s.clientWidth+10)+'px')})}
songs.forEach(function(s,i){s.querySelectorAll('.pm-note').forEach(function(n,j){n.style.animationDelay=(-(i*3.7+j*3.1)%14).toFixed(1)+'s'})});
size();window.addEventListener('resize',size);
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){sec.classList.add('on');io.disconnect()}})},{threshold:.2});io.observe(sec)}else{sec.classList.add('on')}
var audio=null,cur=null;
function stop(){if(!cur)return;cur.classList.remove('playing');var b=cur.querySelector('.pm-play');b.setAttribute('aria-pressed','false');b.querySelector('.pm-lbl').textContent='Play 30s preview';cur=null}
songs.forEach(function(s){var b=s.querySelector('.pm-play');b.addEventListener('click',function(){
 if(cur===s){audio.pause();stop();return}
 if(audio)audio.pause();stop();
 audio=audio||new Audio();audio.src=s.getAttribute('data-src');audio.onended=stop;
 var p=audio.play();cur=s;s.classList.add('playing');b.setAttribute('aria-pressed','true');b.querySelector('.pm-lbl').textContent='Pause preview';
 if(p&&p.catch)p.catch(function(){stop()});
})});
})();
