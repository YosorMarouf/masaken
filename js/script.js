(() => {
  const parcels = window.PARCELS || [];
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const menuLinks = document.querySelectorAll('#nav-links a');
  const navLinks = document.querySelector('#nav-links');
  const activeCorners = document.createElement('span');
  activeCorners.className = 'nav-active-corners';
  activeCorners.setAttribute('aria-hidden', 'true');
  activeCorners.innerHTML = '<i></i><i></i><i></i><i></i>';
  navLinks.append(activeCorners);
  let activeNavLink = null;
  const placeActiveCorners = (link, animate = true) => {
    if (!link) return;
    const parent = navLinks.getBoundingClientRect();
    const target = link.getBoundingClientRect();
    const position = {x:target.left - parent.left - 8, y:target.top - parent.top - 6, width:target.width + 16, height:target.height + 12, autoAlpha:1};
    if (window.gsap && animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.gsap.to(activeCorners, {...position, duration:.32, ease:'power2.out', overwrite:true});
    } else if (window.gsap) {
      window.gsap.set(activeCorners, position);
    } else {
      Object.assign(activeCorners.style, {left:`${position.x}px`, top:`${position.y}px`, width:`${position.width}px`, height:`${position.height}px`, opacity:'1'});
    }
  };
  const setActiveNavLink = link => {
    if (!link || link === activeNavLink) return;
    const previous = activeNavLink;
    activeNavLink = link;
    menuLinks.forEach(item => {
      const active = item === link;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
    placeActiveCorners(link, Boolean(previous));
  };
  const search = document.querySelector('#parcel-search');
  const searchInputs = [...document.querySelectorAll('[data-parcel-search]')];
  const card = document.querySelector('#parcel-card');
  const noRecord = document.querySelector('#no-record');
  const tableBody = document.querySelector('#parcel-table');
  const filters = [...document.querySelectorAll('.filter')];
  const drawer = document.querySelector('#parcel-drawer');
  const sourceDialog = document.querySelector('#source-dialog');
  const resultsCount = document.querySelector('#results-count');
  const typeNames = {commercial:'تجاري', residential:'سكني / ظهير تجاري'};
  const format = (number, decimals = 0) => new Intl.NumberFormat('en-US', {minimumFractionDigits:decimals, maximumFractionDigits:decimals}).format(number);
  let activeType = 'all';
  let selected = parcels.find(item => item.parcel === 618) || parcels[0];

  const planViewer = document.querySelector('[data-plan-viewer]');
  const planImage = document.querySelector('[data-plan-image]');
  if (planViewer && planImage) {
    let planScale = 1, planX = 0, planY = 0, dragging = false, pointerX = 0, pointerY = 0;
    const paintPlan = () => {
      const maxX = Math.max(0, planImage.offsetWidth * planScale - planViewer.clientWidth);
      const maxY = Math.max(0, planImage.offsetHeight * planScale - planViewer.clientHeight);
      planX = Math.max(-maxX, Math.min(0, planX));
      planY = Math.max(-maxY, Math.min(0, planY));
      planImage.style.transform = `translate(${planX}px,${planY}px) scale(${planScale})`;
      planViewer.classList.toggle('is-zoomed', planScale > 1);
    };
    const zoomPlan = factor => { planScale = Math.max(1, Math.min(3, planScale * factor)); paintPlan(); };
    planViewer.querySelector('[data-plan-zoom-in]').addEventListener('click', () => zoomPlan(1.25));
    planViewer.querySelector('[data-plan-zoom-out]').addEventListener('click', () => zoomPlan(1 / 1.25));
    planViewer.querySelector('[data-plan-reset]').addEventListener('click', () => { planScale = 1; planX = planY = 0; paintPlan(); });
    planViewer.addEventListener('pointerdown', event => {
      if (planScale === 1 || event.target.closest('.plan-controls')) return;
      dragging = true; pointerX = event.clientX; pointerY = event.clientY; planViewer.setPointerCapture(event.pointerId);
    });
    planViewer.addEventListener('pointermove', event => {
      if (!dragging) return;
      planX += event.clientX - pointerX; planY += event.clientY - pointerY; pointerX = event.clientX; pointerY = event.clientY; paintPlan();
    });
    planViewer.addEventListener('pointerup', () => { dragging = false; });
    planViewer.addEventListener('pointercancel', () => { dragging = false; });
    planImage.addEventListener('load', paintPlan);
    window.addEventListener('resize', paintPlan, {passive:true});
  }

  function setType(type) {
    activeType = type;
    filters.forEach(item => {
      const active = item.dataset.type === type;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    render();
  }

  const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  updateNav();
  window.addEventListener('scroll', updateNav, {passive:true});
  const journeyChapters = [
    ['home','مقدمة المشروع'],['about','الأرض'],['investment','الفرص'],['location','الموقع'],['explorer','القطع'],
    ['opportunities','الفرص الاستثمارية'],['developer','المطور'],['faq','الأسئلة'],['contact','التواصل']
  ].map(([id,label]) => ({element:document.getElementById(id),label})).filter(chapter => chapter.element);
  const progressTrack = document.querySelector('#journey-progress-track');
  const progressFill = document.querySelector('#journey-progress-fill');
  const progressCurrent = document.querySelector('#journey-progress-current');
  const progressLabel = document.querySelector('#journey-progress-label');
  function updateJourneyProgress() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    progressFill.style.transform = `scaleY(${ratio})`;
    progressTrack.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    const marker = window.scrollY + window.innerHeight * .44;
    let current = journeyChapters[0];
    journeyChapters.forEach(chapter => {
      if (chapter.element.getBoundingClientRect().top + window.scrollY <= marker) current = chapter;
    });
    const currentIndex = journeyChapters.indexOf(current);
    progressCurrent.textContent = String(currentIndex + 1).padStart(2,'0');
    progressLabel.textContent = current.label;
    progressTrack.setAttribute('aria-valuetext', `${current.label} · ${currentIndex + 1} من ${journeyChapters.length}`);
  }
  window.addEventListener('scroll', updateJourneyProgress, {passive:true});
  window.addEventListener('resize', updateJourneyProgress, {passive:true});
  if ('IntersectionObserver' in window) {
    const navSections = [...document.querySelectorAll('#home,#about,#location,#explorer,#opportunities,#developer')];
    const visibleSections = new Set();
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visibleSections.add(entry.target) : visibleSections.delete(entry.target));
      const current = [...visibleSections].sort((a,b) =>
        Math.abs(a.getBoundingClientRect().top - nav.getBoundingClientRect().bottom) -
        Math.abs(b.getBoundingClientRect().top - nav.getBoundingClientRect().bottom)
      )[0];
      if (current) setActiveNavLink([...menuLinks].find(link => link.hash === `#${current.id}`));
    }, {rootMargin:'-38% 0px -52% 0px',threshold:0});
    navSections.forEach(section => navObserver.observe(section));
  }
  setActiveNavLink(menuLinks[0]);
  window.addEventListener('resize', () => placeActiveCorners(activeNavLink, false), {passive:true});
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    document.body.classList.toggle('menu-active', open);
  });
  menuLinks.forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-active');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('menu-open')) {
      nav.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'فتح القائمة');
      document.body.classList.remove('menu-active');
      toggle.focus();
    }
  });

  function visibleParcels() {
    const query = (drawer.open ? document.querySelector('#drawer-parcel-search').value : search.value).trim().replace(/^0+/, '');
    const minArea = Number(document.querySelector('#area-min').value) || 0;
    const maxArea = Number(document.querySelector('#area-max').value) || Infinity;
    const minPrice = Number(document.querySelector('#price-min').value) || 0;
    const maxPrice = Number(document.querySelector('#price-max').value) || Infinity;
    const sortBy = document.querySelector('#sort-by').value;
    return parcels.filter(item => {
      const qMatch = !query || String(item.parcel).includes(query) || String(item.row).padStart(2,'0').includes(query);
      return qMatch && (activeType === 'all' || item.type === activeType) && item.area >= minArea && item.area <= maxArea && item.unitPrice >= minPrice && item.unitPrice <= maxPrice;
    }).sort((a,b) => a[sortBy] - b[sortBy]);
  }

  function renderCard(item) {
    if (!item) { card.hidden = true; return; }
    card.hidden = false;
    const row = String(item.row).padStart(2,'0');
    card.innerHTML = `<div class="parcel-card-head"><span class="type-chip">${typeNames[item.type]}</span><span class="row-origin">رقم الصف ${row}</span></div><div class="parcel-number"><small>رقم القطعة</small><strong>${item.parcel}</strong></div><div class="parcel-facts"><div><small>المساحة</small><b>${format(item.area,2)} <i>م²</i></b></div><div><small>السعر المعتمد / م²</small><b>${format(item.unitPrice)} <i>ر.س</i></b></div></div><div class="parcel-value"><span>القيمة التقديرية المعتمدة</span><strong>${format(item.total,2)} <small>ر.س</small></strong></div><a class="under-link parcel-inquiry" href="#contact" data-parcel="${item.parcel}">استفسر عن القطعة <span aria-hidden="true">‹</span></a>`;
    card.dispatchEvent(new CustomEvent('parcel:rendered', {bubbles:true, detail:{parcel:item.parcel}}));
  }

  function renderTable(items) {
    tableBody.innerHTML = items.map(item => {
      const isSelected = selected?.parcel === item.parcel;
      return `<tr tabindex="0" data-parcel="${item.parcel}" class="${isSelected ? 'selected-row' : ''}" ${isSelected ? 'aria-current="true"' : ''}><td>${String(item.row).padStart(2,'0')}</td><td><b>${item.parcel}</b></td><td>${typeNames[item.type]}</td><td>${format(item.area,2)} م²</td><td>${format(item.unitPrice)} ر.س</td><td>${format(item.total,2)} ر.س</td><td><button class="select-row${isSelected ? ' is-current' : ''}" type="button" data-parcel="${item.parcel}" ${isSelected ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${isSelected ? 'المحددة حاليًا' : 'اختيار القطعة'}</button></td></tr>`;
    }).join('');
  }

  function render() {
    const previousParcel = selected?.parcel;
    const items = visibleParcels();
    if (!items.some(item => item.parcel === selected?.parcel)) selected = items[0] || null;
    renderCard(selected);
    renderTable(items);
    noRecord.hidden = items.length > 0;
    const countPhrase = items.length === 0 ? 'لا توجد قطع مطابقة' : items.length === 1 ? 'قطعة واحدة مطابقة' : items.length === 2 ? 'قطعتان مطابقتان' : items.length <= 10 ? `${items.length} قطع مطابقة` : `${items.length} قطعة مطابقة`;
    resultsCount.textContent = countPhrase;
    document.querySelector('#drawer-total').innerHTML = `${parcels.length} <span>قطعة</span>`;
    if (selected?.parcel && selected.parcel !== previousParcel) {
      card.classList.remove('is-changing');
      void card.offsetWidth;
      card.classList.add('is-changing');
      window.setTimeout(() => card.classList.remove('is-changing'), 500);
    }
  }

  filters.forEach(button => button.addEventListener('click', () => setType(button.dataset.type)));
  searchInputs.forEach(input => input.addEventListener('input', () => {
    searchInputs.forEach(other => { if (other !== input) other.value = input.value; });
    render();
  }));
  [document.querySelector('#area-min'), document.querySelector('#area-max'), document.querySelector('#price-min'), document.querySelector('#price-max')].forEach(input => input.addEventListener('input', render));
  document.querySelector('#sort-by').addEventListener('change', render);
  document.querySelector('[data-reset-filters]').addEventListener('click', () => {
    searchInputs.forEach(input => { input.value = ''; });
    ['#area-min','#area-max','#price-min','#price-max'].forEach(selector => document.querySelector(selector).value = '');
    document.querySelector('#sort-by').value = 'row';
    setType('all');
    document.querySelector('#drawer-parcel-search')?.focus();
  });
  tableBody.addEventListener('click', event => {
    const row = event.target.closest('tr[data-parcel]');
    const choice = event.target.closest('[data-parcel]');
    if (!row && !choice) return;
    const parcel = Number((choice || row).dataset.parcel);
    selected = parcels.find(item => item.parcel === parcel);
    document.querySelector('#contact-parcel').value = String(parcel);
    render();
    drawer.close();
    card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  });
  tableBody.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      const row = event.target.closest('tr[data-parcel]');
      if (row) { event.preventDefault(); row.click(); }
    }
  });
  document.querySelectorAll('[data-filter-link]').forEach(link => link.addEventListener('click', () => {
    setType(link.dataset.filterLink);
  }));
  document.querySelectorAll('[data-open-drawer]').forEach(button => button.addEventListener('click', () => {
    drawer.showModal();
    document.querySelector('#drawer-parcel-search').focus();
  }));
  document.querySelectorAll('[data-close-drawer]').forEach(button => button.addEventListener('click', () => drawer.close()));
  document.querySelectorAll('[data-open-source]').forEach(button => button.addEventListener('click', () => sourceDialog.showModal()));
  document.querySelectorAll('[data-close-source]').forEach(button => button.addEventListener('click', () => sourceDialog.close()));
  card.addEventListener('click', event => {
    const link = event.target.closest('.parcel-inquiry');
    if (link) document.querySelector('#contact-parcel').value = link.dataset.parcel;
  });

  const futureStage = document.querySelector('.future-stage');
  const futureCta = document.querySelector('.future-explore');
  const futureVideo = futureStage?.querySelector('.future-image-home');
  const futureCommercialVideo = futureStage?.querySelector('.future-image-commerce');
  const futureVideoControls = futureStage?.querySelector('.future-video-controls');
  let futureIsVisible = false;
  let futurePausedByUser = false;
  const syncFuturePlayback = () => {
    const commercialSelected = futureStage.dataset.state === 'commercial';
    const activeVideo = commercialSelected ? futureCommercialVideo : futureVideo;
    [futureVideo, futureCommercialVideo].forEach(video => {
      if (!video) return;
      if (video === activeVideo && futureIsVisible && !matchMedia('(prefers-reduced-motion: reduce)').matches &&
          (commercialSelected || !futurePausedByUser)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  if (futureVideo && futureVideoControls) {
    const playButton = futureVideoControls.querySelector('[data-future-play]');
    const soundButton = futureVideoControls.querySelector('[data-future-sound]');
    const syncControls = () => {
      const playing = !futureVideo.paused && !futureVideo.ended;
      const audible = !futureVideo.muted && futureVideo.volume > 0;
      playButton.toggleAttribute('data-active', playing);
      soundButton.toggleAttribute('data-active', audible);
      playButton.title = playing ? 'إيقاف الفيديو مؤقتًا' : 'تشغيل الفيديو';
      soundButton.title = audible ? 'كتم الصوت' : 'تشغيل الصوت';
      playButton.setAttribute('aria-label', playButton.title);
      soundButton.setAttribute('aria-label', soundButton.title);
    };
    playButton.addEventListener('click', () => {
      futurePausedByUser = !futureVideo.paused;
      if (futurePausedByUser) futureVideo.pause();
      else futureVideo.play().catch(syncControls);
    });
    soundButton.addEventListener('click', () => {
      const enableSound = futureVideo.muted || futureVideo.volume === 0;
      if (enableSound && futureVideo.volume === 0) futureVideo.volume = 1;
      futureVideo.muted = !enableSound;
      syncControls();
    });
    for (const event of ['play', 'pause', 'ended', 'volumechange']) {
      futureVideo.addEventListener(event, syncControls);
    }
    syncControls();
    futureVideoControls.hidden = false;
  }

  if (futureVideo && 'IntersectionObserver' in window) {
    const futureObserver = new IntersectionObserver(([entry]) => {
      futureIsVisible = entry.isIntersecting;
      syncFuturePlayback();
    }, {threshold:.2});
    futureObserver.observe(futureStage);
  }
  document.querySelectorAll('[data-future-toggle]').forEach(button => button.addEventListener('click', () => {
    const future = button.dataset.futureToggle;
    const previousFuture = futureStage.dataset.state;
    if (future === 'commercial' && futureCommercialVideo) {
      futureCommercialVideo.preload = 'auto';
      futureCommercialVideo.load();
    }
    futureStage.classList.remove('is-switching');
    void futureStage.offsetWidth;
    futureStage.classList.add('is-switching');
    window.setTimeout(() => futureStage.classList.remove('is-switching'), 560);
    futureStage.dataset.state = future;
    if (futureVideoControls) futureVideoControls.hidden = future !== 'residential';
    if (future !== 'residential' && futureVideo) futureVideo.currentTime = 0;
    if (future !== 'commercial' && previousFuture === 'commercial' && futureCommercialVideo) futureCommercialVideo.currentTime = 0;
    syncFuturePlayback();
    document.querySelectorAll('[data-future-toggle]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    document.querySelector('.future-image-home').classList.toggle('active', future === 'residential');
    document.querySelector('.future-image-commerce').classList.toggle('active', future === 'commercial');
    document.querySelector('.future-count-home').hidden = future !== 'residential';
    document.querySelector('.future-count-commerce').hidden = future !== 'commercial';
    document.querySelector('.future-description-home').hidden = future !== 'residential';
    document.querySelector('.future-description-commerce').hidden = future !== 'commercial';
    futureCta.dataset.filterLink = future;
    futureCta.innerHTML = `${future === 'residential' ? 'استكشف القطع السكنية' : 'استكشف القطع التجارية'} <span>‹</span>`;
    futureStage.dispatchEvent(new CustomEvent('future:change', {detail:{state:future}}));
  }));

  const hero = document.querySelector('.hero');
  const heroVideo = document.querySelector('.hero-video');
  const heroAudioToggle = document.querySelector('#hero-audio-toggle');
  const heroAudioLabel = heroAudioToggle?.querySelector('span:last-child');
  const heroPlayToggle = document.querySelector('#hero-play-toggle');
  const heroPlayIcon = heroPlayToggle.querySelector('span:first-child');
  const heroPlayLabel = heroPlayToggle.querySelector('span:last-child');
  const syncHeroPlayButton = () => {
    const playing = !heroVideo.paused && !heroVideo.ended;
    heroPlayIcon.textContent = playing ? 'Ⅱ' : '▶';
    if (heroVideo.ended) heroPlayLabel.textContent = 'إعادة تشغيل الفيديو';
    else heroPlayLabel.textContent = playing ? 'إيقاف مؤقت' : 'تشغيل الفيديو';
  };

  heroVideo.addEventListener('playing', () => hero.classList.add('media-ready'), {once:true});
  for (const event of ['play', 'pause', 'ended']) {
    heroVideo.addEventListener(event, syncHeroPlayButton);
  }
  heroPlayToggle.addEventListener('click', () => {
    if (heroVideo.paused || heroVideo.ended) heroVideo.play().catch(syncHeroPlayButton);
    else heroVideo.pause();
  });

  heroAudioToggle?.addEventListener('click', () => {
    heroVideo.muted = !heroVideo.muted;
    const soundOn = !heroVideo.muted;
    heroAudioToggle.setAttribute('aria-pressed', String(soundOn));
    heroAudioToggle.setAttribute('aria-label', soundOn ? 'إيقاف الصوت' : 'تشغيل الصوت');
    if (heroAudioLabel) heroAudioLabel.textContent = soundOn ? 'إيقاف الصوت' : 'تشغيل الصوت';
  });
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    const counters = [...hero.querySelectorAll('.hero-quickfacts [data-counter]')];
    const numberFormats = new Map();
    const startCounters = () => window.setTimeout(() => counters.forEach((counter, index) => {
      const target = Number(counter.dataset.counter);
      const decimals = Number(counter.dataset.decimals || 0);
      const formatter = numberFormats.get(decimals) || new Intl.NumberFormat('en-US', {minimumFractionDigits:decimals, maximumFractionDigits:decimals});
      numberFormats.set(decimals, formatter);
      const start = performance.now() + index * 90;
      const duration = 1350;
      counter.textContent = formatter.format(0);
      counter.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}], {duration:620,delay:index * 90,easing:'cubic-bezier(.2,.7,.25,1)',fill:'both'});
      const tick = now => {
        const progress = Math.max(0, Math.min(1, (now - start) / duration));
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = formatter.format(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), 120);
    if (document.documentElement.classList.contains('maken-intro-pending')) document.addEventListener('maken:intro-complete', startCounters, {once:true});
    else startCounters();
  }
  const startHeroVideo = () => heroVideo.play().catch(syncHeroPlayButton);
  if (!reduceMotion) {
    if (document.documentElement.classList.contains('maken-intro-pending')) document.addEventListener('maken:intro-complete', startHeroVideo, {once:true});
    else startHeroVideo();
  }

  const form = document.querySelector('#contact-form');
  const feedback = document.querySelector('#form-feedback');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');
    const phoneValid = /^(9665|05|5)\d{8}$/.test(phoneDigits);
    const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !message || !phoneValid || !emailValid) {
      feedback.textContent = !name || !message ? 'يرجى إدخال الاسم والرسالة.' : !phoneValid ? 'يرجى إدخال رقم جوال سعودي صحيح.' : 'يرجى التحقق من البريد الإلكتروني.';
      feedback.classList.add('error');
      return;
    }
    feedback.textContent = 'تم التحقق من البيانات. لن يتم إرسالها حتى ربط النموذج بخدمة تواصل.';
    feedback.classList.remove('error');
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
  render();
  updateJourneyProgress();
})();
