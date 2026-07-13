type CloseReason = 'dismiss' | 'navigation' | 'breakpoint' | 'pagehide' | 'restore';

type StoredProperty = {
  name: string;
  priority: string;
  value: string;
};

type ScrollLock = {
  body: StoredProperty[];
  bodyStyleAttribute: string | null;
  lockAttribute: string | null;
  lockedPaddingRight: number;
  scrollX: number;
  scrollY: number;
};

type MobileMenuController = {
  reset: () => void;
};

const controllers = new WeakMap<HTMLElement, MobileMenuController>();
const desktopMedia = '(min-width: 64rem)';
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
const bodyProperties = ['position', 'top', 'left', 'right', 'width', 'overflow', 'padding-right'];

function storeProperties(element: HTMLElement, names: string[]): StoredProperty[] {
  return names.map((name) => ({
    name,
    priority: element.style.getPropertyPriority(name),
    value: element.style.getPropertyValue(name),
  }));
}

function restoreProperties(element: HTMLElement, properties: StoredProperty[]): void {
  for (const property of properties) {
    if (property.value) {
      element.style.setProperty(property.name, property.value, property.priority);
    } else {
      element.style.removeProperty(property.name);
    }
  }
}

function createScrollLock(): ScrollLock {
  const { body, documentElement } = document;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const scrollbarWidth = Math.max(0, window.innerWidth - documentElement.clientWidth);
  const computedPadding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
  return {
    body: storeProperties(body, bodyProperties),
    bodyStyleAttribute: body.getAttribute('style'),
    lockAttribute: body.getAttribute('data-mobile-menu-scroll-lock'),
    lockedPaddingRight: computedPadding + scrollbarWidth,
    scrollX,
    scrollY,
  };
}

function applyScrollLock(lock: ScrollLock): void {
  const { body } = document;
  body.setAttribute('data-mobile-menu-scroll-lock', 'true');
  body.style.setProperty('position', 'fixed');
  body.style.setProperty('top', `${-lock.scrollY}px`);
  body.style.setProperty('left', `${-lock.scrollX}px`);
  body.style.setProperty('right', '0');
  body.style.setProperty('width', '100%');
  body.style.setProperty('overflow', 'hidden');
  body.style.setProperty('padding-right', `${lock.lockedPaddingRight}px`);
}

function unlockScroll(lock: ScrollLock | null): void {
  if (!lock) return;

  const { body } = document;
  restoreProperties(body, lock.body);
  if (lock.lockAttribute === null) {
    body.removeAttribute('data-mobile-menu-scroll-lock');
  } else {
    body.setAttribute('data-mobile-menu-scroll-lock', lock.lockAttribute);
  }
  if (lock.bodyStyleAttribute === null && body.style.length === 0) {
    body.removeAttribute('style');
  }

  window.scrollTo({ behavior: 'instant', left: lock.scrollX, top: lock.scrollY });
}

function visibleFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => {
      if (element.closest('[hidden]')) return false;
      const style = getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.getClientRects().length > 0
      );
    },
  );
}

function isDialogSupported(dialog: HTMLDialogElement): boolean {
  return 'HTMLDialogElement' in window && typeof dialog.showModal === 'function';
}

