import type { Spot } from '../models/types';
import { backup, parseBackup } from '../import-export/datasets';

export interface JournalRepository { load(): Promise<Spot[]>; replace(spots: Spot[]): Promise<void> }
export class IndexedDbRepository implements JournalRepository {
  constructor(private name = 'mushroom-kingdom-journal-v1') {}
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('journal');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Close other journal tabs and try again.'));
    });
  }
  async load(): Promise<Spot[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('journal', 'readonly');
      const request = tx.objectStore('journal').get('current');
      tx.oncomplete = () => { db.close(); try { resolve(request.result ? parseBackup(JSON.stringify(request.result)).spots : []); } catch (e) { reject(e); } };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }
  async replace(spots: Spot[]): Promise<void> {
    const data = backup(spots); // Validate the entire replacement before opening a write transaction.
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('journal', 'readwrite');
      tx.objectStore('journal').put(data, 'current');
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onabort = tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Storage write failed. Export a backup and check available space.')); };
    });
  }
}
