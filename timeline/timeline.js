(function(){
var ms=[].slice.call(document.querySelectorAll('.m')),fill=document.getElementById('fill'),tl=document.getElementById('tl'),
yr=document.getElementById('yr'),note=document.getElementById('note'),bar=document.getElementById('egot'),
badges={};[].forEach.call(document.querySelectorAll('.b'),function(b){badges[b.dataset.k]=b});
var ticking=false;
function update(){ticking=false;
  var vh=window.innerHeight,line=vh*0.62,cur=null,won={};
  ms.forEach(function(m){var r=m.getBoundingClientRect();
    if(r.top<line){m.classList.add('seen');cur=m;if(m.dataset.egot)won[m.dataset.egot]=1}
    else if(r.top>vh) m.classList.remove('seen');});
  var n=0;for(var k in badges){var on=!!won[k];badges[k].classList.toggle('on',on);if(on)n++}
  note.textContent=n===4?'EGOT':n+' of 4';bar.classList.toggle('full',n===4);
  if(cur){var y=cur.dataset.y;yr.textContent=cur.classList.contains('final')?'2026':y;}
  var tr=tl.getBoundingClientRect(),h=Math.max(0,Math.min(tr.height,line-tr.top));fill.style.height=h+'px';
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req);update();
})();