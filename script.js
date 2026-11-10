(() => {
  const parcels = window.PARCELS || [];
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const menuLinks = document.querySelectorAll('#nav-links a');
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
    ['home','مقدمة المشروع'],['about','الأرض'],['location','الموقع'],['explorer','القطع'],
    ['opportunities','الفرص'],['investment','القيمة'],['developer','المطور'],['faq','الأسئلة'],['contact','التواصل']
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
    const navSections = [...document.querySelectorAll('#about,#location,#explorer,#opportunities,#developer')];
    const navObserver = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting).sort((a,b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
      if (!current) return;
      menuLinks.forEach(link => {
        const active = link.hash === `#${current.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-38% 0px -52% 0px',threshold:0});
    navSections.forEach(section => navObserver.observe(section));
  }
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
    const query = search.value.trim().replace(/^0+/, '');
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
    card.innerHTML = `<div class="parcel-card-head"><span class="type-chip">${typeNames[item.type]}</span><span class="row-origin">رقم الصف ${row}</span></div><div class="parcel-number"><small>رقم القطعة الرسمي</small><strong>${item.parcel}</strong></div><div class="parcel-facts"><div><small>المساحة</small><b>${format(item.area,2)} <i>م²</i></b></div><div><small>السعر المعتمد / م²</small><b>${format(item.unitPrice)} <i>ر.س</i></b></div></div><div class="parcel-value"><span>القيمة التقديرية المعتمدة</span><strong>${format(item.total,2)} <small>ر.س</small></strong></div><a class="under-link parcel-inquiry" href="#contact" data-parcel="${item.parcel}">استفسر عن القطعة <span>‹</span></a>`;
    card.dispatchEvent(new CustomEvent('parcel:rendered', {bubbles:true, detail:{parcel:item.parcel}}));
  }

  function renderTable(items) {
    tableBody.innerHTML = items.map(item => `<tr tabindex="0" data-parcel="${item.parcel}" class="${selected?.parcel === item.parcel ? 'selected-row' : ''}"><td>${String(item.row).padStart(2,'0')}</td><td><b>${item.parcel}</b></td><td>${typeNames[item.type]}</td><td>${format(item.area,2)} م²</td><td>${format(item.unitPrice)} ر.س</td><td>${format(item.total,2)} ر.س</td><td><button class="select-row" type="button" data-parcel="${item.parcel}">اختيار</button></td></tr>`).join('');
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
    search.focus();
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
  document.querySelectorAll('[data-future-toggle]').forEach(button => button.addEventListener('click', () => {
    const future = button.dataset.futureToggle;
    futureStage.classList.remove('is-switching');
    void futureStage.offsetWidth;
    futureStage.classList.add('is-switching');
    window.setTimeout(() => futureStage.classList.remove('is-switching'), 560);
    futureStage.dataset.state = future;
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
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    heroVideo.addEventListener('canplay', () => hero.classList.add('media-ready'), {once:true});
    heroVideo.addEventListener('error', () => hero.classList.add('media-failed'), {once:true});
    heroVideo.play().catch(() => hero.classList.add('media-failed'));
  } else {
    heroVideo.removeAttribute('autoplay');
    heroVideo.removeAttribute('src');
    heroVideo.querySelector('source')?.removeAttribute('src');
    heroVideo.load();
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
