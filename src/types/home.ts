import type { ImageMetadata } from 'astro';

import type { IconName, LinkTarget, RightsStatus } from './design-system';

export type HomeHeroImage = {
  desktop: ImageMetadata;
  mobile: ImageMetadata;
  alt: string;
  focalPoint: `${number}% ${number}%`;
  rightsStatus: RightsStatus;
};

export type HomeHeroContent = {
  title: string;
  intro: string;
  action: LinkTarget;
  image: HomeHeroImage;
};

export type HomeProgramItem = {
  id: 'music' | 'sport' | 'quiz' | 'standup';
  label: string;
  icon: Extract<IconName, 'music' | 'sport' | 'quiz' | 'standup'>;
};

export type HomeProgramItems =
  | readonly [HomeProgramItem]
  | readonly [HomeProgramItem, HomeProgramItem]
  | readonly [HomeProgramItem, HomeProgramItem, HomeProgramItem]
  | readonly [HomeProgramItem, HomeProgramItem, HomeProgramItem, HomeProgramItem];

export type HomePromoContent = {
  heading: string;
  text: string;
  action?: LinkTarget;
};
