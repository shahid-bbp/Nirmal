(() => {
  'use strict';
  const library=document.querySelector('.journal-library');
  if(!library)return;
  const grid=document.getElementById('article-grid');
  const cards=[...grid.querySelectorAll('.article-card')];
  const records=cards.map((element,index)=>({element,index,id:element.dataset.id,category:element.dataset.category,date:element.dataset.date,title:element.querySelector('h3').textContent,search:normalize(`${element.querySelector('h3').textContent} ${element.querySelector('.article-copy>p').textContent} ${element.dataset.category}`)}));
  const search=document.getElementById('article-search');
  const searchForm=document.querySelector('.article-search');
  const clearSearch=document.querySelector('.clear-search');
  const sort=document.getElementById('article-sort');
  const categoryButtons=[...document.querySelectorAll('.category-listing>button')];
  const categories=new Set(categoryButtons.map(button=>button.dataset.category));
  const savedFilter=document.querySelector('.saved-filter');
  const status=document.getElementById('article-status');
  const empty=document.querySelector('.article-empty');
  const pagination=document.querySelector('.article-pagination');
  const announcement=document.querySelector('.bookmark-status');
  const pageSize=12;
  const validIds=new Set(records.map(record=>record.id));
  const storageKey='keerthi-saved-stories';
  let saved=new Set(),debounce=0,storageAvailable=true;
  let state={query:'',category:'all',sort:'newest',page:1,savedOnly:false};
  function normalize(value){return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
  function loadSaved(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'[]');saved=new Set(Array.isArray(value)?value.map(String).filter(id=>validIds.has(id)):[]);}catch{storageAvailable=false;saved=new Set();}}
  function readURL(){const params=new URL(location.href).searchParams;const category=params.get('category')||'all';const order=params.get('sort')||'newest';state={query:(params.get('q')||'').slice(0,120),category:categories.has(category)?category:'all',sort:['newest','oldest','title'].includes(order)?order:'newest',page:Math.max(1,Math.min(10000,Number.parseInt(params.get('page')||'1',10)||1)),savedOnly:params.get('saved')==='1'};}
  function writeURL(mode){if(!mode)return;const url=new URL(location.href);for(const key of ['q','category','sort','page','saved'])url.searchParams.delete(key);if(state.query)url.searchParams.set('q',state.query);if(state.category!=='all')url.searchParams.set('category',state.category);if(state.sort!=='newest')url.searchParams.set('sort',state.sort);if(state.page>1)url.searchParams.set('page',String(state.page));if(state.savedOnly)url.searchParams.set('saved','1');try{if(url.href!==location.href)history[mode==='push'?'pushState':'replaceState']({},'',url);}catch{/* File previews still work without URL state. */}}
  function updateSaved(){
    savedFilter.setAttribute('aria-pressed',String(state.savedOnly));
    document.querySelector('.saved-count').textContent=String(saved.size);
    records.forEach(record=>{const button=record.element.querySelector('.save-article');const isSaved=saved.has(record.id);button.setAttribute('aria-pressed',String(isSaved));button.setAttribute('aria-label',`${isSaved?'Remove saved story':'Save story'}: ${record.title}`);button.title=isSaved?'Remove from saved stories':'Save for later';});
  }
  function pageButton(text,page,{current=false,edge=false,disabled=false,label}={}){
    const button=document.createElement('button');button.type='button';button.textContent=text;button.disabled=disabled;
    if(edge)button.classList.add('page-edge');if(current)button.setAttribute('aria-current','page');if(label)button.setAttribute('aria-label',label);
    button.addEventListener('click',()=>{clearTimeout(debounce);state.query=search.value.trim();state.page=page;render('push');pagination.querySelector('[aria-current="page"]')?.focus({preventScroll:true});library.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
    return button;
  }
  function render(mode){
    const focusedCard=grid.contains(document.activeElement)?document.activeElement:null;
    const terms=normalize(state.query).split(' ').filter(Boolean);
    const filtered=records.filter(record=>(state.category==='all'||record.category===state.category)&&(!state.savedOnly||saved.has(record.id))&&terms.every(term=>record.search.includes(term)));
    filtered.sort((a,b)=>state.sort==='title'?a.title.localeCompare(b.title,'en'):state.sort==='oldest'?a.date.localeCompare(b.date)||a.index-b.index:b.date.localeCompare(a.date)||a.index-b.index);
    const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));state.page=Math.min(state.page,pageCount);
    const start=(state.page-1)*pageSize;const visible=filtered.slice(start,start+pageSize);
    const visibleIds=new Set(visible.map(record=>record.id));
    records.forEach(record=>{record.element.hidden=!visibleIds.has(record.id);});
    visible.forEach(record=>grid.append(record.element));
    search.value=state.query;sort.value=state.sort;clearSearch.hidden=!state.query;
    categoryButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===state.category)));
    empty.hidden=filtered.length>0;grid.hidden=filtered.length===0;
    empty.querySelector('p').textContent=state.savedOnly&&!saved.size?'Save a story using its bookmark button, then find it here.':'Try another search or explore a different category.';
    status.textContent=filtered.length?`Showing ${start+1}–${Math.min(start+pageSize,filtered.length)} of ${filtered.length} ${state.savedOnly?'saved ':''}${filtered.length===1?'story':'stories'}`:'No matching stories';
    pagination.replaceChildren();pagination.hidden=pageCount<2;
    if(pageCount>1){
      pagination.append(pageButton('← Previous',state.page-1,{edge:true,disabled:state.page===1,label:'Previous page'}));
      const pages=Array.from({length:pageCount},(_,i)=>i+1).filter(page=>page===1||page===pageCount||Math.abs(page-state.page)<=1);
      let last=0;for(const page of pages){if(last&&page-last>1){const gap=document.createElement('span');gap.textContent='…';gap.setAttribute('aria-hidden','true');pagination.append(gap);}pagination.append(pageButton(String(page),page,{current:page===state.page,label:`Page ${page}`}));last=page;}
      pagination.append(pageButton('Next →',state.page+1,{edge:true,disabled:state.page===pageCount,label:'Next page'}));
    }
    updateSaved();writeURL(mode);
    if(focusedCard){const target=focusedCard.closest('.article-card').hidden?visible[0]?.element.querySelector('.save-article')||savedFilter:focusedCard;target.focus({preventScroll:true});}
  }
  search.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>{state.query=search.value.trim();state.page=1;render('replace');},180);});
  searchForm.addEventListener('submit',event=>{event.preventDefault();clearTimeout(debounce);state.query=search.value.trim();state.page=1;render('push');});
  clearSearch.addEventListener('click',()=>{clearTimeout(debounce);state.query='';state.page=1;render('push');search.focus();});
  categoryButtons.forEach(button=>button.addEventListener('click',()=>{clearTimeout(debounce);state.query=search.value.trim();state.category=button.dataset.category;state.page=1;render('push');}));
  sort.addEventListener('change',()=>{clearTimeout(debounce);state.query=search.value.trim();state.sort=sort.value;state.page=1;render('push');});
  savedFilter.addEventListener('click',()=>{clearTimeout(debounce);state.query=search.value.trim();state.savedOnly=!state.savedOnly;state.page=1;render('push');});
  records.forEach(record=>record.element.querySelector('.save-article').addEventListener('click',()=>{
    clearTimeout(debounce);state.query=search.value.trim();
    const add=!saved.has(record.id);if(add)saved.add(record.id);else saved.delete(record.id);
    try{localStorage.setItem(storageKey,JSON.stringify([...saved]));}catch{storageAvailable=false;}
    announcement.textContent=`${add?'Saved':'Removed'}: ${record.title}${storageAvailable?'':'. Saved stories are available for this visit only.'}`;
    render('replace');
  }));
  document.querySelector('.reset-filters').addEventListener('click',()=>{clearTimeout(debounce);state={query:'',category:'all',sort:'newest',page:1,savedOnly:false};render('push');search.focus();});
  addEventListener('popstate',()=>{clearTimeout(debounce);readURL();render();});
  addEventListener('storage',event=>{if(event.key===storageKey){loadSaved();render();}});
  document.querySelectorAll('[data-blog-controls],.save-article').forEach(element=>element.hidden=false);
  library.classList.add('is-interactive');
  loadSaved();readURL();render('replace');
})();
