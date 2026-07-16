import { describe, expect, test } from 'vitest';

import { venueLinks, venueVisitInfo, verifiedSiteLocation } from '../../src/data/site';

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
  });

  test('keeps unconfirmed hours honest and free of invented schedules', () => {
    expect(venueVisitInfo.hours.verificationStatus).toBe('awaiting-owner-confirmation');
    expect(venueVisitInfo.hours.value).toBe('Ikke bekreftet');
    expect(venueVisitInfo.hours.note).toContain('Facebook');

    const content = JSON.stringify(venueVisitInfo);
    expect(content).not.toMatch(/\b(?:mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag)\b/i);
    expect(content).not.toMatch(/\b(?:kl\.|åpent nå|åpent i dag)\b/i);
  });

  test('marks public and owner-confirmation status separately', () => {
    expect(venueLinks.directions.verificationStatus).toBe('verified-public-source');
    expect(venueLinks.phone.verificationStatus).toBe('verified-public-source');
    expect(venueLinks.facebook.verificationStatus).toBe('awaiting-owner-confirmation');
  });
});
