const dialog=document.getElementById('photo-viewer'),fullPhoto=document.getElementById('full-photo'),caption=document.getElementById('photo-caption');
let activePhoto=0,returnFocus=null,activeGroup='הכול';
const visibleIndices=()=>ALBUM.map((a,i)=>activeGroup==='הכול'||a.group===activeGroup?i:-1).filter(i=>i>=0);
function showPhoto(i){activePhoto=i;const a=ALBUM[i];fullPhoto.src=a.src;fullPhoto.alt=a.caption;fullPhoto.style.maxWidth='min(100%, '+Math.min(a.width,1600)+'px)';caption.textContent=a.caption;document.getElementById('photo-number').textContent=(visibleIndices().indexOf(i)+1)+' / '+visibleIndices().length;}
function movePhoto(delta){const ids=visibleIndices();showPhoto(ids[(ids.indexOf(activePhoto)+delta+ids.length)%ids.length]);}
document.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>{returnFocus=b;showPhoto(Number(b.dataset.photo));dialog.showModal();document.body.classList.add('viewer-open');}));
document.querySelector('.close-viewer').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>{document.body.classList.remove('viewer-open');returnFocus?.focus()});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();movePhoto(1)}if(e.key==='ArrowRight'){e.preventDefault();movePhoto(-1)}});
document.getElementById('previous-photo').addEventListener('click',()=>movePhoto(-1));document.getElementById('next-photo').addEventListener('click',()=>movePhoto(1));
document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{activeGroup=b.dataset.group;document.querySelectorAll('[data-group]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('[data-photo]').forEach(x=>x.hidden=activeGroup!=='הכול'&&x.dataset.category!==activeGroup)}));
document.querySelectorAll('#categories button').forEach(b=>b.addEventListener('click',()=>{document.getElementById('chapter-title').textContent=b.textContent==='הכל'?'המתכונים של הבית':b.textContent}));
