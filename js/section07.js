(() => {
  const section = document.querySelector('#developer');
  if (!section) return;
  const heading = section.querySelector('.developer-heading');
  const developer = section.querySelector('.identity-developer');
  const marketer = section.querySelector('.identity-marketer');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    [heading, developer, marketer].forEach(item => item.classList.add('is-visible'));
    return;
  }
  section.classList.add('motion-enabled');
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    heading.classList.add('is-visible');
    window.setTimeout(() => developer.classList.add('is-visible'), 90);
    window.setTimeout(() => marketer.classList.add('is-visible'), 260);
    observer.disconnect();
  }, { threshold: 0.18 });
  observer.observe(section);
})();
