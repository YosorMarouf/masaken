(() => {
  // No section pinning is used. Refresh the remaining ScrollTrigger consumers after layout settles.
  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) {
    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
    window.addEventListener('load', refresh, {once:true});
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    document.querySelectorAll('#about img, #investment img, #location img, #explorer img').forEach(image => {
      if (!image.complete) image.addEventListener('load', refresh, {once:true});
    });
  }

  const aboutSection = document.querySelector('#about');
  const opportunitySection = document.querySelector('#investment');
  const locationSection = document.querySelector('#location');
  const landGallerySection = document.querySelector('#land-gallery');
  const explorerSection = document.querySelector('#explorer');
  const gsap = window.gsap;
  const canAnimate = gsap && ScrollTrigger && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  const landmarkStrip = locationSection?.querySelector('.nearby-landmarks');
  if (landmarkStrip && canAnimate) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.timeline({scrollTrigger:{trigger:landmarkStrip,start:'top 95%',once:true}})
      .from(landmarkStrip.querySelector('.landmark-line'), {scaleX:0,duration:.35,ease:'power2.out'})
      .from(landmarkStrip.querySelectorAll('.landmark-tick'), {scaleY:0,duration:.18,stagger:.07,ease:'power2.out'}, .25)
      .from(landmarkStrip.querySelectorAll('.landmark-time'), {y:10,opacity:0,duration:.3,stagger:.07,ease:'power2.out'}, .38)
      .from(landmarkStrip.querySelectorAll('.landmark-name'), {opacity:0,duration:.25,stagger:.07,ease:'power2.out'}, .58);
  }

  if (opportunitySection && !canAnimate) {
    opportunitySection.classList.add('opportunity-static');
    opportunitySection.querySelectorAll('.draw-line').forEach(path => { path.style.strokeDashoffset = '0'; });
  }

  // The original dune contour leads from About into Opportunity without pinning either section.
  if (opportunitySection && aboutSection && canAnimate) {
    gsap.registerPlugin(ScrollTrigger);
    const story = opportunitySection.parentElement;
    const transitionSection = story.querySelector('.land-transition-intro');
    const transitionArt = transitionSection?.querySelector('.land-transition-art');
    const transitionSheet = transitionSection?.querySelector('.land-transition-sheet');
    const transitionContour = transitionSection?.querySelector('.land-transition-contour');
    const transitionCopy = transitionSection?.querySelectorAll('.land-transition-copy > *');
    const guide = story.querySelector('.about-story-guide');
    const guidePath = guide?.querySelector('.about-guide-path');
    let guideTail = guide?.querySelector('.about-guide-tail');
    const aboutLink = aboutSection.querySelector('.about-next');
    const aboutVideo = aboutSection.querySelector('.about-transformation-video');
    const aboutCopy = aboutSection.querySelector('.about-copy');
    const lines = opportunitySection.querySelectorAll('.parcel-illustration .draw-line');
    const ledger = opportunitySection.querySelector('.opportunity-ledger');
    const supportCopy = opportunitySection.querySelectorAll('.opportunity-heading .eyebrow');
    const titleFirst = opportunitySection.querySelector('.opportunity-title-first');
    const titleSecond = opportunitySection.querySelector('.opportunity-title-second');
    const benefits = opportunitySection.querySelectorAll('.investment-benefits article');
    const guideState = {progress:0};
    let guideLength = 0;
    let guideHeadLength = 0;
    const updateGuide = () => {
      if (!guide || !guidePath || !transitionSection || !aboutLink) return;
      const width = story.clientWidth;
      const aboutHeight = aboutSection.offsetHeight;
      const guideHeight = aboutHeight + transitionSection.offsetHeight;
      story.style.setProperty('--about-section-height', aboutHeight + 'px');
      story.style.setProperty('--about-guide-height', guideHeight + 'px');
      guide.setAttribute('viewBox', `0 0 ${width} ${guideHeight}`);
      const guideBounds = guide.getBoundingClientRect();
      const linkBounds = aboutLink.getBoundingClientRect();
      const copyBounds = transitionSection.querySelector('.land-transition-copy').getBoundingClientRect();
      const startX = linkBounds.left + 1 - guideBounds.left;
      const startY = linkBounds.bottom - 1 - guideBounds.top;
      const middleX = width / 2;
      const direction = startX >= middleX ? 1 : -1;
      const radius = Math.min(32, Math.abs(startX - middleX) * .35);
      const elbowX = middleX + direction * radius;
      const endY = Math.max(startY + radius * 2, copyBounds.top - guideBounds.top - 10);
      const sweep = direction > 0 ? 0 : 1;
      const bendY = startY + radius;

      if (!guideTail) {
        guideTail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        guideTail.classList.add('about-guide-tail');
        guide.append(guideTail);
      }
      guidePath.setAttribute('d', `M${startX} ${startY} H${elbowX} A${radius} ${radius} 0 0 ${sweep} ${middleX} ${bendY}`);
      guideTail.setAttribute('d', `M${middleX} ${bendY} V${endY}`);
      guideHeadLength = guidePath.getTotalLength();
      const tailLength = guideTail.getTotalLength();
      guideLength = guideHeadLength + tailLength;
      guidePath.style.strokeDasharray = `${guideHeadLength}px`;
      guideTail.style.strokeDasharray = `${tailLength}px`;
      renderGuide(guideState.progress);
    };
    const renderGuide = progress => {
      if (!guidePath || !guideTail || !guideLength) return;
      const drawn = guideLength * gsap.utils.clamp(0,1,progress / .3);
      guidePath.style.strokeDashoffset = `${guideHeadLength - Math.min(guideHeadLength,drawn)}px`;
      guideTail.style.strokeDashoffset = `${guideLength - drawn}px`;
    };
    const renderDune = progress => {
      if (!transitionArt || !transitionSheet || !transitionContour || !transitionSection) return;
      const width = transitionSection.clientWidth;
      const drop = 46 * progress;
      const leftY = 238 + drop;
      const firstRise = 190 + drop;
      const dunePeak = 176 + drop;
      const middleFall = 197 + drop;
      const rightFall = 210 + drop;
      const rightY = 196 + drop;
      transitionArt.setAttribute('viewBox', `0 0 ${width} 260`);
      const curve = `M0 ${leftY} C${width*.14} ${leftY+1} ${width*.22} ${firstRise+12} ${width*.34} ${firstRise} C${width*.47} ${dunePeak} ${width*.54} ${dunePeak+21} ${width*.67} ${middleFall} C${width*.79} ${rightFall+12} ${width*.9} ${rightY+11} ${width} ${rightY}`;
      transitionContour.setAttribute('d', curve);
      transitionSheet.setAttribute('d', `${curve} L${width} 0 H0 Z`);
    };
    if (transitionSection && transitionArt && transitionSheet && transitionContour && transitionCopy?.length) {
      const duneState = {progress:0};
      renderDune(0);
      updateGuide();
      const transitionContext = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: transitionSection,
            start: 'top 93%',
            end: 'bottom 24%',
            scrub: .45,
            invalidateOnRefresh: true,
            onRefreshInit: () => { updateGuide(); renderDune(duneState.progress); },
            onRefresh: () => { updateGuide(); renderGuide(guideState.progress); renderDune(duneState.progress); }
          }
        })
          .to(guideState, {progress:1,duration:.3,ease:'none',onUpdate:() => renderGuide(guideState.progress)}, 0)
          .fromTo(transitionCopy[0], {clipPath:'inset(100% 0% 0% 0%)',y:8}, {clipPath:'inset(0% 0% 0% 0%)',y:0,duration:.12,ease:'none'}, .4)
          .fromTo(transitionCopy[1], {clipPath:'inset(100% 0% 0% 0%)',y:7}, {clipPath:'inset(0% 0% 0% 0%)',y:0,duration:.12,ease:'none'}, .55)
          .to(duneState, {progress:1,duration:.62,ease:'none',onUpdate:() => renderDune(duneState.progress)}, .24)
          .to(aboutVideo, {y:52,opacity:0,duration:.62,ease:'none'}, .24)
          .to(aboutCopy, {y:12,autoAlpha:0,duration:.62,ease:'none'}, .24)
          .from(supportCopy, {y:10,opacity:0,duration:.08,stagger:.02,ease:'none'}, .62)
          .fromTo(titleFirst, {clipPath:'inset(0 0 100% 0)',y:12,opacity:0}, {clipPath:'inset(0 0 0% 0)',y:0,opacity:1,duration:.16,ease:'none'}, .68)
          .fromTo(titleSecond, {clipPath:'inset(0 0 0 100%)',y:8,opacity:0}, {clipPath:'inset(0 0 0 0%)',y:0,opacity:1,duration:.2,ease:'none'}, .79)
          .fromTo(lines, {strokeDasharray:1,strokeDashoffset:1}, {strokeDashoffset:0,duration:.22,stagger:.014,ease:'none'}, .84)
          .from(ledger, {autoAlpha:0,y:14,duration:.12,ease:'none'}, 1.14)
          .from(benefits, {y:6,duration:.05,stagger:.01,ease:'none'}, 1.29)
      }, story);
      window.addEventListener('pagehide', () => transitionContext.revert(), {once:true});
    }
  }

  // Fade the opportunity content as the green location section rises into view.
  if (opportunitySection && locationSection && canAnimate) {
    gsap.registerPlugin(ScrollTrigger);
    const opportunityContent = opportunitySection.querySelector('.opportunity-inner');
    if (opportunityContent) {
      const exitContext = gsap.context(() => {
        gsap.to(opportunityContent, {
          opacity: 0,
          y: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: locationSection,
            start: 'top bottom',
            end: 'top 32%',
            scrub: .45,
            invalidateOnRefresh: true
          }
        });
      }, opportunitySection);
      window.addEventListener('pagehide', () => exitContext.revert(), {once: true});
    }
  }

  // Let the location chapter recede as the land gallery enters, and restore it on return.
  if (locationSection && landGallerySection && gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    window.__masakenLocationExitCleanup?.();
    const outro = locationSection.parentElement?.querySelector('.land-transition-outro');
    const targets = [locationSection, outro].filter(Boolean);
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(targets, {opacity:1, y:0}, {
        opacity:0, y:-10, ease:'none',
        scrollTrigger:{id:'location-gallery-exit',trigger:landGallerySection,
          start:'top 80%',end:'top 28%',scrub:true,invalidateOnRefresh:true}
      });
    });
    const cleanup = () => {
      motion.revert();
      window.removeEventListener('pagehide', cleanup);
      if (window.__masakenLocationExitCleanup === cleanup) delete window.__masakenLocationExitCleanup;
    };
    window.__masakenLocationExitCleanup = cleanup;
    window.addEventListener('pagehide', cleanup, {once:true});
  }

  // Fade the land photo slider away as the parcel explorer rises into view.
  if (landGallerySection && explorerSection && canAnimate) {
    gsap.registerPlugin(ScrollTrigger);
    const galleryContext = gsap.context(() => {
      gsap.to(landGallerySection, {
        autoAlpha: 0,
        y: -14,
        ease: 'none',
        scrollTrigger: {
          trigger: explorerSection,
          start: 'top bottom',
          end: 'top 38%',
          scrub: .5,
          invalidateOnRefresh: true
        }
      });
    }, landGallerySection);
    window.addEventListener('pagehide', () => galleryContext.revert(), {once: true});
  }

  // Move the panoramic image more slowly than its in-flow viewport.
  const panoramaBridge = document.querySelector('.panorama-bridge');
  if (panoramaBridge && gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    window.__masakenPanoramaCleanup?.();
    const image = panoramaBridge.querySelector('img');
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      panoramaBridge.classList.add('panorama-bridge--parallax');
      gsap.fromTo(image, {y:0}, {
        y:() => window.innerHeight * .6, ease:'none',
        scrollTrigger:{id:'panorama-bridge-parallax', trigger:panoramaBridge,
          start:'top bottom', end:'bottom top', scrub:true, invalidateOnRefresh:true}
      });
      return () => panoramaBridge.classList.remove('panorama-bridge--parallax');
    });
    const refresh = () => ScrollTrigger.refresh();
    if (!image.complete) image.addEventListener('load', refresh, {once:true});
    const cleanup = () => {
      image.removeEventListener('load', refresh);
      motion.revert();
      window.removeEventListener('pagehide', cleanup);
      if (window.__masakenPanoramaCleanup === cleanup) delete window.__masakenPanoramaCleanup;
    };
    window.__masakenPanoramaCleanup = cleanup;
    window.addEventListener('pagehide', cleanup, {once:true});
  }
  const aboutVideo = aboutSection?.querySelector('[data-about-video]');
  if (aboutSection && aboutVideo && 'IntersectionObserver' in window) {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gsap = window.gsap;
    const panel = aboutSection.querySelector('.about-video-panel');
    const phaseA = aboutSection.querySelectorAll('.about-copy .section-kicker,.about-architectural-detail,#about-title,.about-intro,.about-facts');
    let aboutWasVisible = false;
    let entranceAnimations = [];
    const cancelEntrance = () => { entranceAnimations.forEach(animation => animation.cancel()); entranceAnimations = []; };
    const watchAbout = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        aboutWasVisible = true;
        if (!reducedMotion) {
          cancelEntrance();
          if (gsap) {
            gsap.killTweensOf([panel,...phaseA]);
            gsap.timeline()
              .fromTo(panel,{autoAlpha:0,y:16},{autoAlpha:1,y:0,duration:.82,ease:'power2.out'},.04)
              .fromTo(phaseA,{autoAlpha:0,y:10},{autoAlpha:1,y:0,duration:.56,stagger:.07,ease:'power2.out'},.12);
          } else {
            const play = (element,frames,duration,delay=0) => entranceAnimations.push(element.animate(frames,{duration,delay,easing:'cubic-bezier(.2,.7,.25,1)',fill:'both'}));
            play(panel,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],800,40);
            phaseA.forEach((element,index) => play(element,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],540,index*70+100));
          }
          if (aboutVideo.ended || aboutVideo.currentTime > 0) aboutVideo.currentTime = 0;
          aboutVideo.play().catch(() => {});
        }
        return;
      }
      if (!aboutWasVisible) return;
      aboutWasVisible = false;
      cancelEntrance();
      aboutVideo.pause();
      try { aboutVideo.currentTime = 0; } catch {}
    }, {threshold:.24});
    watchAbout.observe(aboutSection);
  }

  const zoomToggle = locationSection?.querySelector('.geo-zoom-toggle');
  const mapFrame = locationSection?.querySelector('.geo-photo-frame');
  const zoomLabel = zoomToggle?.querySelector('.geo-zoom-label');
  zoomToggle?.addEventListener('click', () => {
    const zoomed = mapFrame.classList.toggle('is-zoomed');
    zoomToggle.setAttribute('aria-pressed', String(zoomed));
    zoomToggle.setAttribute('aria-label', zoomed ? 'تصغير الخريطة' : 'تكبير الخريطة');
    if (zoomLabel) zoomLabel.textContent = zoomed ? 'تصغير' : 'تكبير';
    zoomToggle.querySelector('[aria-hidden="true"]').textContent = zoomed ? '−' : '＋';
  });
})();
