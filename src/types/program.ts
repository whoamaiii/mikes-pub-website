import type { ConceptEventRow, EventCategory, EventRowData, LinkTarget } from './design-system';

export type ProgramFilterValue = 'all' | Exclude<EventCategory, 'special'>;

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

export type ProgramFilterDefinition = {
  value: ProgramFilterValue;
  label: string;
  query: string;
  targetId: `filter-${string}`;
  summary: string;
};
