/**
 * IN STILLNESS, WE MOVE — no JavaScript framework, no external animation library.
 * Story images, captions, color, logo and vector drawing are all scroll-scrubbed.
 * Replace photos under /assets and copy in index.html as needed.
 */
(() => {
  'use strict';
  const story = document.getElementById('story');
  const sticky = document.getElementById('story-sticky');
  const scenes = Array.from(document.querySelectorAll('.story-scene'));
  const photos = scenes.map(scene => scene.querySelector('.photo-shell img'));
  const copies = scenes.map(scene => scene.querySelector('.scene-copy'));
  const dots = Array.from(document.querySelectorAll('.scene-dot'));
  const header = document.getElementById('site-header');
  const activeCounter = document.getElementById('counter-current');
  const progressRail = document.getElementById('side-progress-fill');
  const hint = document.getElementById('intro-scroll-hint');
  const logo = document.getElementById('stage-emblem');
  const logoFill = document.querySelector('.emblem-fill');
  const logoStroke = document.getElementById('emblem-stroke');
  const motionButton = document.getElementById('motion-button');
  const motionLabel = motionButton.querySelector('.motion-label');
  const menuButton = document.getElementById('menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  const cursorLight = document.querySelector('.cursor-light');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const palette = [
    [249, 241, 222], [255, 218, 175], [236, 187, 162],
    [242, 209, 183], [246, 231, 198], [235, 190, 178]
  ];
  let progress = 0;
  let scenePos = 0;
  let motionOff = prefersReducedMotion.matches;
  let pointerX = 0;
  let pointerY = 0;
  let pointerInside = false;
  let rafPending = false;
  let pathDefs = [];
  let selectedIndex = 0;
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const smooth = t => { const x = clamp(t); return x * x * (3 - 2 * x); };
  const mix = (a, b, t) => a + (b - a) * t;

  function initPaths() {
    const ids = ['flow-1', 'flow-2', 'flow-3'];
    pathDefs = ids.map(id => {
      const path = document.getElementById(id);
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      return { path, length };
    });
  }

  function currentRange() {
    return Math.max(1, story.offsetHeight - sticky.offsetHeight);
  }

  function blendAccent(pos) {
    const first = Math.min(palette.length - 1, Math.floor(pos));
    const next = Math.min(palette.length - 1, first + 1);
    const alpha = smooth(pos - first);
    const c = [0, 1, 2].map(k => Math.round(mix(palette[first][k], palette[next][k], alpha)));
    return `rgb(${c.join(',')})`;
  }

  function update() {
    rafPending = false;
    const top = story.getBoundingClientRect().top + window.scrollY;
    const distance = window.scrollY - top;
    progress = clamp(distance / currentRange());
    scenePos = progress * (scenes.length - 1);
    const closest = clamp(Math.round(scenePos), 0, scenes.length - 1);
    const live = distance > -window.innerHeight && distance < story.offsetHeight;
    header.classList.toggle('is-scrolled', window.scrollY > 30);
    sticky.style.setProperty('--chapter-accent', blendAccent(scenePos));
    header.style.setProperty('--header-ink', blendAccent(scenePos));
    progressRail.style.height = `${progress * 100}%`;

    scenes.forEach((scene, index) => {
      const dist = Math.abs(scenePos - index);
      const opacity = clamp(1 - dist);
      scene.style.opacity = opacity.toFixed(4);
      scene.style.visibility = opacity < .003 ? 'hidden' : 'visible';
      scene.setAttribute('aria-hidden', opacity < .4 ? 'true' : 'false');
      // On desktop a fine depth drift. When motion is off, still change images and text.
      if (!motionOff && live && opacity > .002) {
        const offset = scenePos - index;
        photos[index].style.transform = `scale(${1.045 + .032 * Math.abs(offset)}) translate3d(${offset * -1.2}%, ${offset * 1.2}%, 0)`;
      } else if (motionOff) {
        photos[index].style.transform = 'none';
      }
      const copyStrength = smooth(clamp((opacity - .10) / .66));
      copies[index].style.opacity = copyStrength.toFixed(4);
      copies[index].style.transform = motionOff ? 'none' : `translate3d(0, ${(1 - copyStrength) * 22}px, 0)`;
    });

    if (selectedIndex !== closest) {
      selectedIndex = closest;
      dots.forEach((dot, i) => {
        const isActive = i === closest;
        dot.classList.toggle('is-active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'step');
        else dot.removeAttribute('aria-current');
      });
      activeCounter.textContent = String(closest + 1).padStart(2, '0');
    }
    hint.style.opacity = String(clamp(1 - progress * 17));

    // The actual supplied logo is traced into vector paths; its outline draws first,
    // then the original silhouette fills in. Both are linked to scroll progress.
    const traceProgress = smooth(clamp((progress + .018) / .145));
    const revealProgress = smooth(clamp((progress - .072) / .13));
    logoStroke.style.strokeDashoffset = motionOff ? '0' : String(100 * (1 - traceProgress));
    logoFill.style.opacity = motionOff ? '1' : String(.06 + .94 * revealProgress);
    const ratio = smooth(clamp(progress * 3.6));
    const baseScale = mix(1.18, .78, ratio);
    const pointerRotate = !motionOff && pointerInside ? (pointerX - .5) * 7 : 0;
    const pointerYShift = !motionOff && pointerInside ? (pointerY - .5) * 7 : 0;
    logo.style.transform = `translate3d(0, ${pointerYShift}px,0) rotate(${pointerRotate}deg) scale(${motionOff ? 1 : baseScale})`;
    const logoOpacity = progress > .91 ? clamp((1 - progress) / .09) : 1;
    logo.style.opacity = String(logoOpacity);

    if (!motionOff && live) {
      const drawn = clamp(.2 + progress * 2.35);
      pathDefs.forEach((item, i) => {
        const reveal = clamp(drawn - i * .16);
        item.path.style.strokeDashoffset = String(item.length * (1 - reveal));
      });
      // Deliberately keep light trails in the left portion of the imagery.
      const moved1 = pathDefs[0].path.getPointAtLength(pathDefs[0].length * clamp((progress * 1.8 + .04) % 1));
      const moved2 = pathDefs[1].path.getPointAtLength(pathDefs[1].length * clamp((progress * 1.45 + .32) % 1));
      document.getElementById('flow-dot-1').setAttribute('cx', moved1.x);
      document.getElementById('flow-dot-1').setAttribute('cy', moved1.y);
      document.getElementById('flow-dot-2').setAttribute('cx', moved2.x);
      document.getElementById('flow-dot-2').setAttribute('cy', moved2.y);
    }
  }

  function requestUpdate() {
    if (!rafPending) { rafPending = true; window.requestAnimationFrame(update); }
  }

  dots.forEach(dot => dot.addEventListener('click', () => {
    const index = Number(dot.dataset.go);
    const y = story.getBoundingClientRect().top + window.scrollY + currentRange() * (index / (scenes.length - 1));
    window.scrollTo({top: y, behavior: motionOff ? 'auto' : 'smooth'});
  }));

  function setMotion(off) {
    motionOff = Boolean(off);
    document.body.classList.toggle('motion-off', motionOff);
    motionButton.setAttribute('aria-pressed', String(motionOff));
    motionLabel.textContent = motionOff ? 'MOTION OFF' : 'MOTION ON';
    requestUpdate();
  }
  motionButton.addEventListener('click', () => setMotion(!motionOff));
  prefersReducedMotion.addEventListener?.('change', e => setMotion(e.matches));

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'เปิดเมนู' : 'ปิดเมนู');
    mobileNav.hidden = isOpen;
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'เปิดเมนู');
  }));
  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointerX = clamp(event.clientX / window.innerWidth);
    pointerY = clamp(event.clientY / window.innerHeight);
    pointerInside = true;
    document.body.classList.add('has-mouse');
    cursorLight.style.left = `${event.clientX}px`;
    cursorLight.style.top = `${event.clientY}px`;
    requestUpdate();
  }, {passive:true});
  window.addEventListener('pointerleave', () => {
    pointerInside = false;
    document.body.classList.remove('has-mouse');
  });

  initPaths();
  setMotion(motionOff);
  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate, {passive:true});
  window.addEventListener('load', requestUpdate);
  requestUpdate();
})();
