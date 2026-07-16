import type { NavigationItem, VenueLocation } from '../types/design-system';
import type { HomePromoContent } from '../types/home';
import type { VisitInfo } from '../types/visit';

export const siteNavigation: NavigationItem[] = [
  { id: 'program', href: '/program', label: 'Program' },
  { id: 'venue', href: '/#about', label: 'Om puben' },
  { id: 'location', href: '/#location', label: 'Besøk' },
];

export const gamesPromo: HomePromoContent = {
  kicker: 'I lokalet',
  heading: 'Dart og shuffleboard',
  text: 'Dart og shuffleboard står oppført som aktiviteter hos Mike’s Pub.',
};

export const verifiedSiteLocation: VenueLocation = {
  name: 'Mike’s Pub',
  street: 'Nordre Sætrevei 2',
  postalCode: '3475',
  city: 'Sætre',
};

export const venueLinks = {
  directions: {
    kind: 'directions',
    href: 'https://www.google.com/maps/search/?api=1&query=Mike%27s%20Pub%2C%20Nordre%20S%C3%A6trevei%202%2C%203475%20S%C3%A6tre',
    label: 'Veibeskrivelse',
    detail: 'Nordre Sætrevei 2',
    accessibleLabel: 'Åpne veibeskrivelse til Mike’s Pub i Google Maps',
    external: true,
    verificationStatus: 'verified-public-source',
  },
  phone: {
    kind: 'phone',
    href: 'tel:+4791855855',
    label: 'Ring puben',
    detail: '918 55 855',
    accessibleLabel: 'Ring Mike’s Pub på 918 55 855',
    verificationStatus: 'verified-public-source',
  },
  facebook: {
    kind: 'social',
    href: 'https://www.facebook.com/mikespub.saetre/',
    label: 'Facebook',
    detail: 'Siste nytt fra puben',
    accessibleLabel: 'Se siste nytt fra Mike’s Pub på Facebook',
    external: true,
    verificationStatus: 'awaiting-owner-confirmation',
  },
} as const;

export const venueVisitInfo: VisitInfo = {
  heading: 'Før du drar',
  intro: 'Adresse, kontakt og siste oppdatering samlet på ett sted.',
  hours: {
    label: 'Åpningstider',
    value: 'Ikke bekreftet',
    note: 'Se Facebook for siste oppdatering.',
    verificationStatus: 'awaiting-owner-confirmation',
  },
  actions: [venueLinks.directions, venueLinks.phone, venueLinks.facebook],
};

export const siteFooterNavigation: NavigationItem[] = [
  { id: 'program', href: '/program', label: 'Program' },
  {
    id: 'directions',
    href: venueLinks.directions.href,
    label: 'Veibeskrivelse',
    accessibleLabel: venueLinks.directions.accessibleLabel,
    external: true,
  },
  {
    id: 'facebook',
    href: venueLinks.facebook.href,
    label: 'Facebook',
    accessibleLabel: venueLinks.facebook.accessibleLabel,
    external: true,
  },
];
