import { describe, expect, test } from 'vitest';

import {
  programCategories,
  programConceptEntries,
  programFilterDefinitions,
  programNotice,
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
  test('contains exactly the approved three date-neutral concept categories', () => {
    expect(programConceptEntries).toHaveLength(3);
    expect(programConceptEntries.map(({ category }) => category)).toEqual([
      'music',
      'sport',
      'quiz',
    ]);
    expect(programConceptEntries.some(({ category }) => category === 'standup')).toBe(false);

    for (const entry of programConceptEntries) {
      expect(entry.status).toBe('concept');
      expect(entry.demoOnly).toBe(true);
      expect(entry).not.toHaveProperty('dateTime');
      expect(entry).not.toHaveProperty('dateLabel');
      expect(entry).not.toHaveProperty('action');
      expect(entry).not.toHaveProperty('image');
    }
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
    const ready = resolveProgramEventListState(programConceptEntries);
    const empty = resolveProgramEventListState([]);
    const error = resolveProgramEventListState([], new Error('synthetic test failure'));

    expect(ready.kind).toBe('ready');
    expect(ready).toHaveProperty('filteredEmpty.action.href', '/program?kategori=alle#filter-all');
    expect(empty.kind).toBe('empty');
    expect(empty).toHaveProperty('empty.heading');
    expect(error.kind).toBe('error');
    expect(error).toHaveProperty('error.action.href', '/program');
  });

  test('uses neutral demo wording without temporal or publication claims', () => {
    const content = JSON.stringify({ programConceptEntries, programNotice });
    expect(content).toContain('privat konseptdemo');
    expect(content).not.toMatch(/\b(?:kl\.|kr|billett|hver fredag|åpningstid)\b/i);
  });
});
