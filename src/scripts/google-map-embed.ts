const initializedEmbeds = new WeakSet<HTMLElement>();

export function initializeGoogleMapEmbeds(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('.google-map-embed')) {
    if (initializedEmbeds.has(root)) continue;

    const gate = root.querySelector<HTMLElement>('[data-map-gate]');
    const heading = gate?.querySelector<HTMLElement>('[data-map-gate-heading]');
    const detail = gate?.querySelector<HTMLElement>('[data-map-gate-detail]');
    const button = gate?.querySelector<HTMLButtonElement>('[data-map-load]');
    const template = root.querySelector<HTMLTemplateElement>('[data-map-template]');
    const status = root.querySelector<HTMLElement>('[data-map-status]');
    const sourceFrame = template?.content.querySelector('iframe');
    if (!gate || !heading || !detail || !button || !sourceFrame || !status) continue;

    initializedEmbeds.add(root);
    button.hidden = false;

    button.addEventListener('click', () => {
      if (root.dataset.mapState === 'loading') return;

      const frame = sourceFrame.cloneNode(true);
      if (!(frame instanceof HTMLIFrameElement)) return;

      let settled = false;
      const showFrameFocus = () => {
        root.dataset.mapFocus = 'true';
      };
      const hideFrameFocus = () => {
        root.removeAttribute('data-map-focus');
      };
      const finish = (state: 'ready' | 'error') => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        root.removeAttribute('aria-busy');

        if (state === 'ready') {
          root.dataset.mapState = 'ready';
          gate.remove();
          status.textContent = 'Google Maps-kartet er lastet.';
          showFrameFocus();
          frame.focus({ preventScroll: true });
          return;
        }

        frame.remove();
        hideFrameFocus();
        root.dataset.mapState = 'error';
        heading.textContent = 'Kartet kunne ikke lastes';
        detail.textContent = 'Prøv igjen eller bruk Veibeskrivelse ved siden av.';
        button.disabled = false;
        button.textContent = 'Prøv igjen';
        status.textContent = 'Google Maps-kartet kunne ikke lastes.';
      };

      root.dataset.mapState = 'loading';
      root.setAttribute('aria-busy', 'true');
      heading.textContent = 'Laster kart';
      detail.textContent = 'Dette kan ta et øyeblikk.';
      button.disabled = true;
      button.textContent = 'Laster …';
      status.textContent = 'Google Maps-kartet lastes.';
      root.insertBefore(frame, gate);

      const timeout = window.setTimeout(() => finish('error'), 20_000);
      frame.addEventListener('focus', showFrameFocus);
      frame.addEventListener('blur', hideFrameFocus);
      frame.addEventListener('load', () => finish('ready'), { once: true });
      frame.addEventListener('error', () => finish('error'), { once: true });
    });
  }
}
