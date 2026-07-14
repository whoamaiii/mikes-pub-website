import exteriorDesktop from '../assets/images/mikes-pub-exterior-desktop.webp';
import exteriorMobile from '../assets/images/mikes-pub-exterior-mobile.webp';
import type { HomeHeroContent, HomeProgramItems, HomePromoContent } from '../types/home';

export const homeHero: HomeHeroContent = {
  title: 'Mike’s Pub i Sætre',
  intro: 'Nordre Sætrevei 2, 3475 Sætre',
  action: { href: '#program', label: 'Se konseptet' },
  image: {
    desktop: exteriorDesktop,
    mobile: exteriorMobile,
    alt: 'Fasaden til Mike’s Pub i Sætre.',
    focalPoint: '50% 55%',
    rightsStatus: 'demo-cleared',
  },
};

export const homeProgramItems = [
  { id: 'music', label: 'Musikk', icon: 'music' },
  { id: 'sport', label: 'Sport', icon: 'sport' },
  { id: 'quiz', label: 'Quiz', icon: 'quiz' },
  { id: 'standup', label: 'Stand-up', icon: 'standup' },
] as const satisfies HomeProgramItems;

export const sportPromo: HomePromoContent = {
  heading: 'Sport på storskjerm',
  text: 'Program publiseres når informasjonen er bekreftet.',
};
