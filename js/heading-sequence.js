(() => {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const headings = document.querySelectorAll('.hero h1, #about-title, #land-gallery-title, #explorer-title, .faq-heading h2, .closing-copy h2');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('heading-sequence-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  headings.forEach(heading => {
    const gold = heading.querySelector('em, span:last-child');
    if (!gold) return;
    gold.classList.add('heading-sequence-gold');
    heading.classList.add('heading-sequence-ready');
    observer.observe(heading);
  });
  document.querySelector('#location-title em')?.classList.add('heading-sequence-gold');
})();
