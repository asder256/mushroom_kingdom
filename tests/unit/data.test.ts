import { describe, it, expect } from 'vitest';
import { newSpot, newVisit, newObservation } from '../../src/models/types';
import { backup, parseBackup, publicExport, approximateCoordinates } from '../../src/import-export/datasets';
import { validateSpot, safeUrl, publicSchema } from '../../src/validation/schema';
import { filterSpots, emptyFilters } from '../../src/models/filter';
const example = () => ({ ...newSpot(59.123456, 15.654321), name: 'Fictional glade' });

describe('journal validation and backup', () => {
  it('loads older backups without groups and preserves names in new backups and public exports', () => {
    const s = { ...example(), group: 'Hågadalen', publish: true };
    expect(parseBackup(JSON.stringify(backup([s]))).spots[0].group).toBe('Hågadalen');
    expect(publicExport([s]).spots[0].group).toBe('Hågadalen');
    const { group: _group, ...legacy } = s;
    expect(parseBackup(JSON.stringify({ ...backup([s]), spots: [legacy] })).spots[0].group).toBe('');
    const published = publicExport([s]);
    const { group: _publicGroup, ...legacyPublic } = published.spots[0];
    expect(publicSchema.parse({ ...published, spots: [legacyPublic] }).spots[0].group).toBe('');
  });
  it('round trips structured species, visits, and private notes', () => {
    const s = example(); s.privateNotes = 'local'; s.observations = [{ ...newObservation(), commonName: 'Example mushroom' }];
    s.visits = [{ ...newVisit(), date: '2026-10-10', privateNotes: 'visit local', observations: [{ ...newObservation(), commonName: 'Example fish', type: 'fish' }] }];
    expect(parseBackup(JSON.stringify(backup([s]))).spots).toEqual([s]);
  });
  it('rejects invalid dates, duplicate IDs, unknown fields and unsupported versions', () => {
    const s = example(); expect(() => backup([s, s])).toThrow();
    expect(() => validateSpot({ ...s, visits: [{ ...newVisit(), date: '2026-02-30' }] })).toThrow();
    expect(() => validateSpot({ ...s, secret: 'unexpected' })).toThrow();
    expect(() => parseBackup(JSON.stringify({ ...backup([s]), schemaVersion: 99 }))).toThrow();
  });
  it('rejects nonfinite and out-of-range coordinates', () => {
    for (const latitude of [NaN, Infinity, 91, -91]) expect(() => validateSpot({ ...example(), latitude })).toThrow();
  });
  it('rejects credential-bearing, executable and token URLs', () => {
    for (const url of ['javascript:alert(1)', 'http://example.com', 'https://user:pass@example.com', 'https://example.com?access_token=secret', 'https://example.com#access_token=secret']) expect(safeUrl(url)).toBe(false);
    expect(safeUrl('https://photos.app.goo.gl/fictional-album')).toBe(true);
  });
});
describe('public export', () => {
  it('excludes unpublished records and nested private fields', () => {
    const s = { ...example(), publish: true, privateNotes: 'secret', sourceUrl: 'https://example.com/private', favorite: true };
    s.visits = [{ ...newVisit(), date: '2026-10-10', publish: true, privateNotes: 'nested secret', notes: 'Public visit' }, { ...newVisit(), date: '2026-10-09', notes: 'Unpublished visit' }];
    const output = publicExport([s, example()]); const encoded = JSON.stringify(output);
    expect(output.spots).toHaveLength(1); expect(output.spots[0].visits).toHaveLength(1);
    for (const field of ['privateNotes', 'sourceUrl', 'favorite', 'publish', 'nested secret', 'Unpublished visit']) expect(encoded).not.toContain(field);
    expect(output.spots[0].latitude).toBe(s.latitude);
    expect(() => publicSchema.parse(output)).not.toThrow();
  });
  it('replaces coordinates when approximation is selected without mutating the source', () => {
    const s = { ...example(), publish: true, approximate: true, precisionKm: 2 };
    const output = publicExport([s]).spots[0];
    expect(output.latitude).not.toBe(s.latitude); expect(JSON.stringify(output)).not.toContain('59.123456');
    expect([output.latitude, output.longitude]).toEqual(approximateCoordinates(s.latitude, s.longitude, 2));
    expect(s.latitude).toBe(59.123456);
  });
});
describe('filtering', () => {
  it('filters and searches by group without changing category or species matching', () => {
    const woodland = { ...example(), group: 'Hågadalen' };
    const lake = { ...example(), id: 'fictional-lake', group: 'Lake walk', category: 'fishing' };
    expect(filterSpots([woodland, lake], { ...emptyFilters, group: 'Hågadalen' })).toEqual([woodland]);
    expect(filterSpots([woodland, lake], { ...emptyFilters, search: 'hågadalen' })).toEqual([woodland]);
    expect(filterSpots([woodland, lake], { ...emptyFilters, group: 'Hågadalen', category: 'fishing' })).toEqual([]);
  });
  it('matches visit species and inclusive visit date ranges with other filters', () => {
    const s = { ...example(), tags: ['woodland'], visits: [{ ...newVisit(), date: '2026-10-10', observations: [{ ...newObservation(), commonName: 'Chanterelle' }] }] };
    expect(filterSpots([s], { ...emptyFilters, species: 'Chanterelle', tag: 'woodland', from: '2026-10-10', to: '2026-10-10' })).toEqual([s]);
    expect(filterSpots([s], { ...emptyFilters, from: '2026-10-11' })).toEqual([]);
  });
});
