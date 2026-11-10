(() => {
  const gsap = window.gsap;
  if (!gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const motion = gsap.matchMedia();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
  window.addEventListener('load', refresh, {once:true});
  document.fonts?.ready?.then(refresh);
  document.querySelectorAll('img').forEach(image => {
    if (!image.complete) image.addEventListener('load', refresh, {once:true});
  });

  if (reduced) return;

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const reveal = (selector, options = {}) => {
      gsap.utils.toArray(selector).forEach((element, index) => {
        gsap.fromTo(element,
          {autoAlpha:0, y:options.y ?? 24, clipPath:options.clip ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)'},
          {autoAlpha:1, y:0, clipPath:'inset(0 0 0% 0)', duration:options.duration ?? .85,
            delay:options.stagger ? index * options.stagger : 0,
            ease:options.ease ?? 'power3.out', clearProps:'clipPath',
            scrollTrigger:{trigger:element, start:options.start ?? 'top 84%', once:true}}
        );
      });
    };

    // Editorial headings enter on a clipped reveal; supporting facts follow with measured cadence.
    reveal('.reveal-heading h2, .location-heading h2, .explorer-heading h2, .future-heading h2, .developer-heading h2', {clip:true,y:10,duration:1});
    reveal('.reveal-facts > *, .explorer-topline, .developer-composition, .closing-layout', {y:28,stagger:.09});

    // Masterplan and aerial references retain their original proportions; motion stays inside the frame.
    gsap.utils.toArray('.land-reveal-frame, .geo-stage').forEach((frame, i) => {
      gsap.fromTo(frame, {clipPath:'inset(0 0 16% 0)', y:26}, {
        clipPath:'inset(0 0 0% 0)', y:0, duration:1.05, ease:'power3.out',
        scrollTrigger:{trigger:frame,start:'top 82%',once:true}
      });
      const image = frame.querySelector('img');
      if (image) gsap.fromTo(image,{scale:1.035},{scale:1,duration:1.4,ease:'power2.out',
        scrollTrigger:{trigger:frame,start:'top 82%',once:true}});
      if (i === 1) gsap.to(frame,{yPercent:-3,ease:'none',scrollTrigger:{trigger:frame,start:'top bottom',end:'bottom top',scrub:.7}});
    });

    // Explorer arrives as a composed tool rather than another generic section fade.
    reveal('.explorer-shell .plan-stage', {y:18,duration:1});
    reveal('.explorer-shell .parcel-panel', {y:36,duration:.95});
    reveal('.investment-total, .mix-meter, .investment-material', {y:22,stagger:.1});
    reveal('.faq-section details', {y:12,stagger:.055,duration:.65});
    reveal('.section-thread', {y:0,duration:.8});

    const total = document.querySelector('.investment-total strong');
    if (total) {
      const finalText = total.textContent.trim();
      const numeric = Number(finalText.replace(/[^\d.]/g,''));
      if (Number.isFinite(numeric) && numeric > 0) {
        const counter = {value:0};
        ScrollTrigger.create({trigger:total,start:'top 86%',once:true,onEnter:()=>gsap.to(counter,{
          value:numeric,duration:1.35,ease:'power2.out',
          onUpdate:()=>{total.textContent = new Intl.NumberFormat('en-US',{minimumFractionDigits:1,maximumFractionDigits:1}).format(counter.value);},
          onComplete:()=>{total.textContent=finalText;}
        })});
      }
    }

    document.querySelectorAll('.faq-section details').forEach(details => {
      const summary = details.querySelector('summary');
      const content = [...details.children].filter(child => child.tagName !== 'SUMMARY');
      if (!summary || !content.length) return;
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        gsap.fromTo(content,{height:0,autoAlpha:0,y:-4},{height:'auto',autoAlpha:1,y:0,duration:.38,ease:'power2.out',clearProps:'height'});
      });
    });

    document.querySelector('#parcel-card')?.addEventListener('parcel:rendered', event => {
      const card = event.currentTarget;
      gsap.fromTo(card,{autoAlpha:.65,y:8},{autoAlpha:1,y:0,duration:.32,ease:'power2.out',overwrite:true});
    });

    document.querySelector('.future-stage')?.addEventListener('future:change', event => {
      const stage = event.currentTarget;
      const copy = stage.querySelector('.future-copy');
      if (copy) gsap.fromTo(copy,{autoAlpha:.45,y:9},{autoAlpha:1,y:0,duration:.42,ease:'power2.out',overwrite:true});
    });

    refresh();
    return () => { ScrollTrigger.getAll().forEach(trigger => trigger.kill()); };
  });
})();
