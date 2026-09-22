const initializedEmbeds = new WeakSet<HTMLElement>();

export function initializeGoogleMapEmbeds(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('.google-map-embed')) {
    if (initializedEmbeds.has(root)) continue;

    const gate = root.querySelector<HTMLElement>('[data-map-gate]');
    const canvas = root.querySelector<HTMLElement>('[data-map-canvas]');
    const controls = root.querySelector<HTMLElement>('[data-map-controls]');
    const retry = root.querySelector<HTMLButtonElement>('[data-map-retry]');
    const heading = gate?.querySelector<HTMLElement>('[data-map-gate-heading]');
    const detail = gate?.querySelector<HTMLElement>('[data-map-gate-detail]');
    const button = gate?.querySelector<HTMLButtonElement>('[data-map-load]');
    const template = root.querySelector<HTMLTemplateElement>('[data-map-template]');
    const status = root.querySelector<HTMLElement>('[data-map-status]');
    const sourceFrame = template?.content.querySelector('iframe');
    if (
      !gate ||
      !canvas ||
      !controls ||
      !retry ||
      !heading ||
      !detail ||
      !button ||
      !sourceFrame ||
      !status
    )
      continue;

    initializedEmbeds.add(root);
    button.hidden = false;

    let currentFrame: HTMLIFrameElement | null = null;

    const loadMap = () => {
      if (root.dataset.mapState === 'loading') return;

      const frame = sourceFrame.cloneNode(true);
      if (!(frame instanceof HTMLIFrameElement)) return;
      currentFrame?.remove();
      currentFrame = frame;

      let settled = false;
      const showFrameFocus = () => {
        root.dataset.mapFocus = 'true';
      };
      const hideFrameFocus = () => {
        root.removeAttribute('data-map-focus');
      };
      const finish = (state: 'displayed' | 'error') => {
        if (settled) return;
        settled = true;
        // Loading is asynchronous: respect focus if the visitor has moved on.
        const keepFocusInMap =
          document.activeElement === button || document.activeElement === retry;
        window.clearTimeout(timeout);
        root.removeAttribute('aria-busy');
        button.removeAttribute('aria-disabled');
        retry.removeAttribute('aria-disabled');
        controls.hidden = false;

        if (state === 'displayed') {
          root.dataset.mapState = 'displayed';
          gate.hidden = true;
          // Cross-origin iframe load also fires on network errors. Keep recovery available.
          status.textContent =
            'Kartvisningen er åpnet. Hvis kartet ikke vises, prøv igjen eller åpne Google Maps.';
          if (keepFocusInMap) {
            frame.focus({ preventScroll: true });
          }
          // Firefox may focus the frame without firing its element focus event,
          // including when the visitor enters it before its load event.
          if (document.activeElement === frame) showFrameFocus();
          return;
        }

        frame.remove();
        hideFrameFocus();
        root.dataset.mapState = 'error';
        heading.textContent = 'Kartet kunne ikke lastes';
        detail.textContent = 'Prøv igjen eller åpne kartet i Google Maps.';
        button.hidden = true;
        status.textContent = 'Google Maps-kartet kunne ikke lastes.';
        if (keepFocusInMap) retry.focus({ preventScroll: true });
      };

      root.dataset.mapState = 'loading';
      gate.hidden = false;
      root.setAttribute('aria-busy', 'true');
      heading.textContent = 'Laster kart';
      detail.textContent = 'Dette kan ta et øyeblikk.';
      // Keep the initiating button focused and tabbable while duplicate loads are ignored.
      button.setAttribute('aria-disabled', 'true');
      button.hidden = false;
      retry.setAttribute('aria-disabled', 'true');
      button.textContent = 'Laster …';
      status.textContent = 'Google Maps-kartet lastes.';
      const timeout = window.setTimeout(() => finish('error'), 20_000);
      frame.addEventListener('focus', showFrameFocus);
      frame.addEventListener('blur', hideFrameFocus);
      frame.addEventListener('load', () => finish('displayed'), { once: true });
      frame.addEventListener('error', () => finish('error'), { once: true });
      canvas.insertBefore(frame, gate);
    };

    button.addEventListener('click', loadMap);
    retry.addEventListener('click', loadMap);
  }
}
