const initializedEmbeds = new WeakSet<HTMLElement>();

export function initializeGoogleMapEmbeds(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('.google-map-embed')) {
    if (initializedEmbeds.has(root)) continue;

    let frame = root.querySelector<HTMLIFrameElement>('iframe');
    const retry = root.querySelector<HTMLButtonElement>('[data-map-retry]');
    const status = root.querySelector<HTMLElement>('[data-map-status]');
    if (!frame || !retry || !status) continue;

    initializedEmbeds.add(root);
    retry.hidden = false;

    const trackFocus = (target: HTMLIFrameElement) => {
      target.addEventListener('focus', () => {
        root.dataset.mapFocus = 'true';
      });
      target.addEventListener('blur', () => root.removeAttribute('data-map-focus'));
    };
    trackFocus(frame);

    const syncFrameFocus = () => {
      if (document.activeElement === frame) root.dataset.mapFocus = 'true';
      else root.removeAttribute('data-map-focus');
    };
    // Firefox can enter a cross-origin frame without firing its element focus event.
    // Check after outgoing focus events complete, without moving the visitor's focus.
    window.addEventListener('blur', () => window.setTimeout(syncFrameFocus, 0));
    window.addEventListener('focus', syncFrameFocus);
    document.addEventListener('focusin', syncFrameFocus);
    document.addEventListener('focusout', () => window.setTimeout(syncFrameFocus, 0));

    // The initial iframe is native HTML: loading never waits for JavaScript or moves focus.
    retry.addEventListener('click', () => {
      if (root.dataset.mapState === 'loading' || !frame) return;

      const replacement = frame.cloneNode(true) as HTMLIFrameElement;
      let settled = false;
      const finish = (state: 'ready' | 'error') => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        root.dataset.mapState = state;
        root.removeAttribute('aria-busy');
        retry.removeAttribute('aria-disabled');
        // A cross-origin load event cannot confirm that Google rendered useful content.
        status.textContent =
          state === 'ready'
            ? 'Kartvisningen er åpnet på nytt. Du kan også åpne Google Maps direkte.'
            : 'Kartet svarte ikke. Prøv igjen eller åpne Google Maps direkte.';
        // Keep the frame present: a slow response may still arrive after the timeout.
      };

      root.dataset.mapState = 'loading';
      root.removeAttribute('data-map-focus');
      root.setAttribute('aria-busy', 'true');
      retry.setAttribute('aria-disabled', 'true');
      status.textContent = 'Laster kartet på nytt …';
      const timeout = window.setTimeout(() => finish('error'), 20_000);
      replacement.addEventListener('load', () => finish('ready'), { once: true });
      replacement.addEventListener('error', () => finish('error'), { once: true });
      trackFocus(replacement);
      frame.replaceWith(replacement);
      frame = replacement;
    });
  }
}
