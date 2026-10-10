export type Photo = { url: string; label: string; kind: 'photo' | 'album' };
export type Observation = {
  commonName: string; scientificName: string; type: 'mushroom' | 'fish' | 'plant' | 'other';
  quantity: string; notes: string; photoUrl: string;
};
export type Visit = {
  id: string; date: string; observations: Observation[]; notes: string;
  privateNotes: string; weather: string; outcome: string; photos: Photo[];
  rating: number | null; publish: boolean;
};
export type Spot = {
  id: string; name: string; category: string; group: string; latitude: number; longitude: number;
  approximate: boolean; precisionKm: number; observations: Observation[]; tags: string[];
  description: string; atmosphere: string; access: string; privateNotes: string;
  createdAt: string; updatedAt: string; visits: Visit[]; photos: Photo[]; coverUrl: string;
  publish: boolean; favorite: boolean; sourceUrl: string;
};
export type Dataset = { schemaVersion: 1; kind: 'backup'; exportedAt: string; spots: Spot[] };
export type PublicVisit = Omit<Visit, 'privateNotes' | 'publish'>;
export type PublicSpot = Omit<Spot, 'privateNotes' | 'publish' | 'favorite' | 'sourceUrl' | 'visits'> & { visits: PublicVisit[] };
export type PublicDataset = { schemaVersion: 1; kind: 'public'; exportedAt: string; spots: PublicSpot[] };

export const newSpot = (latitude = 59.4, longitude = 15.2): Spot => ({
  id: crypto.randomUUID(), name: '', category: 'mushroom', group: '', latitude, longitude,
  approximate: false, precisionKm: 1, observations: [], tags: [], description: '',
  atmosphere: '', access: '', privateNotes: '', createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(), visits: [], photos: [], coverUrl: '',
  publish: false, favorite: false, sourceUrl: '',
});
export const newObservation = (): Observation => ({ commonName: '', scientificName: '', type: 'mushroom', quantity: '', notes: '', photoUrl: '' });
export const newVisit = (): Visit => ({ id: crypto.randomUUID(), date: new Date().toLocaleDateString('en-CA'), observations: [], notes: '', privateNotes: '', weather: '', outcome: '', photos: [], rating: null, publish: false });
