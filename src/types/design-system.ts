export type RightsStatus = 'demo-cleared' | 'production-cleared';

export type LinkTarget = {
  href: string;
  label: string;
  accessibleLabel?: string;
  external?: boolean;
};

export type NavigationItem = LinkTarget & {
  id: string;
};

export type ClearedImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  decorative?: boolean;
  rightsStatus: RightsStatus;
};

export type EventCategory = 'music' | 'sport' | 'quiz' | 'standup' | 'special';

type EventRowBase = {
  id: string;
  category: EventCategory;
  categoryLabel: string;
  title: string;
  description?: string;
  action?: LinkTarget;
  image?: ClearedImageAsset;
};

export type ConceptEventRow = EventRowBase & {
  status: 'concept';
  dateTime?: never;
  dateLabel?: never;
};

type TimedEventRow = EventRowBase & {
  dateTime: string;
  dateLabel: string;
};

export type ScheduledEventRow = TimedEventRow & {
  status: 'scheduled';
};

export type CancelledEventRow = TimedEventRow & {
  status: 'cancelled';
};

export type ExpiredEventRow = TimedEventRow & {
  status: 'expired';
};

type PostponedWithoutReplacement = EventRowBase & {
  status: 'postponed';
  previousDateTime: string;
  previousDateLabel: string;
  replacementDateTime?: never;
  replacementDateLabel?: never;
};

type PostponedWithReplacement = EventRowBase & {
  status: 'postponed';
  previousDateTime: string;
  previousDateLabel: string;
  replacementDateTime: string;
  replacementDateLabel: string;
};

export type PostponedEventRow = PostponedWithoutReplacement | PostponedWithReplacement;

export type EventRowData =
  ConceptEventRow | ScheduledEventRow | PostponedEventRow | CancelledEventRow | ExpiredEventRow;

export type CategoryFilterItem = {
  value: 'all' | EventCategory;
  label: string;
  href: string;
};

export type VenueLocation = {
  name: string;
  street: string;
  postalCode: string;
  city: string;
};

export type NoticeVariant = 'info' | 'warning' | 'error' | 'success';

export type IconName =
  | 'arrow-right'
  | 'menu'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'calendar'
  | 'clock'
  | 'music'
  | 'sport'
  | 'quiz'
  | 'standup'
  | 'location';
