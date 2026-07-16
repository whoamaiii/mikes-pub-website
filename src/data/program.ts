import type { CategoryFilterItem } from '../types/design-system';
import type {
  ProgramConceptEntry,
  ProgramFilterDefinition,
  ProgramPublishedEntry,
  ProgramPublishedEventListState,
} from '../types/program';

const categoryLabels = {
  music: 'Musikk',
  sport: 'Sport',
  quiz: 'Quiz',
  standup: 'Stand-up',
} as const;

const allowedConceptEntryKeys = new Set([
  'category',
  'categoryLabel',
  'demoOnly',
  'description',
  'id',
  'status',
  'title',
]);

const publishedBaseKeys = [
  'action',
  'category',
  'categoryLabel',
  'description',
  'id',
  'image',
  'status',
  'title',
] as const;

const timedEntryKeys = new Set([...publishedBaseKeys, 'dateLabel', 'dateTime']);
const postponedEntryKeys = new Set([
  ...publishedBaseKeys,
  'previousDateLabel',
  'previousDateTime',
  'replacementDateLabel',
  'replacementDateTime',
]);

const actionKeys = new Set(['accessibleLabel', 'external', 'href', 'label']);
const imageKeys = new Set(['alt', 'decorative', 'height', 'rightsStatus', 'src', 'width']);
const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const rootRelativePathPattern = /^\/(?!\/)[^\s\\]*$/;
const fragmentHrefPattern = /^#[^\s\\]+$/;
const isoDateTimePattern =
  /^([1-9]\d{3})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/;

export const programFilterDefinitions = [
  {
    value: 'all',
    label: 'Alle',
    query: 'alle',
    targetId: 'filter-all',
    summary: 'Viser alle bekreftede arrangementer.',
  },
  {
    value: 'music',
    label: 'Musikk',
    query: 'musikk',
    targetId: 'filter-musikk',
    summary: 'Viser bekreftede musikkarrangementer.',
  },
  {
    value: 'sport',
    label: 'Sport',
    query: 'sport',
    targetId: 'filter-sport',
    summary: 'Viser bekreftede sportsvisninger.',
  },
  {
    value: 'quiz',
    label: 'Quiz',
    query: 'quiz',
    targetId: 'filter-quiz',
    summary: 'Viser bekreftede quizer.',
  },
  {
    value: 'standup',
    label: 'Stand-up',
    query: 'standup',
    targetId: 'filter-standup',
    summary: 'Viser bekreftede stand-up-arrangementer.',
  },
] as const satisfies readonly ProgramFilterDefinition[];

export const programCategories: readonly CategoryFilterItem[] = programFilterDefinitions.map(
  ({ label, query, targetId, value }) => ({
    value,
    label,
    href: `/program?kategori=${query}#${targetId}`,
  }),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isProgramEntryCategory(value: unknown): value is keyof typeof categoryLabels {
  return typeof value === 'string' && Object.hasOwn(categoryLabels, value);
}

function requireNonEmptyString(value: unknown, message: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(message);
  }
}

function requireStableId(value: unknown, message: string): asserts value is string {
  requireNonEmptyString(value, message);
  if (!stableIdPattern.test(value)) {
    throw new TypeError(`${message} Use lowercase letters, numbers and single hyphens only.`);
  }
}

function isSafeInternalHref(value: string): boolean {
  return rootRelativePathPattern.test(value) || fragmentHrefPattern.test(value);
}

function isSafeHttpsHref(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

function assertAllowedKeys(
  value: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
  context: string,
): void {
  const unexpectedKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unexpectedKey) {
    throw new TypeError(`${context} contains forbidden field ${unexpectedKey}.`);
  }
}

function validatePublishedAction(value: unknown, id: string): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    throw new TypeError(`Published program entry ${id} action must be an object.`);
  }

  assertAllowedKeys(value, actionKeys, `Published program entry ${id} action`);
  requireNonEmptyString(value.href, `Published program entry ${id} action requires an href.`);
  requireNonEmptyString(value.label, `Published program entry ${id} action requires a label.`);
  if (value.accessibleLabel !== undefined) {
    requireNonEmptyString(
      value.accessibleLabel,
      `Published program entry ${id} action accessible label must not be empty.`,
    );
  }
  if (value.external !== undefined && typeof value.external !== 'boolean') {
    throw new TypeError(`Published program entry ${id} action external flag must be boolean.`);
  }

  const internal = isSafeInternalHref(value.href);
  const external = isSafeHttpsHref(value.href);
  if (!internal && !external) {
    throw new TypeError(
      `Published program entry ${id} action href must be a safe local path, fragment or HTTPS URL.`,
    );
  }
  if (external !== (value.external === true)) {
    throw new TypeError(
      `Published program entry ${id} action external flag must match its href destination.`,
    );
  }
}

