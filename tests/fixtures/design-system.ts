import type {
  CategoryFilterItem,
  EventRowData,
  NavigationItem,
  VenueLocation,
} from '../../src/types/design-system';

export const previewNavigation: NavigationItem[] = [
  { id: 'program', href: '#preview-events', label: 'Program' },
  { id: 'sport', href: '#preview-navigation', label: 'Sport' },
  { id: 'venue', href: '#preview-location', label: 'På Mike’s' },
  { id: 'gallery', href: '#preview-states', label: 'Galleri' },
  { id: 'location', href: '#preview-location', label: 'Finn oss' },
];

export const previewCategories: CategoryFilterItem[] = [
  { value: 'all', label: 'Alle', href: '?kategori=alle#preview-filters' },
  { value: 'music', label: 'Musikk', href: '?kategori=musikk#preview-filters' },
  { value: 'sport', label: 'Sport', href: '?kategori=sport#preview-filters' },
  { value: 'quiz', label: 'Quiz', href: '?kategori=quiz#preview-filters' },
  { value: 'standup', label: 'Stand-up', href: '?kategori=standup#preview-filters' },
];

const previewAction = {
  href: '#preview-action-target',
  label: 'Vis eksempel',
  accessibleLabel: 'Vis komponenteksempel',
} as const;

export const previewEvents: EventRowData[] = [
  {
    id: 'preview-concept',
    category: 'music',
    categoryLabel: 'Musikk',
    title: 'Konsepttilstand',
    description: 'Datonøytral testtekst. Dette er ikke et arrangement.',
    status: 'concept',
    action: previewAction,
  },
  {
    id: 'preview-scheduled',
    category: 'sport',
    categoryLabel: 'Sport',
    title: 'Planlagt tilstand',
    description: 'Eksplisitt ikke-faktisk testoppføring for komponentkontroll.',
    status: 'scheduled',
    dateTime: '2000-01-01T12:00:00+01:00',
    dateLabel: 'Eksempeltid – ikke fakta',
    action: previewAction,
  },
  {
    id: 'preview-postponed',
    category: 'quiz',
    categoryLabel: 'Quiz',
    title: 'Utsatt tilstand',
    status: 'postponed',
    previousDateTime: '2000-01-01T12:00:00+01:00',
    previousDateLabel: 'Tidligere eksempeltid',
    replacementDateTime: '2000-01-02T12:00:00+01:00',
    replacementDateLabel: 'Ny eksempeltid',
    action: previewAction,
  },
  {
    id: 'preview-cancelled',
    category: 'standup',
    categoryLabel: 'Stand-up',
    title: 'Avlyst tilstand',
    description: 'Tilstanden kommuniseres med tekst, ikon og struktur.',
    status: 'cancelled',
    dateTime: '2000-01-01T12:00:00+01:00',
    dateLabel: 'Eksempeltid – ikke fakta',
  },
  {
    id: 'preview-expired',
    category: 'special',
    categoryLabel: 'Annet',
    title: 'Utløpt tilstand',
    status: 'expired',
    dateTime: '2000-01-01T12:00:00+01:00',
    dateLabel: 'Eksempeltid – ikke fakta',
  },
];

export const verifiedPreviewLocation: VenueLocation = {
  name: 'Mike’s Pub',
  street: 'Nordre Sætrevei 2',
  postalCode: '3475',
  city: 'Sætre',
};
