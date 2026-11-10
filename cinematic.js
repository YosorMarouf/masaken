(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const sections = document.querySelectorAll('#about, #location, #explorer');
  if (!gsap || !ScrollTrigger || !sections.length) return;
  gsap.registerPlugin(ScrollTrigger);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
  window.addEventListener('load', refresh, {once:true});
  if (document.fonts?.ready) document.fonts.ready.then(refresh);
  sections.forEach(section => section.querySelectorAll('img').forEach(image => {
    if (!image.complete) image.addEventListener('load', refresh, {once:true});
  }));
  if (reducedMotion) return;

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    // 02 — Let the project identity settle in without turning every section into a fade-up.
    gsap.fromTo('#about .about-copy', {y:24,autoAlpha:.78}, {
      y:0,autoAlpha:1,duration:.9,ease:'power3.out',
      scrollTrigger:{trigger:'#about .about-composition',start:'top 82%',once:true}
    });
    gsap.fromTo('#about .about-count strong', {scale:.96,transformOrigin:'right center'}, {
      scale:1,duration:1.05,ease:'power2.out',
      scrollTrigger:{trigger:'#about .about-count',start:'top 84%',once:true}
    });
    const bridgeLine = document.querySelector('#about .about-location-line');
    if (bridgeLine) gsap.fromTo(bridgeLine,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{
      trigger:'#location',start:'top bottom',end:'top 70%',scrub:.6
    }});

    // 03 — Aerial image remains full-proportion; only a restrained scroll-linked settle is applied.
    const aerial = document.querySelector('#location .geo-photo-frame img');
    if (aerial) gsap.fromTo(aerial, {scale:1.012,filter:'brightness(.94)'}, {
      scale:1,filter:'brightness(1)',ease:'none',
      scrollTrigger:{trigger:aerial,start:'top 92%',end:'top 32%',scrub:.65}
    });

    // 04 — The single engineering plan opens as the reference shifts into the parcel-data workspace.
    const plan = document.querySelector('#explorer .plan-stage');
    if (plan) gsap.fromTo(plan, {clipPath:'inset(0 0 7% 0)',y:14}, {
      clipPath:'inset(0 0 0% 0)',y:0,ease:'none',
      scrollTrigger:{trigger:plan,start:'top 90%',end:'top 36%',scrub:.7}
    });
    const panel = document.querySelector('#explorer .parcel-panel');
    if (panel) gsap.fromTo(panel,{x:-14,autoAlpha:.9},{x:0,autoAlpha:1,duration:.7,ease:'power2.out',
      scrollTrigger:{trigger:panel,start:'top 86%',once:true}});

    document.querySelector('#parcel-card')?.addEventListener('parcel:rendered', event => {
      gsap.fromTo(event.currentTarget,{autoAlpha:.72,y:7},{autoAlpha:1,y:0,duration:.28,ease:'power2.out',overwrite:true});
    });

    refresh();
    return () => ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  });
})();
