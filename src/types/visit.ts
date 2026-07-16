import type { LinkTarget } from './design-system';

export type VisitVerificationStatus = 'verified-public-source' | 'awaiting-owner-confirmation';

export type VisitAction = LinkTarget & {
  kind: 'directions' | 'phone' | 'social';
  detail: string;
  verificationStatus: VisitVerificationStatus;
};

export type VisitInfo = {
  heading: string;
  intro: string;
  hours: {
    label: string;
    value: string;
    note: string;
    verificationStatus: VisitVerificationStatus;
  };
  actions: readonly [VisitAction, VisitAction, VisitAction];
};
