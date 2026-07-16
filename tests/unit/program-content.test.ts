import { describe, expect, test } from 'vitest';

import {
  programCategories,
  programFilterDefinitions,
  publishedProgramEntries,
  resolveProgramEventListState,
  validateProgramConceptEntries,
  validatePublishedProgramEntries,
} from '../../src/data/program';

const validConceptEntry = {
  id: 'concept-test',
  category: 'music',
  categoryLabel: 'Musikk',
  title: 'Musikk',
  description: 'Datonøytral konseptoppføring for validering.',
  status: 'concept',
  demoOnly: true,
} as const;

const validPublishedEntry = {
  id: 'published-test',
  category: 'music',
  categoryLabel: 'Musikk',
  title: 'Publiserbar testoppføring',
  description: 'Isolert testdata, ikke et virkelig arrangement.',
  status: 'scheduled',
  dateTime: '2000-01-01T12:00:00+01:00',
  dateLabel: 'Eksempeltid: ikke fakta',
} as const;

describe('WHO-20 Program content policy', () => {
  test('publishes no placeholder event records before facts are verified', () => {
    expect(publishedProgramEntries).toEqual([]);
    expect(resolveProgramEventListState(publishedProgramEntries).kind).toBe('empty');
  });

  test('keeps synchronized, shareable query and fragment filter URLs', () => {
    expect(programCategories).toHaveLength(5);
    expect(programCategories.map(({ href }) => href)).toEqual(
      programFilterDefinitions.map(
        ({ query, targetId }) => `/program?kategori=${query}#${targetId}`,
      ),
    );
  });

  test('rejects malformed, factual or over-capacity local records', () => {
    expect(() => validateProgramConceptEntries({})).toThrow(/array/i);
    expect(() =>
      validateProgramConceptEntries(Array.from({ length: 5 }, () => validConceptEntry)),
    ).toThrow(/at most four/i);
    expect(() => validateProgramConceptEntries([validConceptEntry, validConceptEntry])).toThrow(
      /duplicated/i,
    );
    expect(() =>
      validateProgramConceptEntries([{ ...validConceptEntry, category: 'special' }]),
    ).toThrow(/unsupported category/i);
    expect(() =>
      validateProgramConceptEntries([{ ...validConceptEntry, status: 'scheduled' }]),
    ).toThrow(/demo-only concept/i);

    for (const field of [
      'action',
      'dateTime',
      'image',
      'performer',
      'price',
      'recurrence',
      'team',
      'ticketUrl',
    ]) {
      expect(() =>
        validateProgramConceptEntries([{ ...validConceptEntry, [field]: 'blocked' }]),
      ).toThrow(new RegExp(`forbidden field ${field}`));
    }
  });

  test('accepts supported publishable statuses and rejects concept or malformed records', () => {
    const entries = validatePublishedProgramEntries([
      validPublishedEntry,
      {
        id: 'published-postponed',
        category: 'sport',
        categoryLabel: 'Sport',
        title: 'Publiserbar utsatt testoppføring',
        description: 'Isolert testdata, ikke et virkelig arrangement.',
        status: 'postponed',
        previousDateTime: '2000-01-01T12:00:00+01:00',
        previousDateLabel: 'Tidligere eksempeltid',
        replacementDateTime: '2000-01-02T12:00:00+01:00',
        replacementDateLabel: 'Ny eksempeltid',
      },
      { ...validPublishedEntry, id: 'published-cancelled', status: 'cancelled' },
      { ...validPublishedEntry, id: 'published-expired', status: 'expired' },
    ]);

    expect(entries.map(({ status }) => status)).toEqual([
      'scheduled',
      'postponed',
      'cancelled',
      'expired',
    ]);
    expect(
      validatePublishedProgramEntries([
        {
          ...validPublishedEntry,
          action: {
            href: 'https://tickets.example/event',
            label: 'Billetter',
            external: true,
          },
          image: {
            src: '/event.webp',
            width: 1200,
            height: 800,
            alt: 'Testbilde',
            rightsStatus: 'production-cleared',
          },
        },
      ]),
    ).toHaveLength(1);
    expect(() => validatePublishedProgramEntries([validConceptEntry])).toThrow(/concept record/i);
    expect(() =>
      validatePublishedProgramEntries([{ ...validPublishedEntry, dateTime: 'not-a-date' }]),
    ).toThrow(/valid date-time/i);
    expect(() =>
      validatePublishedProgramEntries([{ ...validPublishedEntry, dateTime: '01/01/2000' }]),
    ).toThrow(/valid date-time/i);
    expect(() =>
      validatePublishedProgramEntries([
        { ...validPublishedEntry, dateTime: '2000-02-31T12:00:00+01:00' },
      ]),
    ).toThrow(/valid date-time/i);
    expect(() =>
      validatePublishedProgramEntries([{ ...validPublishedEntry, id: 'unsafe event id' }]),
    ).toThrow(/lowercase letters, numbers and single hyphens/i);
    expect(() =>
      validatePublishedProgramEntries([
        {
          id: 'incomplete-postponed',
          category: 'sport',
          categoryLabel: 'Sport',
          title: 'Ufullstendig utsatt testoppføring',
          status: 'postponed',
          previousDateTime: '2000-01-01T12:00:00+01:00',
          previousDateLabel: 'Tidligere eksempeltid',
          replacementDateTime: '2000-01-02T12:00:00+01:00',
        },
      ]),
    ).toThrow(/both replacement date fields/i);
    expect(() =>
      validatePublishedProgramEntries([{ ...validPublishedEntry, demoOnly: true }]),
    ).toThrow(/forbidden field demoOnly/i);
    expect(() =>
      validatePublishedProgramEntries([{ ...validPublishedEntry, category: 'special' }]),
    ).toThrow(/unsupported category/i);
    expect(() =>
      validatePublishedProgramEntries([
        {
          ...validPublishedEntry,
          image: {
            src: '/event.webp',
            width: 1200,
            height: 800,
            alt: '',
            rightsStatus: 'production-cleared',
          },
        },
      ]),
    ).toThrow(/alternative text/i);
    expect(() =>
      validatePublishedProgramEntries([
        {
          ...validPublishedEntry,
          action: { href: 'javascript:alert(1)', label: 'Utrygg handling' },
        },
      ]),
    ).toThrow(/safe local path, fragment or HTTPS URL/i);
    expect(() =>
      validatePublishedProgramEntries([
        {
          ...validPublishedEntry,
          action: { href: 'https://tickets.example/event', label: 'Billetter' },
        },
      ]),
    ).toThrow(/external flag must match/i);
    expect(() =>
      validatePublishedProgramEntries([
        {
          ...validPublishedEntry,
          action: { href: '/program', label: 'Les mer', external: true },
        },
      ]),
    ).toThrow(/external flag must match/i);
    expect(() =>
      validatePublishedProgramEntries([
        {
          ...validPublishedEntry,
          image: {
            src: 'https://images.example/event.webp',
            width: 1200,
            height: 800,
            alt: 'Testbilde',
            rightsStatus: 'production-cleared',
          },
        },
      ]),
    ).toThrow(/same-origin path/i);
  });

  test('supports ready, full-empty and error composition without production switches', () => {
    const ready = resolveProgramEventListState([validPublishedEntry]);
    const empty = resolveProgramEventListState([]);
    const error = resolveProgramEventListState([], new Error('synthetic test failure'));

    expect(ready.kind).toBe('ready');
    expect(ready).toHaveProperty('filteredEmpty.action.href', '/program?kategori=alle#filter-all');
    expect(empty.kind).toBe('empty');
    expect(empty).toHaveProperty('empty.heading');
    expect(error.kind).toBe('error');
    expect(error).toHaveProperty('error.action.href', '/program');
  });

  test('uses fact-safe visitor wording without placeholder or temporal claims', () => {
    const content = JSON.stringify({
      publishedProgramEntries,
      state: resolveProgramEventListState(publishedProgramEntries),
    });
    expect(content).toContain('Ingen bekreftede arrangementer');
    expect(content).not.toMatch(/konseptoppføring|demoOnly/i);
    expect(content).not.toMatch(/\b(?:kl\.|kr|billett|hver fredag|åpningstid)\b/i);
  });
});
