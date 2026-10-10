import Papa from 'papaparse';
import { newSpot, newObservation, type Spot, type Observation } from '../models/types';
import { commonSpecies, speciesAliases } from '../models/species';
import { safeUrl, validateSpot } from '../validation/schema';

export type GoogleRow = { id: string; name: string; notes: string; url: string; latitude: string; longitude: string; include: boolean; tags: string[] };
export function coordinatesFromUrl(value: string): [string, string] | null {
  try {
    const url = new URL(value);
    // @lat,lng describes the camera, not necessarily the saved place. Never use it.
    const place = decodeURIComponent(url.pathname + url.search).match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    const query = (url.searchParams.get('q') ?? url.searchParams.get('query') ?? '').match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    const search = decodeURIComponent(url.pathname).match(/^\/maps\/search\/\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\/?$/);
    const result = place ?? query ?? search;
    if (result && Math.abs(Number(result[1])) <= 90 && Math.abs(Number(result[2])) <= 180) return [result[1], result[2]];
  } catch { /* Missing coordinates are resolved by the owner in the preview. */ }
  return null;
}
export function parseGoogleCsv(text: string): GoogleRow[] {
  if (text.length > 20_000_000) throw new Error('File exceeds the 20 MB limit.');
  const aliases: Record<string, string> = { namn: 'title', anteckning: 'note', webbadress: 'url', taggar: 'tags', kommentar: 'comment' };
  const parsed = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ''), { header: true, skipEmptyLines: 'greedy', transformHeader: h => aliases[h.trim().toLowerCase()] ?? h.trim().toLowerCase() });
  if (parsed.errors.length) throw new Error(`CSV could not be read: ${parsed.errors[0].message}`);
  const fields = parsed.meta.fields ?? [];
  if (!fields.some(f => ['title', 'name'].includes(f)) || !fields.some(f => ['url', 'google maps url'].includes(f))) throw new Error('Expected a Saved-list CSV with Title (or Name) and URL columns. Export Saved from Google Takeout.');
  if (parsed.data.length > 10000) throw new Error('Import at most 10,000 places at once.');
  if (!parsed.data.length) throw new Error('This CSV contains no places.');
  return parsed.data.map(row => {
    const url = (row.url ?? row['google maps url'] ?? '').trim();
    if (url && !safeUrl(url)) throw new Error('A source link is not a safe HTTPS URL. Check the CSV before importing.');
    const coords = coordinatesFromUrl(url);
    return { id: crypto.randomUUID(), name: (row.title ?? row.name ?? '').trim(), notes: [row.note, row.notes, row.comment].filter(Boolean).join('\n'), url, latitude: coords?.[0] ?? '', longitude: coords?.[1] ?? '', include: true, tags: (row.tags ?? '').split(',').map(t => t.trim()).filter(Boolean) };
  });
}
export function speciesFromNotes(notes: string, category: string): Observation[] {
  const type = category === 'fishing' ? 'fish' : category === 'mushroom' ? 'mushroom' : null;
  if (!type) return [];
  const normalize = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase('sv-SE').replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
  const lookup = new Map(commonSpecies[type].flatMap(species =>
    [species.name, species.swedish, ...(speciesAliases[species.name] ?? [])].map(name => [normalize(name), species.name] as const)));
  // Complete list items only: a mention such as "no chanterelles" is not an observation.
  const names = notes.split(/[,;\n\r/+&]|\s+(?:and|och)\s+/i).map(normalize).map(item => lookup.get(item)).filter((name): name is string => Boolean(name));
  return [...new Set(names)].map(commonName => ({ ...newObservation(), commonName, type }));
}
export function googleRowsToSpots(rows: GoogleRow[], category: string, listTag: string, detectSpecies = true): Spot[] {
  return rows.filter(r => r.include).map(r => {
    if (!r.latitude.trim() || !r.longitude.trim()) throw new Error(`Choose coordinates for “${r.name}” or uncheck that row.`);
    return validateSpot({ ...newSpot(Number(r.latitude), Number(r.longitude)), id: r.id, name: r.name, category, observations: detectSpecies ? speciesFromNotes(r.notes, category) : [], privateNotes: r.notes, sourceUrl: r.url, tags: [...new Set([...r.tags, ...(listTag.trim() ? [listTag.trim()] : [])])] });
  });
}
export function rowNeedsReview(row: GoogleRow): boolean {
  return !row.name.trim() || !row.latitude.trim() || !row.longitude.trim() ||
    !Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude)) ||
    Math.abs(Number(row.latitude)) > 90 || Math.abs(Number(row.longitude)) > 180;
}
export function mergeGoogle(existing: Spot[], incoming: Spot[]): { spots: Spot[]; skipped: number } {
  const result = [...existing]; let skipped = 0;
  for (const spot of incoming) {
    if (result.some(s => (spot.sourceUrl && s.sourceUrl === spot.sourceUrl) || (s.name === spot.name && s.latitude === spot.latitude && s.longitude === spot.longitude))) skipped++;
    else result.push(spot);
  }
  return { spots: result, skipped };
}
