(function(){
var st={song:'',topic:''};
var chips=[].slice.call(document.querySelectorAll('.chip'));
var qs=[].slice.call(document.querySelectorAll('.q'));
var secs=[].slice.call(document.querySelectorAll('.sec'));
var count=document.getElementById('count'),empty=document.getElementById('empty');
var total=qs.length;
function apply(push){
  var n=0;
  qs.forEach(function(q){
    var ok=(!st.song||q.dataset.song.split(' ').indexOf(st.song)>-1)&&(!st.topic||q.dataset.topic===st.topic);
    q.classList.toggle('is-hidden',!ok); if(ok)n++;
  });
  secs.forEach(function(s){
    var vis=s.querySelector('.q:not(.is-hidden)');
    var match=!st.song||s.dataset.sec===st.song;
    s.classList.toggle('is-hidden',!vis||!match);
  });
  chips.forEach(function(c){c.setAttribute('aria-pressed',String(c.dataset.v===st[c.dataset.f]))});
  empty.classList.toggle('is-hidden',n>0);
  if(!st.song&&!st.topic){count.textContent=total+' quotes from 8 sources';}
  else{count.innerHTML='';count.appendChild(document.createTextNode(n+(n===1?' quote':' quotes')));
    var b=document.createElement('button');b.type='button';b.textContent='Show all';b.onclick=function(){st.song='';st.topic='';apply(true)};count.appendChild(b);}
  if(push){var h=[];if(st.song)h.push('song='+st.song);if(st.topic)h.push('topic='+st.topic);
    history.replaceState(null,'',h.length?'#'+h.join('&'):location.pathname);}
}
chips.forEach(function(c){c.addEventListener('click',function(){
  var f=c.dataset.f; st[f]=(st[f]===c.dataset.v&&c.dataset.v)?'':c.dataset.v; apply(true);
  var top=document.getElementById('main').getBoundingClientRect().top+window.scrollY-document.querySelector('.filters').offsetHeight;
  if(window.scrollY>top) window.scrollTo({top:top,behavior:'smooth'});
  c.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
})});
var m=location.hash.slice(1);
if(m){m.split('&').forEach(function(p){var kv=p.split('=');if(kv[0]==='song'||kv[0]==='topic')st[kv[0]]=decodeURIComponent(kv[1]||'')});
  if(!st.song&&!st.topic&&document.getElementById(m))st.song=m;}
apply(false);
})();