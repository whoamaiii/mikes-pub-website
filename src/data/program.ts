import type { CategoryFilterItem } from '../types/design-system';
import type {
  ProgramConceptEntry,
  ProgramEventListState,
  ProgramFilterDefinition,
} from '../types/program';

const categoryLabels = {
  music: 'Musikk',
  sport: 'Sport',
  quiz: 'Quiz',
  standup: 'Stand-up',
} as const;

const allowedEntryKeys = new Set([
  'category',
  'categoryLabel',
  'demoOnly',
  'description',
  'id',
  'status',
  'title',
]);

export const programFilterDefinitions = [
  {
    value: 'all',
    label: 'Alle',
    query: 'alle',
    targetId: 'filter-all',
    summary: 'Viser alle datonøytrale konseptoppføringer.',
  },
  {
    value: 'music',
    label: 'Musikk',
    query: 'musikk',
    targetId: 'filter-musikk',
    summary: 'Viser datonøytrale konseptoppføringer for Musikk.',
  },
  {
    value: 'sport',
    label: 'Sport',
    query: 'sport',
    targetId: 'filter-sport',
    summary: 'Viser datonøytrale konseptoppføringer for Sport.',
  },
  {
    value: 'quiz',
    label: 'Quiz',
    query: 'quiz',
    targetId: 'filter-quiz',
    summary: 'Viser datonøytrale konseptoppføringer for Quiz.',
  },
  {
    value: 'standup',
    label: 'Stand-up',
    query: 'standup',
    targetId: 'filter-standup',
    summary: 'Viser datonøytrale konseptoppføringer for Stand-up.',
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

    const unexpectedKey = Object.keys(entry).find((key) => !allowedEntryKeys.has(key));
    if (unexpectedKey) {
      throw new TypeError(
        `Program concept entry ${index + 1} contains forbidden field ${unexpectedKey}.`,
      );
    }

    const { category, categoryLabel, demoOnly, description, id, status, title } = entry;
    if (typeof id !== 'string' || id.trim() === '') {
      throw new TypeError(`Program concept entry ${index + 1} requires a stable id.`);
    }
    if (ids.has(id)) {
      throw new TypeError(`Program concept entry id ${id} is duplicated.`);
    }
    ids.add(id);

    if (typeof category !== 'string' || !(category in categoryLabels) || category === 'special') {
      throw new TypeError(`Program concept entry ${id} has an unsupported category.`);
    }
    if (categories.has(category)) {
      throw new TypeError(`Program concept category ${category} is duplicated.`);
    }
    categories.add(category);

    const expectedLabel = categoryLabels[category as keyof typeof categoryLabels];
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

export function resolveProgramEventListState(
  entries: readonly ProgramConceptEntry[],
  error?: unknown,
): ProgramEventListState {
  if (error) {
    return {
      kind: 'error',
      error: {
        heading: 'Programvisningen kunne ikke lastes.',
        message: 'Last siden på nytt. Denne private demoen publiserer ikke arrangementer.',
        action: { href: '/program', label: 'Last inn på nytt' },
      },
    };
  }

  if (entries.length === 0) {
    return {
      kind: 'empty',
      empty: {
        heading: 'Ingen konseptoppføringer er lagt til.',
        message: 'Denne private demoen publiserer ikke arrangementer.',
      },
    };
  }

  return {
    kind: 'ready',
    events: entries,
    filteredEmpty: {
      heading: 'Ingen konseptoppføringer i denne kategorien.',
      message: 'Velg Alle for å se de andre datonøytrale eksemplene.',
      action: {
        href: '/program?kategori=alle#filter-all',
        label: 'Vis alle',
      },
    },
  };
}

export const programConceptEntries = validateProgramConceptEntries([
  {
    id: 'concept-music',
    category: 'music',
    categoryLabel: 'Musikk',
    title: 'Musikk',
    description: 'Eksempel på en datonøytral programoppføring for musikk.',
    status: 'concept',
    demoOnly: true,
  },
  {
    id: 'concept-sport',
    category: 'sport',
    categoryLabel: 'Sport',
    title: 'Sport',
    description: 'Eksempel på en datonøytral programoppføring for sport.',
    status: 'concept',
    demoOnly: true,
  },
  {
    id: 'concept-quiz',
    category: 'quiz',
    categoryLabel: 'Quiz',
    title: 'Quiz',
    description: 'Eksempel på en datonøytral programoppføring for quiz.',
    status: 'concept',
    demoOnly: true,
  },
]);

export const programEventListState = resolveProgramEventListState(programConceptEntries);

export const programIntro = {
  title: 'Program',
  intro:
    'Datonøytrale konseptoppføringer viser hvordan programmet kan presenteres i en privat demo.',
};

export const programNotice = {
  title: 'Om denne programvisningen',
  text: 'Oppføringene er eksempler i en privat konseptdemo og er ikke publiserte arrangementer.',
};
