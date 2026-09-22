import type { ImageMetadata } from 'astro';

import type { LinkTarget, RightsStatus } from './design-system';

export type HomeHeroImage = {
  desktop: ImageMetadata;
  mobile: ImageMetadata;
  alt: string;
  focalPoint: {
    desktop: `${number}% ${number}%`;
    mobile: `${number}% ${number}%`;
  };
  rightsStatus: RightsStatus;
};

export type HomeHeroContent = {
  title: string;
  eyebrow: string;
  intro: string;
  action: LinkTarget;
  image: HomeHeroImage;
};

export type HomeProgramItem = {
  id: 'music' | 'sport' | 'quiz' | 'standup' | 'games';
  label: string;
  description: string;
};

export type HomeProgramItems =
  | readonly [HomeProgramItem]
  | readonly [HomeProgramItem, HomeProgramItem]
  | readonly [HomeProgramItem, HomeProgramItem, HomeProgramItem]
  | readonly [HomeProgramItem, HomeProgramItem, HomeProgramItem, HomeProgramItem];

export type HomeVenueGalleryItem = {
  id: 'quiz-night' | 'interior' | 'screen-night';
  image: ImageMetadata;
  alt: string;
  caption: string;
  source: LinkTarget;
  rightsStatus: Extract<RightsStatus, 'demo-cleared'>;
};

export type HomeVenueGalleryContent = {
  heading: string;
  intro: string;
  items: readonly [HomeVenueGalleryItem, HomeVenueGalleryItem, HomeVenueGalleryItem];
};
