import { describe, expect, test } from 'vitest';

import {
  programCategories,
  programConceptEntries,
  programFilterDefinitions,
  resolveProgramEventListState,
  validateProgramConceptEntries,
} from '../../src/data/program';

const validEntry = {
  id: 'concept-test',
  category: 'music',
  categoryLabel: 'Musikk',
  title: 'Musikk',
  description: 'Datonøytral konseptoppføring for validering.',
  status: 'concept',
  demoOnly: true,
} as const;

describe('WHO-20 Program content policy', () => {
  test('publishes no placeholder event records before facts are verified', () => {
    expect(programConceptEntries).toEqual([]);
    expect(resolveProgramEventListState(programConceptEntries).kind).toBe('empty');
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
      validateProgramConceptEntries(Array.from({ length: 5 }, () => validEntry)),
    ).toThrow(/at most four/i);
    expect(() => validateProgramConceptEntries([validEntry, validEntry])).toThrow(/duplicated/i);
    expect(() => validateProgramConceptEntries([{ ...validEntry, category: 'special' }])).toThrow(
      /unsupported category/i,
    );
    expect(() => validateProgramConceptEntries([{ ...validEntry, status: 'scheduled' }])).toThrow(
      /demo-only concept/i,
    );

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
      expect(() => validateProgramConceptEntries([{ ...validEntry, [field]: 'blocked' }])).toThrow(
        new RegExp(`forbidden field ${field}`),
      );
    }
  });

  test('supports ready, full-empty and error composition without production switches', () => {
    const ready = resolveProgramEventListState([validEntry]);
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
      programConceptEntries,
      state: resolveProgramEventListState(programConceptEntries),
    });
    expect(content).toContain('Ingen bekreftede arrangementer');
    expect(content).not.toMatch(/konseptoppføring|demoOnly/i);
    expect(content).not.toMatch(/\b(?:kl\.|kr|billett|hver fredag|åpningstid)\b/i);
  });
});
