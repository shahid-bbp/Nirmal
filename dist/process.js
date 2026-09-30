(() => {
  'use strict';
  const engine = document.querySelector('.process-engine');
  if (!engine) return;
  const tabs = [...engine.querySelectorAll('.process-tabs a')];
  const panels = [...engine.querySelectorAll('.stage-panel')];
  const tablist = engine.querySelector('.process-tabs');
  const counter = engine.querySelector('.stage-counter');
  const previous = engine.querySelector('.stage-prev');
  const next = engine.querySelector('.stage-next');
  const playButton = document.querySelector('.journey-play');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer = 0, playing = false;
  const motionOff = () => reducedMotion.matches || document.body.classList.contains('editorial-motion-paused');
  tablist.setAttribute('role','tablist');
  tablist.setAttribute('aria-label','Rice processing stages');
  const compactTabs=matchMedia('(max-width: 650px)');
  const syncOrientation=()=>tablist.setAttribute('aria-orientation',compactTabs.matches?'horizontal':'vertical');
  compactTabs.addEventListener('change',syncOrientation);syncOrientation();
  tabs.forEach((tab,index) => {
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',panels[index].id);
    panels[index].setAttribute('role','tabpanel');
    panels[index].tabIndex = 0;
    tab.addEventListener('click', event => { event.preventDefault(); stop(); select(index); });
    tab.addEventListener('keydown', event => {
      let target = index;
      if (['ArrowRight','ArrowDown'].includes(event.key)) target = (index + 1) % tabs.length;
      else if (['ArrowLeft','ArrowUp'].includes(event.key)) target = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else return;
      event.preventDefault();stop();select(target);tabs[target].focus();
    });
  });
  function select(index) {
    current = Math.max(0,Math.min(tabs.length-1,index));
    tabs.forEach((tab,i) => { tab.setAttribute('aria-selected',String(i===current)); tab.tabIndex=i===current?0:-1; panels[i].hidden=i!==current; });
    engine.style.setProperty('--step',String(current));
    counter.textContent = `${String(current+1).padStart(2,'0')} / 06`;
    previous.disabled = current===0;
    next.innerHTML = current===tabs.length-1 ? 'Back to the field <span aria-hidden="true">↺</span>' : 'Next step <span aria-hidden="true">→</span>';
  }
  function stop() {
    clearTimeout(timer);timer=0;playing=false;
    playButton.setAttribute('aria-pressed','false');
    playButton.innerHTML='<span aria-hidden="true">▷</span> Play the journey';
  }
  function schedule() {
    clearTimeout(timer);
    if (!playing || motionOff() || document.hidden) return;
    timer = setTimeout(() => {
      if(current===tabs.length-1){stop();return;}
      select(current+1);schedule();
    },3600);
  }
  playButton.addEventListener('click', () => {
    if(playing){stop();return;}
    if(motionOff())return;
    if(current===tabs.length-1)select(0);
    playing=true;playButton.setAttribute('aria-pressed','true');playButton.innerHTML='<span aria-hidden="true">Ⅱ</span> Pause the journey';schedule();
  });
  previous.addEventListener('click',()=>{stop();select(current-1);});
  next.addEventListener('click',()=>{stop();select((current+1)%tabs.length);});
  engine.querySelector('.stage-controls').hidden=false;
  engine.classList.add('is-interactive');
  playButton.hidden=false;
  function syncMotion(){if(motionOff())stop();playButton.disabled=motionOff();}
  addEventListener('page:motion-change',syncMotion);
  reducedMotion.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else schedule();});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting && playing) stop();
  },{threshold:0}).observe(engine);
  const initial=panels.findIndex(panel=>`#${panel.id}`===location.hash);
  select(initial<0?0:initial);syncMotion();
  addEventListener('hashchange',()=>{const target=panels.findIndex(panel=>`#${panel.id}`===location.hash);if(target>=0){stop();select(target);}});

  const dialog=document.querySelector('.flow-dialog');
  const diagramLink=document.querySelector('.flow-diagram-link');
  diagramLink.addEventListener('click',event=>{
    if(typeof dialog.showModal!=='function')return;
    event.preventDefault();stop();dialog.showModal();
    document.body.classList.add('flow-is-open');
  });
  dialog.querySelector('.flow-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('flow-is-open');diagramLink.focus({preventScroll:true});});
})();
