(() => {
  const section = document.querySelector('.location-journey');
  if (!section || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  section.classList.add('location-reveal-ready');
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    section.classList.add('location-revealed');
    observer.disconnect();
  }, { threshold: 0.5, rootMargin: "0px 0px -12% 0px" });
  observer.observe(section.querySelector('.location-heading > .section-kicker') || section);
})();
