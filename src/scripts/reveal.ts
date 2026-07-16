const initialized = new WeakSet<Element>();

export function initializeReveals(scope: ParentNode = document): void {
  const elements = [...scope.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
    (element) => !initialized.has(element),
  );

  if (elements.length === 0) return;

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    for (const element of elements) {
      initialized.add(element);
      element.dataset.revealVisible = 'true';
    }
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealVisible = 'true';
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  for (const element of elements) {
    initialized.add(element);
    observer.observe(element);
  }
}
