import { expect, it } from 'vitest';
import published from '../../public/data/spots.json';
import { publicSchema, fromPublic } from '../../src/validation/schema';
import { backup } from '../../src/import-export/datasets';
it('ships a valid public dataset with restorable copies', () => {
  // Published owner data does not need the starter dataset's fictional-demo tag.
  // The strict public schema still rejects private fields and invalid records.
  const data = publicSchema.parse(published);
  expect(() => backup(data.spots.map(fromPublic))).not.toThrow();
});
