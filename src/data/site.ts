import type { NavigationItem, VenueLocation } from '../types/design-system';
import type { HomePromoContent } from '../types/home';

export const siteNavigation: NavigationItem[] = [
  { id: 'program', href: '/program', label: 'Program' },
  { id: 'sport', href: '/#sport', label: 'Sport' },
  { id: 'venue', href: '/#games', label: 'På Mike’s' },
  { id: 'location', href: '/#location', label: 'Finn oss' },
];

export const gamesPromo: HomePromoContent = {
  heading: 'Dart og shuffleboard',
  text: 'Innhold avventer bekreftelse.',
};

export const verifiedSiteLocation: VenueLocation = {
  name: 'Mike’s Pub',
  street: 'Nordre Sætrevei 2',
  postalCode: '3475',
  city: 'Sætre',
};
