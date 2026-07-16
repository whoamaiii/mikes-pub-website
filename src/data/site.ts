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
  text: 'Dart og shuffleboard står oppført som aktiviteter hos Mike’s Pub.',
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
    label: 'Facebook-oppføring',
    detail: 'Ikke bekreftet av eier',
    accessibleLabel: `Åpne en offentlig Facebook-oppføring for ${verifiedSiteLocation.name}. Siden er ikke bekreftet av eier`,
    external: true,
    verificationStatus: 'awaiting-owner-confirmation',
  },
} as const;

export const venueVisitInfo: VisitInfo = {
  heading: 'Før du drar',
  intro: 'Adresse og kontakt på ett sted. Åpningstidene er fortsatt ubekreftet.',
  hours: {
    label: 'Åpningstider',
    value: 'Ikke bekreftet',
    note: 'Ring puben for å bekrefte før du drar.',
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
    label: 'Facebook-oppføring',
    accessibleLabel: venueLinks.facebook.accessibleLabel,
    external: true,
  },
];
