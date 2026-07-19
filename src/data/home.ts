import exteriorDesktop from '../assets/images/mikes-pub-exterior-desktop.webp';
import exteriorMobile from '../assets/images/mikes-pub-exterior-mobile.webp';
import type { HomeHeroContent, HomeProgramItems, HomePromoContent } from '../types/home';
import { venueLocationLabels } from './site';

export const homeHero: HomeHeroContent = {
  title: 'Mike’s Pub',
  eyebrow: venueLocationLabels.eyebrow,
  intro: 'Musikk og kultur i Sætre – med fotball, dart og shuffleboard i lokalet.',
  location: venueLocationLabels.inlineAddress,
  action: { href: '#program', label: 'Se hva du finner hos oss' },
  image: {
    desktop: exteriorDesktop,
    mobile: exteriorMobile,
    alt: 'Den svarte fasaden til Mike’s Pub med belyst skilt og grønn inngang i Sætre.',
    focalPoint: {
      desktop: '50% 50%',
      mobile: '90% 50%',
    },
    rightsStatus: 'production-cleared',
  },
};

export const homeProgramItems = [
  {
    id: 'music',
    label: 'Musikk og kultur',
    description: 'Konserter og kulturkvelder på scenen.',
    icon: 'music',
  },
  {
    id: 'sport',
    label: 'Fotball på skjerm',
    description: 'Utvalgte fotballkamper med lyd på storskjerm.',
    icon: 'sport',
  },
] as const satisfies HomeProgramItems;

export const sportPromo: HomePromoContent = {
  kicker: 'På skjerm',
  heading: 'Sport på storskjerm',
  text: 'Sett deg til rette for fotball på storskjerm, med lyd i lokalet.',
};
