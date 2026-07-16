import exteriorDesktop from '../assets/images/mikes-pub-exterior-desktop.webp';
import exteriorMobile from '../assets/images/mikes-pub-exterior-mobile.webp';
import type { HomeHeroContent, HomeProgramItems, HomePromoContent } from '../types/home';
import { venueLocationLabels } from './site';

export const homeHero: HomeHeroContent = {
  title: 'Mike’s Pub',
  eyebrow: venueLocationLabels.eyebrow,
  intro: 'Musikk og kultur i Sætre – med fotball, dart og shuffleboard i lokalet.',
  location: venueLocationLabels.inlineAddress,
  action: { href: '#about', label: 'Oppdag Mike’s' },
  image: {
    desktop: exteriorDesktop,
    mobile: exteriorMobile,
    alt: 'Den svarte fasaden til Mike’s Pub med belyst skilt og grønn inngang i Sætre.',
    focalPoint: {
      desktop: '50% 50%',
      mobile: '90% 50%',
    },
    rightsStatus: 'demo-cleared',
  },
};

export const homeProgramItems = [
  {
    id: 'music',
    label: 'Musikk og kultur',
    description: 'Datoer publiseres når artist, tid og detaljer er bekreftet.',
    icon: 'music',
  },
  {
    id: 'sport',
    label: 'Fotball på skjerm',
    description: 'Kampoversikten legges ut når visningene er bekreftet.',
    icon: 'sport',
  },
] as const satisfies HomeProgramItems;

export const sportPromo: HomePromoContent = {
  kicker: 'På skjerm',
  heading: 'Sport på storskjerm',
  text: 'Fotballvisninger publiseres her først når kamp og tidspunkt er bekreftet.',
};
