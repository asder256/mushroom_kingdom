import { expect, it } from 'vitest';
import sample from '../../public/data/spots.json';
import { publicSchema, fromPublic } from '../../src/validation/schema';
import { backup } from '../../src/import-export/datasets';
it('ships a valid public dataset with fictional-only sample tags and restorable copies', () => {
  const data = publicSchema.parse(sample);
  expect(data.spots.every(s => s.tags.includes('fictional-demo'))).toBe(true);
  expect(() => backup(data.spots.map(fromPublic))).not.toThrow();
});
