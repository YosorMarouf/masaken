(() => {
  const root = document.documentElement;
  const intro = document.querySelector('#construction-intro');
  if (!intro || !root.classList.contains('maken-intro-pending')) return;
  const skip = intro.querySelector('.construction-intro__skip');
  const floors = [...intro.querySelectorAll('.construction-intro__floor')].reverse();
  const mark = intro.querySelector('.construction-intro__mark');
  const symbol = intro.querySelector('.construction-intro__symbol');
  const svgNS = 'http://www.w3.org/2000/svg';
  const defs = symbol.querySelector('defs');
  const mask = document.createElementNS(svgNS, 'mask');
  mask.id = 'intro-sweep-gold-mask';
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('x', '0'); mask.setAttribute('y', '0');
  mask.setAttribute('width', '591'); mask.setAttribute('height', '431');
  symbol.querySelectorAll('.construction-intro__floor path[fill="url(#intro-gold)"]').forEach(path => {
    const shape = path.cloneNode(false);
    shape.setAttribute('fill', '#fff');
    mask.append(shape);
  });
  const highlight = document.createElementNS(svgNS, 'linearGradient');
  highlight.id = 'intro-sweep-light';
  [['0','0'],['.5','.18'],['1','0']].forEach(([offset, opacity]) => {
    const stop = document.createElementNS(svgNS, 'stop');
    stop.setAttribute('offset', offset); stop.setAttribute('stop-color', '#fff7df');
    stop.setAttribute('stop-opacity', opacity); highlight.append(stop);
  });
  defs.append(mask, highlight);
  const sweep = document.createElementNS(svgNS, 'rect');
  sweep.setAttribute('x', '-180'); sweep.setAttribute('y', '0');
  sweep.setAttribute('width', '180'); sweep.setAttribute('height', '431');
  sweep.setAttribute('fill', 'url(#intro-sweep-light)');
  sweep.setAttribute('mask', 'url(#intro-sweep-gold-mask)');
  sweep.setAttribute('opacity', '0');
  symbol.append(sweep);
  let finished = false;
  let timeline;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    timeline?.kill();
    intro.remove();
    root.classList.remove('maken-intro-pending');
    document.body.classList.remove('maken-intro-active');
    document.dispatchEvent(new Event('maken:intro-complete'));
  };
  const watchdog = setTimeout(finish, 8000);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap) { finish(); return; }
  intro.hidden = false;
  document.body.classList.add('maken-intro-active');
  skip.addEventListener('click', finish);
  timeline = gsap.timeline({onComplete:finish});
  const [base, ...levels] = floors;
  timeline.fromTo(base, {opacity:0,y:8}, {opacity:1,y:0,duration:.35,ease:'power2.out'});
  levels.forEach(level => {
    timeline.fromTo(level, {opacity:1,y:-180}, {opacity:1,y:0,duration:.5,ease:'power2.inOut',immediateRender:false}, '+=.05');
  });
  timeline
    .fromTo(sweep, {attr:{x:-180}, opacity:1}, {attr:{x:591}, opacity:1, duration:1, ease:'sine.inOut'}, '+=.1')
    .to(symbol, {scale:.33,x:() => mark.offsetWidth*.33,duration:.9,ease:'power2.inOut'}, '+=.3')
    .fromTo('.construction-intro__horizontal', {autoAlpha:0}, {autoAlpha:1,duration:.6,ease:'power2.inOut'}, '-=.35')
    .to('.construction-intro__loading', {autoAlpha:0,duration:.4,ease:'power2.inOut'}, '<')
    .to(mark, {scale:.975, duration:.7, ease:'power2.inOut'}, '+=.35')
    .to(intro, {autoAlpha:0,duration:.7,ease:'power2.inOut'}, '<');

})();
