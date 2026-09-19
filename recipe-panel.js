(() => {
  const embedded = new URLSearchParams(location.search).has('card');
  if (embedded) {
    document.documentElement.classList.add('in-recipe-card');
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a || e.ctrlKey || e.metaKey) return;
      const url = new URL(a.href);
      // Section links scroll inside this card; they are not recipe changes.
      if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
        }
        return;
      }
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
  const categories=[...new Set(recipes.map(r=>r.category))];
  const chapterSelect=document.createElement('select');chapterSelect.setAttribute('aria-label','בחירת פרק');
  for(const name of ['כל הפרקים',...categories]){const option=document.createElement('option');option.value=name==='כל הפרקים'?'':name;option.textContent=name;chapterSelect.append(option)}
  panel.querySelector('.panel-list').prepend(chapterSelect);
  let current=-1, opener, historyOpen=false;
  const normalize=s=>s.replace(/[׳״'"\u0591-\u05c7]/g,'').toLowerCase();
  function renderList(){
    nav.replaceChildren(); let category='';
    recipes.forEach((r,i)=>{
      if(chapterSelect.value&&r.category!==chapterSelect.value)return;
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
    const path=new URL(url).pathname;
    const chapter=path.match(/\/chapters\/c(\d+)\.html$/);
    const category=chapter?categories[Number(chapter[1])-1]:null;
    const id=path.match(/\/(r\d+)\.html$/)?.[1],i=recipes.findIndex(r=>chapter?r.category===category:r.id===id);
    if(i<0)return false;
    if(!panel.open){opener=document.activeElement;filter.value='';panel.showModal();document.body.classList.add('recipe-panel-open');history.pushState({dinaCard:true},'');historyOpen=true}
    chapterSelect.value=category||'';
    show(i);return true;
  }
  function close(){panel.close();if(historyOpen){historyOpen=false;history.back()}}
  panel.querySelector('.panel-close').onclick=close;
  function step(delta){const list=recipes.map((r,i)=>i).filter(i=>!chapterSelect.value||recipes[i].category===chapterSelect.value);show(list[(list.indexOf(current)+delta+list.length)%list.length])}
  panel.querySelector('.panel-prev').onclick=()=>step(-1);
  panel.querySelector('.panel-next').onclick=()=>step(1);
  chapterSelect.onchange=()=>{filter.value='';const i=recipes.findIndex(r=>!chapterSelect.value||r.category===chapterSelect.value);show(i)};
  filter.oninput=renderList;
  panel.addEventListener('cancel',e=>{e.preventDefault();close()});
  panel.addEventListener('click',e=>{if(e.target===panel)close()});
  panel.addEventListener('close',()=>{document.body.classList.remove('recipe-panel-open');opener?.focus({preventScroll:true})});
  addEventListener('popstate',()=>{historyOpen=false;if(panel.open)panel.close()});
  addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='dina-recipe')open(e.data.url)});
  document.addEventListener('click',e=>{
    const a=e.target.closest('a');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;
    const u=new URL(a.href);if(u.origin===location.origin&&/\/(?:recipes\/r|chapters\/c)\d+\.html$/.test(u.pathname)&&open(u.href))e.preventDefault();
  });
})();
