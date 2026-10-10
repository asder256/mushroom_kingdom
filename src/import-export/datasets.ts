import type { Dataset, Spot, PublicDataset, Observation, Photo } from '../models/types';
import { backupSchema, publicSchema, validateSpot } from '../validation/schema';

export const backup = (spots: Spot[]): Dataset => backupSchema.parse({ schemaVersion: 1, kind: 'backup', exportedAt: new Date().toISOString(), spots });
export function parseBackup(text: string): Dataset {
  if (text.length > 20_000_000) throw new Error('File exceeds the 20 MB limit.');
  return backupSchema.parse(JSON.parse(text));
}
const photo = (p: Photo): Photo => ({ url: p.url, label: p.label, kind: p.kind });
const observation = (o: Observation): Observation => ({ commonName: o.commonName, scientificName: o.scientificName, type: o.type, quantity: o.quantity, notes: o.notes, photoUrl: o.photoUrl });
export function approximateCoordinates(latitude: number, longitude: number, km: number): [number, number] {
  const latStep = km / 111.32;
  const lat = Math.max(-90, Math.min(90, Math.round(latitude / latStep) * latStep));
  const lonStep = km / (111.32 * Math.max(0.01, Math.cos(lat * Math.PI / 180)));
  const lon = Math.max(-180, Math.min(180, Math.round(longitude / lonStep) * lonStep));
  return [Number(lat.toFixed(6)), Number(lon.toFixed(6))];
}
export function publicExport(spots: Spot[]): PublicDataset {
  return publicSchema.parse({ schemaVersion: 1, kind: 'public', exportedAt: new Date().toISOString(), spots: spots.filter(s => s.publish).map(raw => {
    const s = validateSpot(raw);
    const [latitude, longitude] = s.approximate ? approximateCoordinates(s.latitude, s.longitude, s.precisionKm) : [s.latitude, s.longitude];
    return {
      id: s.id, name: s.name, category: s.category, group: s.group, latitude, longitude, approximate: s.approximate, precisionKm: s.precisionKm,
      observations: s.observations.map(observation), tags: [...s.tags], description: s.description, atmosphere: s.atmosphere, access: s.access,
      createdAt: s.createdAt, updatedAt: s.updatedAt, photos: s.photos.map(photo), coverUrl: s.coverUrl,
      visits: s.visits.filter(v => v.publish).map(v => ({ id: v.id, date: v.date, observations: v.observations.map(observation), notes: v.notes, weather: v.weather, outcome: v.outcome, photos: v.photos.map(photo), rating: v.rating })),
    };
  }) });
}
export function downloadJson(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
