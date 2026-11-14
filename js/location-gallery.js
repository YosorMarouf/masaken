(() => {
  const lens = document.querySelector('[data-land-lens]');
  if (!lens) return;
  lens.__landLensCleanup?.();
  const controller = new AbortController();
  const {signal} = controller;
  const section = lens.closest('.land-gallery');
  const stage = lens.querySelector('.land-lens__stage');
  const open = lens.querySelector('[data-gallery-open]');
  const main = lens.querySelector('#gallery-main-image');
  const caption = lens.querySelector('#gallery-caption');
  const counter = lens.querySelector('#gallery-counter');
  const segments = [...lens.querySelectorAll('.land-lens__segments i')];
  const status = lens.querySelector('#gallery-status');
  const viewer = document.querySelector('#land-photo-viewer');
  const viewerImage = viewer?.querySelector('#viewer-image');
  const viewerCount = viewer?.querySelector('#viewer-count');
  const gsap = window.gsap;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [
    {src:'assets/land-photo-01.jpg', caption:'امتداد الأرض أمام المشهد الجبلي', alt:'أرض المشروع مع الممشى والطريق والمشهد الجبلي في الخلفية'},
    {src:'assets/land-photo-02.jpg', caption:'المشهد الجبلي المحيط بالأرض', alt:'مشهد بانورامي للأرض أمام الجبال والطريق'},
    {src:'assets/land-photo-03.jpg', caption:'اتصال الأرض بالطريق ومحيطها العمراني', alt:'أرض مفتوحة بجوار الطريق والمباني المحيطة'},
    {src:'assets/land-photo-04.jpg', caption:'المحيط العمراني المجاور للأرض', alt:'الأرض والمباني العمرانية المجاورة'}
  ];
  const pad = n => String(n).padStart(2,'0');
  let current = 0, busy = false, entered = false, pointerStart = null, suppressClick = false, observer, navObserver, refreshTimer, autoplayTimer, visibilityObserver, inView = false;
  const update = index => {
    current = index;
    const scene = scenes[index];
    main.src = scene.src;
    main.alt = scene.alt;
    caption.textContent = scene.caption;
    counter.textContent = pad(index + 1);
    segments.forEach((segment,i) => segment.classList.toggle('is-active',i === index));
    if (viewerImage) { viewerImage.src = scene.src; viewerImage.alt = scene.alt; }
    if (viewerCount) viewerCount.textContent = `${pad(index + 1)} / ${pad(scenes.length)}`;
  };
  const preload = src => new Promise(resolve => {
    const image = new Image();
    image.onload = async () => { try { await image.decode(); } catch {} resolve(image.naturalWidth > 0); };
    image.onerror = () => resolve(false);
    image.src = src;
  });
  const navigate = async direction => {
    if (busy) return;
    busy = true;
    lens.setAttribute('aria-busy','true');
    const target = (current + direction + scenes.length) % scenes.length;
    if (!await preload(scenes[target].src)) {
      status.textContent = 'تعذر تحميل الصورة. بقيت الصورة الحالية كما هي.';
      busy = false; lens.setAttribute('aria-busy','false'); return;
    }
    status.textContent = '';
    if (motion.matches || !gsap) {
      update(target);
    } else {
      const outgoing = document.createElement('div');
      outgoing.className = 'land-lens__outgoing';
      outgoing.setAttribute('aria-hidden','true');
      const image = main.cloneNode();
      image.removeAttribute('id'); image.alt = '';
      outgoing.append(image);
      const boundary = document.createElement('span');
      boundary.className = 'land-lens__boundary';
      boundary.setAttribute('aria-hidden','true');
      stage.insertBefore(outgoing, open);
      stage.insertBefore(boundary, open);
      update(target);
      const next = direction > 0;
      gsap.set(boundary,{left:next ? '100%' : '0%'});
      gsap.set(main,{scale:1.015});
      await new Promise(resolve => gsap.timeline({onComplete:resolve,onInterrupt:resolve})
        .to(outgoing,{clipPath:next ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',duration:1,ease:'power2.inOut'},0)
        .to(boundary,{left:next ? '0%' : '100%',duration:1,ease:'power2.inOut'},0)
        .to(main,{scale:1,duration:1,ease:'power2.out'},0));
      outgoing.remove(); boundary.remove(); gsap.set(main,{clearProps:'transform'});
    }
    busy = false; lens.setAttribute('aria-busy','false');
  };
  const startAutoplay = () => {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      if (inView && !document.hidden && !motion.matches && !viewer?.open &&
          !lens.matches(':hover') && !lens.contains(document.activeElement)) navigate(1);
    }, 3000);
  };
  const navigateManually = direction => { startAutoplay(); navigate(direction); };
  const enter = () => {
    if (entered) return;
    entered = true;
    if (gsap && !motion.matches) {
      const heading = section.querySelector('.gallery-heading');
      gsap.timeline()
        .from(heading.querySelectorAll('.section-kicker, h2'),{y:8,opacity:0,duration:.35,ease:'power2.out'},0)
        .from(heading.querySelector('p'),{y:8,opacity:0,duration:.3,ease:'power2.out'},.18)
        .from(lens,{y:10,opacity:0,duration:.4,ease:'power2.out'},.34);
    }
    observer?.disconnect();
  };
  [lens,viewer].filter(Boolean).forEach(container => {
    container.querySelectorAll('[data-gallery-next]').forEach(button => button.addEventListener('click',() => navigateManually(1),{signal}));
    container.querySelectorAll('[data-gallery-prev]').forEach(button => button.addEventListener('click',() => navigateManually(-1),{signal}));
    container.addEventListener('keydown',event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); navigateManually(event.key === 'ArrowLeft' ? -1 : 1);
      }
    },{signal});
  });
  open.addEventListener('click',() => { if (!suppressClick && !busy && !viewer?.open) { try { viewer?.showModal(); } catch {} } },{signal});
  viewer?.querySelector('[data-gallery-close]')?.addEventListener('click',() => viewer.close(),{signal});
  viewer?.addEventListener('click',event => { if (event.target === viewer) viewer.close(); },{signal});
  stage.addEventListener('pointerdown',event => { if (event.pointerType === 'touch' && event.target === open) pointerStart = {x:event.clientX,y:event.clientY}; },{signal});
  stage.addEventListener('pointerup',event => {
    if (!pointerStart || event.pointerType !== 'touch') return;
    const dx = event.clientX-pointerStart.x, dy = event.clientY-pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)) {
      suppressClick = true; setTimeout(() => { suppressClick = false; },450);
      navigateManually(dx < 0 ? 1 : -1);
    }
  },{signal});
  stage.addEventListener('pointercancel',() => { pointerStart = null; },{signal});
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) enter(); },{threshold:.16});
    observer.observe(lens);
  } else enter();
  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }, {threshold:.16});
    visibilityObserver.observe(lens);
  } else inView = true;
  startAutoplay();
  scenes.slice(1).forEach(scene => { const image = new Image(); image.src = scene.src; });
  const nav = document.querySelector('.nav');
  if (nav && 'ResizeObserver' in window) {
    let lastHeight = 0;
    navObserver = new ResizeObserver(() => {
      const height = nav.getBoundingClientRect().height;
      if (Math.abs(height-lastHeight)<.5) return;
      lastHeight = height;
      section.style.setProperty('--gallery-nav-height',`${height}px`);
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => window.ScrollTrigger?.refresh(),250);
    });
    navObserver.observe(nav);
  }
  const cleanup = () => { controller.abort(); observer?.disconnect(); navObserver?.disconnect(); clearTimeout(refreshTimer); clearInterval(autoplayTimer); visibilityObserver?.disconnect(); };
  lens.__landLensCleanup = cleanup;
  window.addEventListener('pagehide',cleanup,{once:true,signal});
})();


