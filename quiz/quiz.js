(function(){
var Q=window.QZ||[],PL=window.QZ_PLAYLIST;var box=document.getElementById('qz');var i=0,score=0,res=[];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function srcs(q){return '<p class="qz-src"><span>Source</span>'+q.s.map(function(x){return '<a href="'+esc(x[1])+'" target="_blank" rel="noopener">'+esc(x[0])+'</a>'}).join('')+'</p>'}
function show(){var q=Q[i];
 box.innerHTML='<div class="qz-top"><span>Question '+(i+1)+' of '+Q.length+'</span><span>Score '+score+'</span></div><div class="qz-bar"><i style="width:'+(i/Q.length*100)+'%"></i></div>'+
 '<p class="qz-q">'+esc(q.q)+'</p><ul class="qz-opts">'+q.o.map(function(o,k){return '<li><button class="qz-opt" type="button" data-k="'+k+'"><b>'+'ABCD'[k]+'</b><span>'+esc(o)+'</span></button></li>'}).join('')+'</ul><div id="qz-a"></div>';
 [].forEach.call(box.querySelectorAll('.qz-opt'),function(b){b.addEventListener('click',function(){answer(+b.getAttribute('data-k'))})});
 var h=box.querySelector('.qz-q');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}
 if(i>0)box.scrollIntoView({behavior:'smooth',block:'start'});}
function answer(k){var q=Q[i];var ok=k===q.a;if(ok)score++;res.push(ok);
 [].forEach.call(box.querySelectorAll('.qz-opt'),function(b){var j=+b.getAttribute('data-k');b.disabled=true;if(j===q.a)b.classList.add('right');else if(j===k)b.classList.add('wrong');else b.classList.add('dim');});
 box.querySelector('.qz-top span:last-child').textContent='Score '+score;
 box.querySelector('.qz-bar i').style.width=((i+1)/Q.length*100)+'%';
 var last=i===Q.length-1;
 document.getElementById('qz-a').innerHTML='<div class="qz-ans"><p class="qz-verdict '+(ok?'ok':'no')+'">'+(ok?'Correct':'The answer: '+esc(q.o[q.a]))+'</p><p class="qz-exp">'+esc(q.e)+'</p>'+srcs(q)+'<div class="qz-next"><button class="qz-btn" type="button" id="qz-n">'+(last?'See your score':'Next question')+'</button></div></div>';
 var n=document.getElementById('qz-n');n.addEventListener('click',function(){i++;if(i<Q.length)show();else end();});
 setTimeout(function(){document.getElementById('qz-a').scrollIntoView({behavior:'smooth',block:'nearest'})},60);}
function rank(s,n){if(s===n)return'Liner notes level';if(s>=n-3)return'Front row';if(s>=n/2)return'Getting warm';return'Start with Daylight';}
function end(){var n=Q.length;var r=rank(score,n);
 var line='I got '+score+'/'+n+' on \u201cHow well do you know Muse?\u201d John Legend x Pharrell. Listen to Muse: '+PL;
 box.innerHTML='<div class="qz-score"><p class="qz-top" style="justify-content:center">Your score</p><p class="qz-num">'+score+'<small>/'+n+'</small></p><p class="qz-rank">'+r+'</p><div class="qz-dots">'+res.map(function(o){return '<i class="'+(o?'ok':'')+'"></i>'}).join('')+'</div>'+
 '<div class="qz-share" id="qz-line">'+esc(line)+'</div><div class="qz-actions"><button class="qz-btn" type="button" id="qz-sh">Share your score</button><a class="qz-btn gold" href="'+PL+'" target="_blank" rel="noopener">Listen to Muse</a><button class="qz-btn ghost" type="button" id="qz-re">Try again</button></div>'+(window.QZ_MORE||'')+'</div>';
 document.getElementById('qz-re').addEventListener('click',function(){i=0;score=0;res=[];show();});
 document.getElementById('qz-sh').addEventListener('click',function(){var b=this;
  var txt='I got '+score+'/'+n+' on \u201cHow well do you know Muse?\u201d John Legend x Pharrell. Listen to Muse:';
  if(navigator.share){navigator.share({text:txt,url:PL}).catch(function(){});return;}
  var done=function(){b.textContent='Copied';setTimeout(function(){b.textContent='Share your score'},1800)};
  if(navigator.clipboard)navigator.clipboard.writeText(line).then(done,done);else done();});
 box.scrollIntoView({behavior:'smooth',block:'start'});}
var go=document.getElementById('qz-go');if(go)go.addEventListener('click',show);
})();