function validatePublishedImage(value: unknown, id: string): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    throw new TypeError(`Published program entry ${id} image must be an object.`);
  }

  assertAllowedKeys(value, imageKeys, `Published program entry ${id} image`);
  requireNonEmptyString(value.src, `Published program entry ${id} image requires a source.`);
  if (!rootRelativePathPattern.test(value.src)) {
    throw new TypeError(
      `Published program entry ${id} image source must be an approved same-origin path.`,
    );
  }
  if (typeof value.width !== 'number' || !Number.isInteger(value.width) || value.width <= 0) {
    throw new TypeError(`Published program entry ${id} image width must be a positive integer.`);
  }
  if (typeof value.height !== 'number' || !Number.isInteger(value.height) || value.height <= 0) {
    throw new TypeError(`Published program entry ${id} image height must be a positive integer.`);
  }
  if (
    typeof value.alt !== 'string' ||
    (value.decorative !== true && value.alt.trim().length === 0)
  ) {
    throw new TypeError(`Published program entry ${id} image requires alternative text.`);
  }
  if (value.decorative !== undefined && typeof value.decorative !== 'boolean') {
    throw new TypeError(`Published program entry ${id} image decorative flag must be boolean.`);
  }
  if (value.rightsStatus !== 'demo-cleared' && value.rightsStatus !== 'production-cleared') {
    throw new TypeError(`Published program entry ${id} image requires a valid rights status.`);
  }
}

function validateDateTime(value: unknown, id: string, field: string): void {
  requireNonEmptyString(value, `Published program entry ${id} requires ${field}.`);
  const match = isoDateTimePattern.exec(value);
  if (!match || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`Published program entry ${id} ${field} must be a valid date-time.`);
  }

  const [, year, month, day, hour, minute, second, fraction = '0'] = match;
  const normalized = new Date(0);
  normalized.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  normalized.setUTCHours(
    Number(hour),
    Number(minute),
    Number(second),
    Number(fraction.padEnd(3, '0')),
  );
  if (
    normalized.getUTCFullYear() !== Number(year) ||
    normalized.getUTCMonth() !== Number(month) - 1 ||
    normalized.getUTCDate() !== Number(day) ||
    normalized.getUTCHours() !== Number(hour) ||
    normalized.getUTCMinutes() !== Number(minute) ||
    normalized.getUTCSeconds() !== Number(second)
  ) {
    throw new TypeError(`Published program entry ${id} ${field} must be a valid date-time.`);
  }
}

function validateDateLabel(value: unknown, id: string, field: string): void {
  requireNonEmptyString(value, `Published program entry ${id} requires ${field}.`);
}

export function validateProgramConceptEntries(input: unknown): ProgramConceptEntry[] {
  if (!Array.isArray(input)) {
    throw new TypeError('Program concept entries must be an array.');
  }
  if (input.length > 4) {
    throw new RangeError('Program concept entries may contain at most four records.');
  }

  const ids = new Set<string>();
  const categories = new Set<string>();

  return input.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new TypeError(`Program concept entry ${index + 1} must be an object.`);
    }

    assertAllowedKeys(entry, allowedConceptEntryKeys, `Program concept entry ${index + 1}`);

    const { category, categoryLabel, demoOnly, description, id, status, title } = entry;
    requireStableId(id, `Program concept entry ${index + 1} requires a stable id.`);
    if (ids.has(id)) {
      throw new TypeError(`Program concept entry id ${id} is duplicated.`);
    }
    ids.add(id);

    if (!isProgramEntryCategory(category)) {
      throw new TypeError(`Program concept entry ${id} has an unsupported category.`);
    }
    if (categories.has(category)) {
      throw new TypeError(`Program concept category ${category} is duplicated.`);
    }
    categories.add(category);

    const expectedLabel = categoryLabels[category];
    if (categoryLabel !== expectedLabel) {
      throw new TypeError(`Program concept entry ${id} requires category label ${expectedLabel}.`);
    }
    if (status !== 'concept' || demoOnly !== true) {
      throw new TypeError(`Program concept entry ${id} must be a demo-only concept record.`);
    }
    if (typeof title !== 'string' || title.trim() === '') {
      throw new TypeError(`Program concept entry ${id} requires a title.`);
    }
    if (typeof description !== 'string' || description.trim() === '') {
      throw new TypeError(`Program concept entry ${id} requires a description.`);
    }

    return entry as ProgramConceptEntry;
  });
}

