import type { NavigationItem, VenueLocation } from '../types/design-system';
import type { HomePromoContent } from '../types/home';
import type { VisitInfo } from '../types/visit';

const venueStreetName = 'Nordre Sætrevei';

export const verifiedSiteLocation = {
  name: 'Mike’s Pub',
  street: `${venueStreetName} 2`,
  postalCode: '3475',
  city: 'Sætre',
} as const satisfies VenueLocation;

export const venueLocationLabels = {
  streetName: venueStreetName,
  inlineAddress: `${verifiedSiteLocation.street}, ${verifiedSiteLocation.postalCode} ${verifiedSiteLocation.city}`,
  eyebrow: `${verifiedSiteLocation.street} · ${verifiedSiteLocation.city}`,
} as const;

export const venueMapLabels = {
  primaryRoad: venueStreetName,
  secondaryRoad: 'Søndre Sætrevei',
  hillsideRoad: 'Sætrebakken',
  water: 'Sætrepollen',
} as const;

export const siteNavigation: NavigationItem[] = [
  { id: 'program', href: '/program', label: 'Program' },
  { id: 'venue', href: '/#about', label: 'Om puben' },
  { id: 'location', href: '/#location', label: 'Besøk' },
];

export const gamesPromo: HomePromoContent = {
  kicker: 'I lokalet',
  heading: 'Dart og shuffleboard',
  text: 'Dart og shuffleboard står klare i lokalet – bare å utfordre noen.',
};

const directionsQuery = encodeURIComponent(
  `${verifiedSiteLocation.name.replace('’', "'")}, ${venueLocationLabels.inlineAddress}`,
).replaceAll("'", '%27');
const directionsHref =
  'https://www.google.com/maps/search/?api=1&query=Mike%27s%20Pub%2C%20Nordre%20S%C3%A6trevei%202%2C%203475%20S%C3%A6tre';

if (directionsHref.split('query=').at(1) !== directionsQuery) {
  throw new Error('The allowlisted directions URL must match the centralized venue address.');
}

export const venueLinks = {
  directions: {
    kind: 'directions',
    href: directionsHref,
    label: 'Veibeskrivelse',
    detail: verifiedSiteLocation.street,
    accessibleLabel: `Åpne veibeskrivelse til ${verifiedSiteLocation.name} i Google Maps`,
    external: true,
    verificationStatus: 'verified-public-source',
  },
  phone: {
    kind: 'phone',
    href: 'tel:+4791855855',
    label: 'Ring puben',
    detail: '918 55 855',
    accessibleLabel: `Ring ${verifiedSiteLocation.name} på 918 55 855`,
    verificationStatus: 'verified-public-source',
  },
  facebook: {
    kind: 'social',
    href: 'https://www.facebook.com/mikespub.saetre/',
    label: 'Facebook',
    detail: 'Siste nytt fra puben',
    accessibleLabel: `Se siste nytt fra ${verifiedSiteLocation.name} på Facebook`,
    external: true,
    verificationStatus: 'awaiting-owner-confirmation',
  },
} as const;

export const venueVisitInfo: VisitInfo = {
  heading: 'Før du drar',
  intro: 'Adresse, kontakt og siste nytt samlet på ett sted.',
  hours: {
    label: 'Åpningstider',
    value: 'Publiseres snart',
    note: 'Ring puben for åpningstider.',
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
