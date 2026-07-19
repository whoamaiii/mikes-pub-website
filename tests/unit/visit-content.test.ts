import { describe, expect, test } from 'vitest';

import {
  venueLinks,
  venueLocationLabels,
  venueMapLabels,
  venueVisitInfo,
  verifiedSiteLocation,
} from '../../src/data/site';

describe('visit content policy', () => {
  test('keeps the verified address and public contact actions centralized', () => {
    expect(verifiedSiteLocation).toEqual({
      name: 'Mike’s Pub',
      street: 'Nordre Sætrevei 2',
      postalCode: '3475',
      city: 'Sætre',
    });
    expect(venueVisitInfo.actions).toEqual([
      venueLinks.directions,
      venueLinks.phone,
      venueLinks.facebook,
    ]);
    expect(venueLinks.phone.href).toBe('tel:+4791855855');
    expect(venueLinks.phone.detail).toBe('918 55 855');
    expect(venueLinks.directions.detail).toBe(verifiedSiteLocation.street);
    expect(venueLocationLabels.inlineAddress).toBe('Nordre Sætrevei 2, 3475 Sætre');
    expect(venueMapLabels.primaryRoad).toBe(venueLocationLabels.streetName);
  });

  test('keeps the owner-approved hours placeholder free of invented schedules', () => {
    expect(venueVisitInfo.hours.verificationStatus).toBe('owner-confirmed');
    expect(venueVisitInfo.hours.value).toBe('Publiseres snart');
    expect(venueVisitInfo.hours.note).toContain('Ring puben');

    const content = JSON.stringify(venueVisitInfo);
    expect(content).not.toMatch(/\b(?:mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag)\b/i);
    expect(content).not.toMatch(/\b(?:kl\.|åpent nå|åpent i dag)\b/i);
  });

  test('marks public and owner-confirmed content separately', () => {
    expect(venueLinks.directions.verificationStatus).toBe('verified-public-source');
    expect(venueLinks.phone.verificationStatus).toBe('owner-confirmed');
    expect(venueLinks.facebook.verificationStatus).toBe('owner-confirmed');
    expect(venueLinks.facebook.detail).toBe('Siste nytt fra puben');
    expect(venueLinks.facebook.accessibleLabel).toContain('på Facebook');
  });
});
