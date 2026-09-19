const recipes=COOKBOOK.recipes;let category='הכל';
const cards=document.getElementById('cards'),search=document.getElementById('search');
const normal=s=>s.normalize('NFKD').replace(/[\u0591-\u05C7'"׳״]/g,'').toLowerCase();
function recipeCard(r){
 const a=document.createElement('a');a.className='card';a.href='recipes/'+r.id+'.html';
 const c=document.createElement('small');c.textContent=r.category;
 const h=document.createElement('h3');h.textContent=r.title;
 const p=document.createElement('p');p.textContent=r.servings||'מהמתכונים של דינה';
 if(r.image){const img=document.createElement('img');img.src=r.image;img.alt=r.title;img.loading='lazy';a.append(img)}
 a.append(c,h,p);return a;
}
function render(){
 const q=normal(search.value.trim());
 const found=recipes.filter(r=>(category==='הכל'||r.category===category)&&normal(r.title+' '+r.blocks.map(b=>b.text).join(' ')).includes(q));
 cards.replaceChildren();
 if(q){for(const r of found)cards.append(recipeCard(r))}
 else for(const [i,ch] of CHAPTERS.entries()){
  const list=found.filter(r=>r.category===ch.title);if(!list.length)continue;
  const section=document.createElement('section');section.className='recipe-chapter';section.id='chapter-'+(i+1);
  const opening=document.createElement('div');opening.className='chapter-opening';
  const picture=document.createElement('img');picture.src='assets/album/'+ch.photo+'.jpg';picture.alt=ch.caption;picture.style.objectPosition=ch.position||'50% 50%';picture.loading='lazy';
  const copy=document.createElement('div');const number=document.createElement('span');number.className='chapter-number';number.textContent=String(i+1).padStart(2,'0');
  const title=document.createElement('h3');title.textContent=ch.title;
  const caption=document.createElement('p');caption.textContent=ch.caption;
  copy.append(number,title);opening.append(copy,picture);
  const grid=document.createElement('div');grid.className='chapter-recipes';list.forEach(r=>grid.append(recipeCard(r)));
  section.append(opening,grid);cards.append(section);
 }
 document.getElementById('count').textContent=(found.length===1?'מתכון אחד':found.length+' מתכונים')+(!found.length?' · נסו שם או מרכיב אחר':'');
}
for(const name of ['הכל',...COOKBOOK.categories]){
 const b=document.createElement('button');b.textContent=name;b.setAttribute('aria-pressed',String(name===category));
 b.onclick=()=>{category=name;document.querySelectorAll('.categories button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()};
 document.getElementById('categories').append(b)
}
search.addEventListener('input',render);render();
