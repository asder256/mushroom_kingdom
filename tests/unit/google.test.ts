import { it, expect } from 'vitest';
import { coordinatesFromUrl, parseGoogleCsv, googleRowsToSpots, mergeGoogle, rowNeedsReview, speciesFromNotes } from '../../src/import-export/google';
it('handles BOM, quoted commas, multiline notes and place coordinates', () => {
  const rows = parseGoogleCsv('\uFEFFTitle,Note,URL\r\n"Fictional, glade","Line one\nLine two",https://www.google.com/maps?q=59.1%2C15.2\r\n');
  expect(rows[0].name).toBe('Fictional, glade'); expect(rows[0].notes).toBe('Line one\nLine two');
  const spots = googleRowsToSpots(rows, 'mushroom', 'From Maps');
  expect(spots[0].latitude).toBe(59.1); expect(spots[0].publish).toBe(false); expect(spots[0].privateNotes).toContain('Line two');
});
it('does not mistake camera coordinates or place IDs for a location', () => {
  expect(coordinatesFromUrl('https://www.google.com/maps/@59.1,15.2,12z')).toBeNull();
  expect(coordinatesFromUrl('https://www.google.com/maps?cid=123456')).toBeNull();
  const rows = parseGoogleCsv('Title,URL\nExample,https://maps.app.goo.gl/example');
  expect(() => googleRowsToSpots(rows, 'fishing', '')).toThrow('Choose coordinates');
  expect(googleRowsToSpots(rows.map(r => ({ ...r, include: false })), 'fishing', '')).toEqual([]);
});
it('skips duplicate source links without overwriting local notes', () => {
  const rows = parseGoogleCsv('Title,URL\nExample,https://www.google.com/maps?q=59.1%2C15.2');
  const incoming = googleRowsToSpots(rows, 'mushroom', '');
  const existing = [{ ...incoming[0], privateNotes: 'Keep me' }];
  const result = mergeGoogle(existing, incoming); expect(result.skipped).toBe(1); expect(result.spots[0].privateNotes).toBe('Keep me');
});
it('rejects unsupported headers and unsafe links', () => {
  expect(() => parseGoogleCsv('Something,Else\na,b')).toThrow('Expected');
  expect(() => parseGoogleCsv('Title,URL\nExample,javascript:alert(1)')).toThrow('HTTPS');
});
it('imports Swedish Takeout headers and maps/search coordinate links', () => {
  const rows = parseGoogleCsv('Namn,Anteckning,Webbadress,Taggar,Kommentar\nFictional glade,Privat,https://www.google.com/maps/search/59.1234567%2C15.1234567,skog,Extra note');
  expect(rows[0].name).toBe('Fictional glade');
  expect(rows[0].latitude).toBe('59.1234567');
  expect(rows[0].notes).toBe('Privat\nExtra note');
  expect(rowNeedsReview(rows[0])).toBe(false);
  const spot = googleRowsToSpots(rows, 'mushroom', 'Example list')[0];
  expect(spot.tags).toEqual(['skog', 'Example list']);
  expect(spot.publish).toBe(false);
});
it('keeps place-ID rows unresolved and flags invalid manual coordinates', () => {
  const rows = parseGoogleCsv('Namn,Webbadress\nFictional cafe,https://www.google.com/maps/place/Example/data=!4m2!3m1!1s0x123:0x456');
  expect(rowNeedsReview(rows[0])).toBe(true);
  for (const latitude of ['', 'NaN', 'Infinity', '91']) expect(rowNeedsReview({ ...rows[0], latitude, longitude: '15' })).toBe(true);
  expect(rowNeedsReview({ ...rows[0], latitude: '0', longitude: '0' })).toBe(false);
  expect(coordinatesFromUrl('https://www.google.com/maps/search/91,15')).toBeNull();
});
it('detects Swedish and English species lists without duplicates', () => {
  const result = speciesFromNotes('KANTARELLER, Chanterelle; trattkantarell och Karl Johan\nSvart trumpetsvamp', 'mushroom');
  expect(result.map(o => o.commonName)).toEqual(['Chanterelle', 'Funnel chanterelle', 'Porcini', 'Black trumpet']);
  expect(result.every(o => o.type === 'mushroom')).toBe(true);
  expect(speciesFromNotes('Abborre and gäddor / zander', 'fishing').map(o => o.commonName)).toEqual(['Perch', 'Pike', 'Zander']);
});
it('preserves private notes and allows opting out of detection', () => {
  const rows = parseGoogleCsv('Namn,Anteckning,Webbadress\nFictional glade,"Kantarell, private extra text",https://www.google.com/maps?q=59.1%2C15.2');
  const spot = googleRowsToSpots(rows, 'mushroom', '')[0];
  expect(spot.privateNotes).toBe('Kantarell, private extra text');
  expect(spot.observations.map(o => o.commonName)).toEqual(['Chanterelle']);
  expect(spot.publish).toBe(false);
  expect(googleRowsToSpots(rows, 'mushroom', '', false)[0].observations).toEqual([]);
});
it('does not guess unknown species, substrings, negative prose or the wrong category', () => {
  expect(speciesFromNotes('No chanterelles; unknown mushroom; kantarellställe; perhaps a pike', 'mushroom')).toEqual([]);
  expect(speciesFromNotes('Trattkantarell', 'mushroom').map(o => o.commonName)).toEqual(['Funnel chanterelle']);
  expect(speciesFromNotes('Perch', 'mushroom')).toEqual([]);
  expect(speciesFromNotes('Kantarell', 'fishing')).toEqual([]);
});
