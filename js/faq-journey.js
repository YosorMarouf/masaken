(() => {
  const journey = document.querySelector('#faq .decision-journey');
  if (!journey) return;

  if (!('IntersectionObserver' in window)) {
    journey.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    journey.classList.add('is-visible');
    observer.disconnect();
  }, { threshold: 0.35 });

  observer.observe(journey);
})();
