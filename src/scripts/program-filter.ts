import type { CategoryFilterItem } from '../types/design-system';

type ProgramCategory = CategoryFilterItem['value'];

type FilterEntry = {
  category: ProgramCategory;
  fragment: string;
  href: string;
  link: HTMLAnchorElement;
  query: string;
};

type ProgramFilterController = {
  sync: () => void;
};

const controllers = new WeakMap<HTMLElement, ProgramFilterController>();
const categories: readonly ProgramCategory[] = ['all', 'music', 'sport', 'quiz', 'standup'];

function isProgramCategory(value: string | undefined): value is ProgramCategory {
  return value !== undefined && categories.some((category) => category === value);
}

function relativeUrl(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function initializeProgramFilter(root: HTMLElement): ProgramFilterController | null {
  const existing = controllers.get(root);
  if (existing) {
    existing.sync();
    return existing;
  }

  const shell = root.querySelector<HTMLElement>('[data-program-filter-shell]');
  const list = root.querySelector<HTMLUListElement>('[data-event-list]');
  const feedback = root.querySelector<HTMLElement>('[data-event-feedback]');
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-program-filter-link]'));
  const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-event-row]'));
  const markers = Array.from(root.querySelectorAll<HTMLElement>('[data-filter-target]'));
  const summaries = Array.from(root.querySelectorAll<HTMLElement>('[data-filter-summary-value]'));

  if (
    !shell ||
    !list ||
    !feedback ||
    links.length !== categories.length ||
    markers.length !== categories.length ||
    summaries.length !== categories.length
  ) {
    return null;
  }

  const markerCategories = new Map(
    markers.map((marker) => [marker.id, marker.dataset.filterTarget]),
  );
  const summaryCategories = new Set(summaries.map((summary) => summary.dataset.filterSummaryValue));
  const entryByCategory = new Map<ProgramCategory, FilterEntry>();
  const entryByHref = new Map<string, FilterEntry>();
  const categoryByQuery = new Map<string, ProgramCategory>();
  const categoryByFragment = new Map<string, ProgramCategory>();

  for (const link of links) {
    const category = link.dataset.filterValue;
    const url = new URL(link.href, window.location.href);
    const query = url.searchParams.get('kategori');
    const fragment = url.hash.slice(1);

    if (
      !isProgramCategory(category) ||
      !query ||
      !fragment ||
      url.origin !== window.location.origin ||
      url.pathname !== window.location.pathname ||
      markerCategories.get(fragment) !== category ||
      !summaryCategories.has(category) ||
      entryByCategory.has(category) ||
      categoryByQuery.has(query) ||
      categoryByFragment.has(fragment)
    ) {
      return null;
    }

    const entry = {
      category,
      fragment,
      href: relativeUrl(url),
      link,
      query,
    };
    entryByCategory.set(category, entry);
    entryByHref.set(entry.href, entry);
    categoryByQuery.set(query, category);
    categoryByFragment.set(fragment, category);
  }

  if (
    categories.some((category) => !entryByCategory.has(category)) ||
    rows.some(
      (row) => !isProgramCategory(row.dataset.eventCategory) || row.dataset.eventCategory === 'all',
    )
  ) {
    return null;
  }

  const events = new AbortController();

  const revealActiveFilter = (category: ProgramCategory) => {
    const link = entryByCategory.get(category)?.link;
    const scroller = link?.closest<HTMLElement>('.category-filter');
    if (!link || !scroller) return;

    const linkBox = link.getBoundingClientRect();
    const scrollerBox = scroller.getBoundingClientRect();
    const track = scroller.querySelector<HTMLElement>('ul');
    const focusInset = Math.max(
      1,
      Number.parseFloat(track ? window.getComputedStyle(track).paddingInlineEnd : '') || 1,
    );
    if (linkBox.left < scrollerBox.left + focusInset) {
      scroller.scrollLeft += Math.floor(linkBox.left - scrollerBox.left - focusInset);
    } else if (linkBox.right > scrollerBox.right - focusInset) {
      scroller.scrollLeft += Math.ceil(linkBox.right - scrollerBox.right + focusInset);
    }
  };

  const restoreFragmentFallback = () => {
    events.abort();
    shell.removeAttribute('data-program-filter-enhanced');
    shell.removeAttribute('data-active-filter');
    for (const link of links) link.removeAttribute('aria-current');
    for (const row of rows) row.removeAttribute('hidden');
    for (const summary of summaries) summary.removeAttribute('hidden');
    list.removeAttribute('hidden');
    feedback.removeAttribute('hidden');
    controllers.delete(root);
  };

  const applyCategory = (category: ProgramCategory) => {
    let visibleRows = 0;
    for (const link of links) {
      if (link.dataset.filterValue === category) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
    for (const summary of summaries) {
      summary.hidden = summary.dataset.filterSummaryValue !== category;
    }
    for (const row of rows) {
      const visible = category === 'all' || row.dataset.eventCategory === category;
      row.hidden = !visible;
      if (visible) visibleRows += 1;
    }

    shell.dataset.activeFilter = category;
    list.hidden = visibleRows === 0;
    feedback.hidden = visibleRows !== 0;
    revealActiveFilter(category);
  };

  const resolveLocation = () => {
    const url = new URL(window.location.href);
    const hasQuery = url.searchParams.has('kategori');
    const hasFragment = url.hash.length > 1;
    const queryCategory = hasQuery
      ? categoryByQuery.get(url.searchParams.get('kategori') ?? '')
      : undefined;
    const fragmentCategory = hasFragment ? categoryByFragment.get(url.hash.slice(1)) : undefined;

    const hasInvalidState =
      (hasQuery && !queryCategory) ||
      (hasFragment && !fragmentCategory) ||
      Boolean(queryCategory && fragmentCategory && queryCategory !== fragmentCategory);
    const category: ProgramCategory = hasInvalidState
      ? 'all'
      : (queryCategory ?? fragmentCategory ?? 'all');

    const cleanDefault = !hasQuery && !hasFragment && category === 'all';
    return {
      category,
      canonicalHref: cleanDefault ? window.location.pathname : entryByCategory.get(category)!.href,
    };
  };

  const sync = () => {
    const { canonicalHref, category } = resolveLocation();
    if (relativeUrl(new URL(window.location.href)) !== canonicalHref) {
      window.history.replaceState(window.history.state, '', canonicalHref);
    }
    applyCategory(category);
  };

  const handleActivation = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;
    const link = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link || link.target || link.hasAttribute('download')) return;

    const url = new URL(link.href, window.location.href);
    const entry = entryByHref.get(relativeUrl(url));
    if (!entry || url.origin !== window.location.origin) return;

    event.preventDefault();
    try {
      window.history.pushState(null, '', entry.href);
      applyCategory(entry.category);
      if (feedback.contains(link) && feedback.hidden) {
        entry.link.focus({ preventScroll: true });
      }
    } catch {
      window.location.assign(url.href);
    }
  };

  try {
    root.addEventListener('click', handleActivation, { signal: events.signal });
    window.addEventListener('popstate', sync, { signal: events.signal });
    window.addEventListener('hashchange', sync, { signal: events.signal });
    shell.setAttribute('data-program-filter-enhanced', 'true');
    sync();
    const controller = { sync };
    controllers.set(root, controller);
    return controller;
  } catch {
    restoreFragmentFallback();
    return null;
  }
}

export function initializeProgramFilters(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-program-filter]')) {
    initializeProgramFilter(root);
  }
}
