import 'fake-indexeddb/auto';
import { it, expect } from 'vitest';
import { IndexedDbRepository } from '../../src/storage/repository';
import { newSpot } from '../../src/models/types';
it('persists between repository instances and rejects an invalid replacement without losing data', async () => {
  const name = crypto.randomUUID(); const repo = new IndexedDbRepository(name);
  expect(await repo.load()).toEqual([]);
  const spot = { ...newSpot(), name: 'Fictional pond' };
  await repo.replace([spot]);
  expect(await new IndexedDbRepository(name).load()).toEqual([spot]);
  await expect(repo.replace([{ ...spot, latitude: 123 }])).rejects.toThrow();
  expect(await repo.load()).toEqual([spot]);
  await repo.replace([]); expect(await repo.load()).toEqual([]);
});
