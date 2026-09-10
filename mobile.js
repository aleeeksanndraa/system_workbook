const arrow=`<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 14L14 4M7 4h7v7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="square"/></svg>`;
function enhance(){
  const shell=document.querySelector('.shell');
  if(!shell)return;
  if(!shell.querySelector('.mobileBar')){
    const bar=document.createElement('div');bar.className='mobileBar';bar.innerHTML=`<div class="mobileLogo">SYSTEM<sup>©</sup></div><button class="burger" aria-label="Open menu"><span></span><span></span><span></span></button>`;
    const backdrop=document.createElement('div');backdrop.className='menuBackdrop';
    shell.prepend(backdrop);shell.prepend(bar);
    const close=()=>document.body.classList.remove('menuOpen');
    bar.querySelector('.burger').onclick=()=>document.body.classList.toggle('menuOpen');backdrop.onclick=close;
    shell.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',close));
  }
  shell.querySelectorAll('.nav button').forEach(b=>{const spans=b.querySelectorAll('span');if(spans[1]&&!spans[1].querySelector('svg')){spans[1].innerHTML=arrow;spans[1].classList.add('navArrow')}});
  const prev=document.getElementById('prev'),next=document.getElementById('next');
  if(prev){prev.setAttribute('aria-label','Previous section');prev.innerHTML=`<span class="desktopNavLabel">← PREV</span><span class="mobileNavArrow">←</span>`}
  if(next){next.setAttribute('aria-label','Next section');next.innerHTML=`<span class="desktopNavLabel">NEXT →</span><span class="mobileNavArrow">→</span>`}
}
new MutationObserver(enhance).observe(document.getElementById('app'),{childList:true,subtree:true});enhance();
