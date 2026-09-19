(() => {
  const embedded = new URLSearchParams(location.search).has('card');
  if (embedded) {
    document.documentElement.classList.add('in-recipe-card');
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a || e.ctrlKey || e.metaKey) return;
      const url = new URL(a.href);
      if (/\/recipes\/r\d+\.html$/.test(url.pathname)) {
        e.preventDefault(); parent.postMessage({type:'dina-recipe',url:url.href},location.origin);
      }
    });
    return;
  }
  const script = document.currentScript;
  const base = new URL('.',script.src);
  const recipes = typeof COOKBOOK !== 'undefined' ? COOKBOOK.recipes : [];
  const panel = document.createElement('dialog');
  panel.className='recipe-panel'; panel.setAttribute('aria-label','כרטיסיית מתכון');
  panel.innerHTML='<div class="panel-bar"><button class="panel-close">סגירה וחזרה לרשימה ×</button><span class="panel-name"></span><div class="panel-paging"><button class="panel-prev" aria-label="המתכון הקודם">→ הקודם</button><button class="panel-next" aria-label="המתכון הבא">הבא ←</button></div></div><div class="panel-layout"><aside class="panel-list"><label>רשימת המתכונים<input type="search" placeholder="חיפוש ברשימה…"></label><nav aria-label="בחירת מתכון"></nav></aside><iframe title="תוכן המתכון"></iframe></div>';
  document.body.append(panel);
  const frame=panel.querySelector('iframe'), nav=panel.querySelector('nav'), filter=panel.querySelector('input');
  let current=-1, opener, historyOpen=false;
  const normalize=s=>s.replace(/[׳״'"\u0591-\u05c7]/g,'').toLowerCase();
  function renderList(){
    nav.replaceChildren(); let category='';
    recipes.forEach((r,i)=>{
      if(!normalize(r.title+' '+r.category).includes(normalize(filter.value)))return;
      if(category!==r.category){category=r.category;const h=document.createElement('h3');h.textContent=category;nav.append(h)}
      const b=document.createElement('button'); b.textContent=r.title;b.setAttribute('aria-current',i===current?'true':'false');b.onclick=()=>show(i);nav.append(b);
    });
  }
  function show(i){
    current=(i+recipes.length)%recipes.length;const r=recipes[current];
    frame.contentWindow.location.replace(new URL('recipes/'+r.id+'.html?card=1',base).href);
    panel.querySelector('.panel-name').textContent=r.title;
    renderList();
  }
  function open(url){
    const id=new URL(url).pathname.match(/\/(r\d+)\.html$/)?.[1],i=recipes.findIndex(r=>r.id===id);
    if(i<0)return false;
    if(!panel.open){opener=document.activeElement;filter.value='';panel.showModal();document.body.classList.add('recipe-panel-open');history.pushState({dinaCard:true},'');historyOpen=true}
    show(i);return true;
  }
  function close(){panel.close();if(historyOpen){historyOpen=false;history.back()}}
  panel.querySelector('.panel-close').onclick=close;
  panel.querySelector('.panel-prev').onclick=()=>show(current-1);
  panel.querySelector('.panel-next').onclick=()=>show(current+1);
  filter.oninput=renderList;
  panel.addEventListener('cancel',e=>{e.preventDefault();close()});
  panel.addEventListener('click',e=>{if(e.target===panel)close()});
  panel.addEventListener('close',()=>{document.body.classList.remove('recipe-panel-open');opener?.focus({preventScroll:true})});
  addEventListener('popstate',()=>{historyOpen=false;if(panel.open)panel.close()});
  addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='dina-recipe')open(e.data.url)});
  document.addEventListener('click',e=>{
    const a=e.target.closest('a');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;
    const u=new URL(a.href);if(u.origin===location.origin&&/\/recipes\/r\d+\.html$/.test(u.pathname)&&open(u.href))e.preventDefault();
  });
})();
