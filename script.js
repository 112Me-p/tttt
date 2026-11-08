/* THE NAME / Center Gallery — plain JavaScript, scroll-driven, no dependencies. */
(() => {
  'use strict';
  const gallery = document.getElementById('gallery');
  const pin = document.getElementById('gallery-pin');
  const card = document.getElementById('gallery-card');
  const photos = [...document.querySelectorAll('.photo-scene')];
  const dots = [...document.querySelectorAll('.chapter-dot')];
  const captionNumber = document.getElementById('caption-index');
  const labelNumber = document.getElementById('inner-number');
  const captionTitle = document.getElementById('caption-title');
  const progressFill = document.getElementById('progress-fill');
  const cue = document.getElementById('scroll-cue');
  const logo = document.getElementById('logo-lockup');
  const fill = document.querySelector('.logo-fill');
  const stroke = document.querySelector('.logo-trace');
  const switchButton = document.getElementById('motion-switch');
  const switchText = document.getElementById('motion-text');
  const paths = [document.getElementById('thread-1'),document.getElementById('thread-2'),document.getElementById('thread-3')];
  const travelDots = [document.getElementById('traveler-1'),document.getElementById('traveler-2')];
  const titles = ['A QUIET BEGINNING','FOLLOW THE LIGHT','THE DETAILS','INTENTIONAL MOVEMENT','A SHARED MOMENT','RETURN TO SELF'];
  // Interpolated colors keep the symbol and the wordmark legible against each scene.
  const colors = [
    [255,246,231], // dark indoor scene: warm ivory
    [255,243,221], // blue sky: soft cream
    [57,47,47],    // skin: warm charcoal
    [49,43,42],    // skin/body detail: warm graphite
    [49,50,41],    // pale beach sand: deep olive-grey
    [55,44,46]     // close-up skin: soft charcoal
  ];
  const clamp = (x,a=0,b=1) => Math.max(a,Math.min(b,x));
  const smooth = t => { t=clamp(t);return t*t*(3-2*t); };
  const lerp = (a,b,t) => a+(b-a)*t;
  const pathLengths = paths.map(p => {let len=p.getTotalLength();p.style.strokeDasharray=String(len);return len;});
  const traceLen = stroke.getTotalLength();
  stroke.style.strokeDasharray=String(traceLen);
  let progress=0, pointerX=0, pointerY=0, activeIndex=-1, pending=false;
  let supplementalOff=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  let pointerInside=false;

  function measures(){
    const top = gallery.getBoundingClientRect().top + window.scrollY;
    const start = top;
    return { start, length: Math.max(1,gallery.offsetHeight-pin.offsetHeight) };
  }
  function currentPosition(){const {start,length}=measures();return clamp((scrollY-start)/length);}
  function colorAt(index){
    const low=Math.floor(index),high=Math.min(colors.length-1,low+1),t=smooth(index-low);
    const rgb=colors[low].map((c,k)=>Math.round(lerp(c,colors[high][k],t)));
    return `rgb(${rgb.join(',')})`;
  }
  function render(){
    pending=false;
    progress=currentPosition();
    const pos=progress*(photos.length-1);
    const low=Math.min(photos.length-1,Math.floor(pos));
    const t=pos-low;
    const between=4*t*(1-t); // energy concentrated at image changes
    const closest=Math.round(pos);
    const isLive=gallery.getBoundingClientRect().bottom > 0 && gallery.getBoundingClientRect().top < innerHeight;
    card.style.setProperty('--logo-color',colorAt(pos));
    card.style.setProperty('--grid-strength',(supplementalOff?.08:.10+.37*between).toFixed(3));
    card.style.setProperty('--glow-strength',(supplementalOff?.10:.16+.37*between).toFixed(3));
    card.style.setProperty('--line-strength',(supplementalOff?.05:.24+.42*between).toFixed(3));
    card.style.setProperty('--particle-strength', supplementalOff?'0':String(.28+.60*between));
    card.style.setProperty('--orbit-strength', supplementalOff?'0':String(.10+.25*between));
    card.style.setProperty('--grid-x',`${Math.sin(pos*2)*7}px`);
    card.style.setProperty('--grid-y',`${pos*3.4}px`);
    card.style.setProperty('--logo-scale', supplementalOff?'1':String(1+.018*Math.sin(pos*Math.PI*2)));
    card.style.setProperty('--type-y', supplementalOff?'0px':`${(1-between)*2}px`);
    card.style.setProperty('--type-opacity',String(.87+.13*between));
    cue.style.setProperty('--cue-opacity',String(clamp(1-progress*19)));
    progressFill.style.width=`${(progress*100).toFixed(2)}%`;
    photos.forEach((scene,i) => {
      let alpha=clamp(1-Math.abs(pos-i));
      scene.style.opacity=alpha.toFixed(4);
      scene.style.visibility=alpha<.003?'hidden':'visible';
      scene.setAttribute('aria-hidden',alpha < .5?'true':'false');
      if(!supplementalOff && isLive && alpha>.002){
        let off=pos-i;
        scene.querySelector('img').style.transform=`scale(${(1.025+.028*Math.abs(off)).toFixed(3)}) translate3d(${(-off*1.35).toFixed(2)}%,${(off*.75).toFixed(2)}%,0)`;
      } else if(supplementalOff){scene.querySelector('img').style.transform='none';}
    });
    if(activeIndex!==closest){
      activeIndex=closest;
      const num=String(closest+1).padStart(2,'0');
      captionNumber.textContent=num;labelNumber.textContent=num;
      captionTitle.textContent=titles[closest];
      dots.forEach((dot,i) => {const on=i===closest;dot.classList.toggle('is-current',on);if(on){dot.setAttribute('aria-current','step')}else{dot.removeAttribute('aria-current')}});
    }
    // Draw the outlines gently at the moment each scene starts blending in.
    const draw=smooth(clamp((pos-.02)/.55));
    stroke.style.strokeDashoffset=String(traceLen*(1-(supplementalOff?1:draw)));
    fill.style.opacity=String(supplementalOff?1:.91+.09*smooth(draw));
    if(!supplementalOff && isLive){
      paths.forEach((path,i) => {
        let fraction=clamp(.25+between*.6+(pos%1)*.32-i*.11);
        path.style.strokeDashoffset=String(pathLengths[i]*(1-fraction));
      });
      const a=paths[0].getPointAtLength(pathLengths[0]*clamp((pos*.47+.17)%1));
      const b=paths[1].getPointAtLength(pathLengths[1]*clamp((pos*.31+.51)%1));
      travelDots[0].setAttribute('transform',`translate(${a.x},${a.y})`);
      travelDots[1].setAttribute('transform',`translate(${b.x},${b.y})`);
    } else if(supplementalOff){paths.forEach((p,i)=>p.style.strokeDashoffset=String(pathLengths[i]*.82));}
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(render)}}
  dots.forEach(dot=>dot.addEventListener('click',()=>{
    const i=Number(dot.dataset.target), {start,length}=measures();
    window.scrollTo({top:start+length*i/(photos.length-1),behavior:supplementalOff?'auto':'smooth'});
  }));
  switchButton.addEventListener('click',()=>{
    supplementalOff=!supplementalOff;
    document.body.classList.toggle('motion-off',supplementalOff);
    switchButton.setAttribute('aria-pressed',String(!supplementalOff));
    switchText.textContent=supplementalOff?'MOTION OFF':'MOTION ON';
    schedule();
  });
  card.addEventListener('pointermove',e=>{
    if(supplementalOff||e.pointerType==='touch')return;
    const rect=card.getBoundingClientRect();
    pointerX=clamp((e.clientX-rect.left)/rect.width);
    pointerY=clamp((e.clientY-rect.top)/rect.height);
    pointerInside=true;
    logo.style.setProperty('--pointer-x',`${((pointerX-.5)*12).toFixed(2)}px`);
    logo.style.setProperty('--pointer-y',`${((pointerY-.5)*12).toFixed(2)}px`);
  },{passive:true});
  card.addEventListener('pointerleave',()=>{
    pointerInside=false;
    logo.style.setProperty('--pointer-x','0px');logo.style.setProperty('--pointer-y','0px');
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('load',schedule);
  document.body.classList.toggle('motion-off',supplementalOff);
  switchButton.setAttribute('aria-pressed',String(!supplementalOff));
  switchText.textContent=supplementalOff?'MOTION OFF':'MOTION ON';
  schedule();
})();
