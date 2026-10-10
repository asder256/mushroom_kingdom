import type { Spot } from './types';
export type Filters = { search: string; category: string; group: string; species: string; tag: string; from: string; to: string };
export const emptyFilters: Filters = { search: '', category: '', group: '', species: '', tag: '', from: '', to: '' };
export const speciesNames = (s: Spot) => [...s.observations, ...s.visits.flatMap(v => v.observations)].map(o => o.commonName);
export function filterSpots(spots: Spot[], f: Filters) {
  return spots.filter(s => {
    const names = speciesNames(s);
    return (!f.category || s.category === f.category) && (!f.group || s.group === f.group) && (!f.species || names.includes(f.species)) && (!f.tag || s.tags.includes(f.tag)) &&
      (!f.search || [s.name, s.group, s.description, ...s.tags, ...names].join(' ').toLowerCase().includes(f.search.toLowerCase())) &&
      ((!f.from && !f.to) || s.visits.some(v => (!f.from || v.date >= f.from) && (!f.to || v.date <= f.to)));
  });
}