export function initializeMobileMenu(root: HTMLElement): MobileMenuController | null {
  const existing = controllers.get(root);
  if (existing) {
    existing.reset();
    return existing;
  }

  const fallback = root.querySelector<HTMLDetailsElement>('[data-mobile-menu-fallback]');
  const fallbackSummary = fallback?.querySelector<HTMLElement>('summary');
  const trigger = root.querySelector<HTMLButtonElement>('.mobile-menu-trigger');
  const dialog = root.querySelector<HTMLDialogElement>('[data-mobile-menu-dialog]');
  const closeButton = root.querySelector<HTMLButtonElement>('[data-mobile-menu-close]');
  const navigation = dialog?.querySelector<HTMLElement>('.mobile-menu-navigation');

  if (
    !fallback ||
    !fallbackSummary ||
    !trigger ||
    !dialog ||
    !closeButton ||
    !navigation ||
    !isDialogSupported(dialog)
  ) {
    return null;
  }

  const events = new AbortController();
  const desktopQuery = window.matchMedia(desktopMedia);
  let isOpen = false;
  let scrollLock: ScrollLock | null = null;

  const resetTrigger = () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Åpne meny');
  };

  const desktopFocusTarget = (): HTMLAnchorElement | null =>
    root.parentElement?.querySelector<HTMLAnchorElement>(
      '.desktop-nav a[aria-current="page"], .desktop-nav a',
    ) ?? null;

  const finalizeClose = (reason: CloseReason, focusWasInside: boolean) => {
    resetTrigger();

    try {
      if (reason === 'dismiss') {
        trigger.focus({ preventScroll: true });
      } else if (reason === 'breakpoint' && focusWasInside) {
        desktopFocusTarget()?.focus({ preventScroll: true });
      }
    } finally {
      unlockScroll(scrollLock);
      scrollLock = null;
    }
  };

  const closeMenu = (reason: CloseReason) => {
    const focusWasInside = dialog.contains(document.activeElement);
    isOpen = false;
    if (dialog.open) dialog.close();
    finalizeClose(reason, focusWasInside);
  };

  const restoreFallback = (moveFocusToSummary = false) => {
    if (dialog.open) dialog.close();
    isOpen = false;
    events.abort();
    root.removeAttribute('data-mobile-menu-enhanced');
    fallback.hidden = false;
    fallback.open = false;
    trigger.hidden = true;
    resetTrigger();
    controllers.delete(root);
    try {
      if (moveFocusToSummary) fallbackSummary.focus({ preventScroll: true });
    } finally {
      unlockScroll(scrollLock);
      scrollLock = null;
    }
  };

  const openMenu = () => {
    if (isOpen || desktopQuery.matches) return;

    try {
      scrollLock = createScrollLock();
      dialog.showModal();
      isOpen = true;
      applyScrollLock(scrollLock);
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', 'Lukk meny');
      closeButton.focus({ preventScroll: true });
    } catch {
      restoreFallback(true);
    }
  };

  const handleDialogKeydown = (event: KeyboardEvent) => {
    if (!isOpen || event.key !== 'Tab') return;

    const focusable = visibleFocusableElements(dialog);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (
      event.shiftKey &&
      (document.activeElement === first || !dialog.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleNavigation = (event: MouseEvent) => {
    const target = event.target;
    const link = target instanceof Element ? target.closest('a[href]') : null;
    if (link) closeMenu('navigation');
  };

  const handleBreakpoint = (event: MediaQueryListEvent | MediaQueryList) => {
    if (!event.matches) return;
    fallback.open = false;
    if (isOpen || dialog.open) closeMenu('breakpoint');
  };

  const reset = () => {
    fallback.open = false;
    if (isOpen || dialog.open || scrollLock) closeMenu('restore');
    resetTrigger();
  };

  try {
    trigger.addEventListener('click', openMenu, { signal: events.signal });
    closeButton.addEventListener('click', () => closeMenu('dismiss'), { signal: events.signal });
    dialog.addEventListener(
      'cancel',
      (event) => {
        event.preventDefault();
        closeMenu('dismiss');
      },
      { signal: events.signal },
    );
    dialog.addEventListener(
      'close',
      () => {
        if (isOpen) {
          isOpen = false;
          finalizeClose('restore', false);
        }
      },
      { signal: events.signal },
    );
    dialog.addEventListener('keydown', handleDialogKeydown, { signal: events.signal });
    navigation.addEventListener('click', handleNavigation, { signal: events.signal });
    desktopQuery.addEventListener('change', handleBreakpoint, { signal: events.signal });
    window.addEventListener('pagehide', () => closeMenu('pagehide'), { signal: events.signal });

    const controller = { reset };
    controllers.set(root, controller);
    fallback.open = false;
    root.setAttribute('data-mobile-menu-enhanced', 'true');
    fallback.hidden = true;
    trigger.hidden = false;
    handleBreakpoint(desktopQuery);
    return controller;
  } catch {
    restoreFallback(false);
    return null;
  }
}

export function initializeMobileMenus(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-mobile-menu]')) {
    initializeMobileMenu(root);
  }
}
