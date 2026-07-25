import facebookInterior from '../assets/images/mikes-pub-facebook-interior.webp';
import facebookQuizNight from '../assets/images/mikes-pub-facebook-quiz-night.webp';
import facebookScreenNight from '../assets/images/mikes-pub-facebook-screen-night.webp';
import exteriorDesktop from '../assets/images/mikes-pub-exterior-desktop.webp';
import exteriorMobile from '../assets/images/mikes-pub-exterior-mobile.webp';
import type {
  HomeHeroContent,
  HomeManifestoContent,
  HomeProgramItems,
  HomePromoContent,
  HomeVenueGalleryContent,
} from '../types/home';
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

export const homeManifesto: HomeManifestoContent = {
  kicker: 'På Mike’s',
  statementLead: 'Musikk og kultur.',
  statementAccent: 'Fotball, dart og shuffleboard',
  statementTail: 'i lokalet.',
  note: 'Åpnet desember 2025 – scene, storskjerm og spillbord under samme tak.',
};

export const homeVenueGallery: HomeVenueGalleryContent = {
  kicker: 'Fra lokalet',
  heading: 'Et sted folk møtes',
  items: [
    {
      id: 'quiz-night',
      image: facebookQuizNight,
      alt: 'Gjester sitter tett rundt bordene under en fullsatt pubquiz på Mike’s Pub.',
      caption: 'Fullt hus på pubquiz',
      source: {
        href: 'https://www.facebook.com/photo.php?fbid=122118484995171907',
        label: 'Se pubquizbildet på Facebook',
        external: true,
      },
      rightsStatus: 'demo-cleared',
    },
    {
      id: 'interior',
      image: facebookInterior,
      alt: 'Interiøret i Mike’s Pub med mørkt treverk, sittegrupper og storskjerm.',
      caption: 'Inne i puben',
      source: {
        href: 'https://www.facebook.com/photo.php?fbid=122113473831171907',
        label: 'Se interiørbildet på Facebook',
        external: true,
      },
      rightsStatus: 'demo-cleared',
    },
    {
      id: 'screen-night',
      image: facebookScreenNight,
      alt: 'Gjester følger med på storskjermen ved levende lys inne på Mike’s Pub.',
      caption: 'Kveld foran storskjermen',
      source: {
        href: 'https://www.facebook.com/photo.php?fbid=122125775085171907',
        label: 'Se stemningsbildet på Facebook',
        external: true,
      },
      rightsStatus: 'demo-cleared',
    },
  ],
};
