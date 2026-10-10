import { useState } from 'react';
import type { Spot } from '../models/types';
import { Field, TextField } from '../components/Fields';
import { ObservationsEditor, PhotosEditor, VisitsEditor } from './Collections';
import { validateSpot, errorMessage } from '../validation/schema';
import { JournalMap } from '../map/JournalMap';

export function SpotEditor({ spot, onSave, onCancel, groups = [] }: { spot: Spot; onSave: (spot: Spot) => Promise<void>; onCancel: () => void; groups?: string[] }) {
  const [draft, setDraft] = useState(spot);
  const [latitude, setLatitude] = useState(String(spot.latitude)); const [longitude, setLongitude] = useState(String(spot.longitude));
  const [tags, setTags] = useState(spot.tags.join(', ')); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const update = (patch: Partial<Spot>) => setDraft(d => ({ ...d, ...patch }));
  const speciesType = draft.category === 'fishing' ? 'fish' : 'mushroom';
  function locate() {
    if (!navigator.geolocation) { setError('Your browser does not support device location. Enter coordinates or choose on the map.'); return; }
    navigator.geolocation.getCurrentPosition(p => { setLatitude(String(p.coords.latitude)); setLongitude(String(p.coords.longitude)); setError(`Location selected. Device-reported accuracy: ${Math.round(p.coords.accuracy)} metres. Review before saving.`); }, () => setError('Location was unavailable or permission was denied. Choose a location on the map or enter coordinates.'), { enableHighAccuracy: true, timeout: 15000 });
  }
  return <section className="page narrow"><p className="eyebrow">MY LOCAL JOURNAL</p><h1>{spot.name ? 'Edit this place' : 'A new place to remember'}</h1><p>Only this browser changes when you save. Fields below are public when you include the spot in an export, except fields labeled private.</p>
    <form onSubmit={async e => { e.preventDefault(); setBusy(true); setError(''); try {
      if (!latitude.trim() || !longitude.trim()) throw new Error('Latitude and longitude are required.');
      const valid = validateSpot({ ...draft, latitude: Number(latitude), longitude: Number(longitude), tags: tags.split(',').map(t => t.trim()).filter(Boolean), updatedAt: new Date().toISOString() });
      await onSave(valid);
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } }}>
      <div className="form-grid"><TextField label="Spot name" value={draft.name} onChange={name => update({ name })} required />
      <Field label="Category">{id => <select id={id} value={draft.category} onChange={e => update({ category: e.target.value })}>{[...new Set(['mushroom', 'fishing', draft.category])].map(c => <option key={c}>{c}</option>)}</select>}</Field></div>
      <Field label="Spot group">{id => <><input id={id} list={`${id}-groups`} value={draft.group} onChange={e => update({ group: e.target.value })} placeholder="For example: Hågadalen" aria-describedby={`${id}-hint`} /><datalist id={`${id}-groups`}>{[...new Set(groups)].sort().map(g => <option key={g} value={g} />)}</datalist><small id={`${id}-hint`}>Choose an existing group or type a new name. Use the same name on spots you want to keep together. Leave blank for ungrouped spots.</small></>}</Field>
      <fieldset><legend>Location</legend><div className="form-grid"><TextField label="Latitude" value={latitude} onChange={setLatitude} required /><TextField label="Longitude" value={longitude} onChange={setLongitude} required /></div>
      <div className="actions"><button type="button" className="secondary" onClick={() => setShowMap(!showMap)}>{showMap ? 'Hide map' : 'Choose on map'}</button><button type="button" className="secondary" onClick={locate}>Use my location</button></div>
      {showMap && <JournalMap spots={[]} onSelect={() => {}} picking onPick={(lat, lng) => { setLatitude(lat.toFixed(6)); setLongitude(lng.toFixed(6)); setShowMap(false); }} />}
      <label className="check"><input type="checkbox" checked={draft.approximate} onChange={e => update({ approximate: e.target.checked })} />Approximate coordinates in public export</label>
      {draft.approximate && <Field label="Approximation grid (km)">{id => <input id={id} type="number" min="0.1" max="100" step="0.1" value={draft.precisionKm} onChange={e => update({ precisionKm: Number(e.target.value) })} />}</Field>}
      <small>Exact coordinates are the default. Approximation changes exported coordinates only and does not guarantee privacy.</small></fieldset>
      <TextField label="Tags (comma separated)" value={tags} onChange={setTags} placeholder={draft.category === 'fishing' ? 'lake, shoreline, evening, easy-access' : 'birch, mossy, autumn, quiet'} hint="Example tags are suggestions; only the tags you enter will be saved." />
      <TextField label="Description" value={draft.description} onChange={description => update({ description })} multiline placeholder={draft.category === 'fishing' ? 'A sheltered bend with reeds along the bank and a clear view across the lake.' : 'A small mossy clearing among birches, just beyond a winding woodland path.'} hint="Describe the place and what makes it worth returning to. The example stays empty unless you write your own text." />
      <TextField label="Appearance & atmosphere" value={draft.atmosphere} onChange={atmosphere => update({ atmosphere })} multiline placeholder={draft.category === 'fishing' ? 'Still water in the evening, soft light on the reeds, and a breeze from the west.' : 'Soft moss underfoot, light through silver trunks, and the smell of damp leaves after rain.'} hint="Try describing the light, sounds, vegetation, ground, mood, or changes between seasons." />
      <TextField label="Access & terrain" value={draft.access} onChange={access => update({ access })} multiline />
      <TextField label="Private notes (never in public export)" value={draft.privateNotes} onChange={privateNotes => update({ privateNotes })} multiline />
      <ObservationsEditor value={draft.observations} onChange={observations => update({ observations })} defaultType={speciesType} />
      <PhotosEditor value={draft.photos} onChange={photos => update({ photos })} />
      <TextField label="Optional cover-photo URL (opens externally)" value={draft.coverUrl} onChange={coverUrl => update({ coverUrl })} type="url" />
      <VisitsEditor value={draft.visits} onChange={visits => update({ visits })} defaultType={speciesType} />
      <label className="check"><input type="checkbox" checked={draft.favorite} onChange={e => update({ favorite: e.target.checked })} />Favorite (local only)</label>
      <label className="check"><input type="checkbox" checked={draft.publish} onChange={e => update({ publish: e.target.checked })} />Include this spot in public export</label>
      {error && <p className="notice" role="alert">{error}</p>}
      <div className="actions sticky-actions"><button disabled={busy} type="submit">{busy ? 'Saving…' : 'Save spot locally'}</button><button type="button" className="secondary" onClick={() => { if (confirm('Discard unsaved form changes?')) onCancel(); }}>Cancel</button></div>
    </form>
  </section>;
}
