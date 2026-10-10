import { z } from 'zod';
import type { Spot, PublicSpot } from '../models/types';

export const safeUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password &&
      ![...url.searchParams.keys()].some(key => /^(access_token|auth|authorization|token|api_key|key|signature|x-amz-credential|x-amz-signature)$/i.test(key)) &&
      !/(access_token|id_token)=/i.test(url.hash);
  } catch { return false; }
};
const text = z.string().max(20000);
const url = z.string().max(4096).refine(v => v === '' || safeUrl(v), 'Use an HTTPS URL without credentials or authentication tokens.');
const id = z.string().min(1).max(200);
const timestamp = z.iso.datetime();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
  const parsed = new Date(v + 'T00:00:00Z');
  return !Number.isNaN(+parsed) && parsed.toISOString().slice(0, 10) === v;
}, 'Use a valid calendar date.');
export const photoSchema = z.object({ url: url.refine(v => v !== '', 'A photo URL is required.'), label: z.string().max(200), kind: z.enum(['photo', 'album']) }).strict();
export const observationSchema = z.object({ commonName: z.string().trim().min(1).max(200), scientificName: text, type: z.enum(['mushroom', 'fish', 'plant', 'other']), quantity: text, notes: text, photoUrl: url }).strict();
export const visitSchema = z.object({ id, date, observations: z.array(observationSchema).max(500), notes: text, privateNotes: text, weather: text, outcome: text, photos: z.array(photoSchema).max(100), rating: z.number().int().min(1).max(5).nullable(), publish: z.boolean() }).strict();
export const spotSchema = z.object({
  id, name: z.string().trim().min(1).max(200), category: z.string().regex(/^[a-z][a-z0-9-]{0,49}$/),
  group: z.string().trim().max(100).default(''),
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
  approximate: z.boolean(), precisionKm: z.number().min(0.1).max(100),
  observations: z.array(observationSchema).max(500), tags: z.array(z.string().trim().min(1).max(100)).max(100),
  description: text, atmosphere: text, access: text, privateNotes: text, createdAt: timestamp, updatedAt: timestamp,
  visits: z.array(visitSchema).max(5000).refine(v => new Set(v.map(x => x.id)).size === v.length, 'Visit IDs must be unique.'),
  photos: z.array(photoSchema).max(100), coverUrl: url, publish: z.boolean(), favorite: z.boolean(), sourceUrl: url,
}).strict();
export const backupSchema = z.object({ schemaVersion: z.literal(1), kind: z.literal('backup'), exportedAt: timestamp,
  spots: z.array(spotSchema).max(10000).refine(v => new Set(v.map(x => x.id)).size === v.length, 'Spot IDs must be unique.'),
}).strict();
export const publicSpotSchema = spotSchema.omit({ privateNotes: true, publish: true, favorite: true, sourceUrl: true, visits: true }).extend({ visits: z.array(visitSchema.omit({ privateNotes: true, publish: true })).max(5000) }).strict();
export const publicSchema = z.object({ schemaVersion: z.literal(1), kind: z.literal('public'), exportedAt: timestamp, spots: z.array(publicSpotSchema).max(10000).refine(v => new Set(v.map(x => x.id)).size === v.length, 'Spot IDs must be unique.') }).strict();
export const validateSpot = (value: unknown): Spot => spotSchema.parse(value);
export const fromPublic = (spot: PublicSpot): Spot => ({ ...spot, privateNotes: '', favorite: false, publish: false, sourceUrl: '', visits: spot.visits.map(v => ({ ...v, privateNotes: '', publish: false })) });
export function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues.slice(0, 4).map(i => `${i.path.join('.') || 'File'}: ${i.message}`).join(' ');
  return error instanceof Error ? error.message : 'Something went wrong. Your saved data has not been replaced.';
}