export function validatePublishedProgramEntries(input: unknown): ProgramPublishedEntry[] {
  if (!Array.isArray(input)) {
    throw new TypeError('Published program entries must be an array.');
  }

  const ids = new Set<string>();

  return input.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new TypeError(`Published program entry ${index + 1} must be an object.`);
    }

    const { category, categoryLabel, description, id, status, title } = entry;
    requireStableId(id, `Published program entry ${index + 1} requires a stable id.`);
    if (ids.has(id)) {
      throw new TypeError(`Published program entry id ${id} is duplicated.`);
    }
    ids.add(id);

    if (!isProgramEntryCategory(category)) {
      throw new TypeError(`Published program entry ${id} has an unsupported category.`);
    }
    const expectedLabel = categoryLabels[category];
    if (categoryLabel !== expectedLabel) {
      throw new TypeError(
        `Published program entry ${id} requires category label ${expectedLabel}.`,
      );
    }
    requireNonEmptyString(title, `Published program entry ${id} requires a title.`);
    if (description !== undefined) {
      requireNonEmptyString(
        description,
        `Published program entry ${id} description must not be empty.`,
      );
    }

    validatePublishedAction(entry.action, id);
    validatePublishedImage(entry.image, id);

    if (status === 'concept') {
      throw new TypeError(`Published program entry ${id} cannot be a concept record.`);
    }
    if (status === 'scheduled' || status === 'cancelled' || status === 'expired') {
      assertAllowedKeys(entry, timedEntryKeys, `Published program entry ${id}`);
      validateDateTime(entry.dateTime, id, 'dateTime');
      validateDateLabel(entry.dateLabel, id, 'dateLabel');
    } else if (status === 'postponed') {
      assertAllowedKeys(entry, postponedEntryKeys, `Published program entry ${id}`);
      validateDateTime(entry.previousDateTime, id, 'previousDateTime');
      validateDateLabel(entry.previousDateLabel, id, 'previousDateLabel');

      const hasReplacementDateTime = entry.replacementDateTime !== undefined;
      const hasReplacementDateLabel = entry.replacementDateLabel !== undefined;
      if (hasReplacementDateTime !== hasReplacementDateLabel) {
        throw new TypeError(
          `Published program entry ${id} requires both replacement date fields or neither.`,
        );
      }
      if (hasReplacementDateTime) {
        validateDateTime(entry.replacementDateTime, id, 'replacementDateTime');
        validateDateLabel(entry.replacementDateLabel, id, 'replacementDateLabel');
      }
    } else {
      throw new TypeError(`Published program entry ${id} has an unsupported status.`);
    }

    return entry as ProgramPublishedEntry;
  });
}

export function resolveProgramEventListState(
  entries: readonly ProgramPublishedEntry[],
  error?: unknown,
): ProgramPublishedEventListState {
  if (error) {
    return {
      kind: 'error',
      error: {
        heading: 'Programvisningen kunne ikke lastes.',
        message: 'Last siden på nytt. Hvis feilen fortsetter, prøv igjen senere.',
        action: { href: '/program', label: 'Last inn på nytt' },
      },
    };
  }

  if (entries.length === 0) {
    return {
      kind: 'empty',
      empty: {
        heading: 'Ingen bekreftede arrangementer ennå.',
        message:
          'Dato, tidspunkt og eventuelle billettdetaljer publiseres først når informasjonen er klar.',
      },
    };
  }

  return {
    kind: 'ready',
    events: entries,
    filteredEmpty: {
      heading: 'Ingen arrangementer i denne kategorien.',
      message: 'Velg Alle for å se resten av det bekreftede programmet.',
      action: {
        href: '/program?kategori=alle#filter-all',
        label: 'Vis alle',
      },
    },
  };
}

// The production route stays empty until event facts are verified. Concept fixtures live only in
// tests and the isolated design-system preview; this boundary rejects them.
export const publishedProgramEntries = validatePublishedProgramEntries([]);

export const programEventListState = resolveProgramEventListState(publishedProgramEntries);

export const programIntro = {
  title: 'Program',
  intro: 'Datoer, tider og detaljer kommer her når de er bekreftet.',
};
