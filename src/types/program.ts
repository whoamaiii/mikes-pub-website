import type { ConceptEventRow, EventCategory, EventRowData, LinkTarget } from './design-system';

export type ProgramFilterValue = 'all' | Exclude<EventCategory, 'special'>;

type PublishedProgramEntry<T extends EventRowData> = T extends ConceptEventRow
  ? never
  : Omit<T, 'category'> & {
      category: Exclude<ProgramFilterValue, 'all'>;
    };

export type ProgramPublishedEntry = PublishedProgramEntry<EventRowData>;

export type ProgramConceptEntry = Omit<
  ConceptEventRow,
  'action' | 'category' | 'categoryLabel' | 'description' | 'image'
> & {
  category: Exclude<ProgramFilterValue, 'all'>;
  categoryLabel: string;
  description: string;
  demoOnly: true;
  action?: never;
  image?: never;
};

export type ProgramEventFeedback = {
  heading: string;
  message: string;
  action?: LinkTarget;
};

export type ProgramEventListState =
  | {
      kind: 'ready';
      events: readonly EventRowData[];
      filteredEmpty: ProgramEventFeedback;
    }
  | {
      kind: 'empty';
      empty: ProgramEventFeedback;
    }
  | {
      kind: 'error';
      error: ProgramEventFeedback;
    };

export type ProgramPublishedEventListState =
  | {
      kind: 'ready';
      events: readonly ProgramPublishedEntry[];
      filteredEmpty: ProgramEventFeedback;
    }
  | Exclude<ProgramEventListState, { kind: 'ready' }>;

export type ProgramFilterDefinition = {
  value: ProgramFilterValue;
  label: string;
  query: string;
  targetId: `filter-${string}`;
  summary: string;
};
