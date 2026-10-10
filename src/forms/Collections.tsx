import type { Observation, Photo, Visit } from '../models/types';
import { newObservation, newVisit } from '../models/types';
import { Field, TextField } from '../components/Fields';
import { commonSpecies } from '../models/species';

export function ObservationsEditor({ value, onChange, defaultType = 'mushroom' }: { value: Observation[]; onChange: (value: Observation[]) => void; defaultType?: Observation['type'] }) {
  function update(index: number, patch: Partial<Observation>) { onChange(value.map((o, i) => i === index ? { ...o, ...patch } : o)); }
  return <fieldset><legend>Species observations</legend>{value.map((o, i) => <div className="repeat-card" key={i}><div className="form-grid">
    <Field label="Species type">{id => <select id={id} value={o.type} onChange={e => update(i, { type: e.target.value as Observation['type'] })}>{['mushroom', 'fish', 'plant', 'other'].map(t => <option key={t}>{t}</option>)}</select>}</Field>
    <Field label={`Choose a common species ${i + 1}`}>{id => <select id={id} value={commonSpecies[o.type].some(s => s.name === o.commonName) ? o.commonName : ''} onChange={e => { if (e.target.value) update(i, { commonName: e.target.value }); }}><option value="">Choose a suggestion or type below</option>{commonSpecies[o.type].map(s => <option key={s.name} value={s.name}>{s.name} · {s.swedish}</option>)}</select>}</Field>
    <TextField label={`Common name ${i + 1}`} value={o.commonName} onChange={v => update(i, { commonName: v })} required placeholder={o.type === 'fish' ? 'Perch, Abborre, or another name' : 'Chanterelle, Kantarell, or another name'} hint="Choose above or write any name here, in any language." />
    <TextField label="Scientific name" value={o.scientificName} onChange={v => update(i, { scientificName: v })} />
    <TextField label="Quantity / unit" value={o.quantity} onChange={v => update(i, { quantity: v })} />
    <TextField label="Observation notes" value={o.notes} onChange={v => update(i, { notes: v })} />
    <TextField label="Species photo URL" value={o.photoUrl} onChange={v => update(i, { photoUrl: v })} type="url" />
  </div><button type="button" className="text-button danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>Remove species {i + 1}</button></div>)}
    <button type="button" className="secondary" onClick={() => onChange([...value, { ...newObservation(), type: defaultType }])}>+ Add species</button>
  </fieldset>;
}
export function PhotosEditor({ value, onChange }: { value: Photo[]; onChange: (value: Photo[]) => void }) {
  function update(index: number, patch: Partial<Photo>) { onChange(value.map((p, i) => i === index ? { ...p, ...patch } : p)); }
  return <fieldset><legend>Photos & albums</legend><p className="muted">Paste a shared Google Photos link or an HTTPS photo URL. These open externally. Shared albums can reveal other photos and personal details.</p>{value.map((p, i) => <div className="repeat-card" key={i}><div className="form-grid">
    <TextField label={`Photo URL ${i + 1}`} value={p.url} onChange={v => update(i, { url: v })} required type="url" />
    <TextField label="Link label" value={p.label} onChange={v => update(i, { label: v })} />
    <Field label="Link type">{id => <select id={id} value={p.kind} onChange={e => update(i, { kind: e.target.value as Photo['kind'] })}><option value="photo">Photo</option><option value="album">Album</option></select>}</Field>
  </div><button type="button" className="text-button danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>Remove link {i + 1}</button></div>)}<button type="button" className="secondary" onClick={() => onChange([...value, { url: '', label: '', kind: 'album' }])}>+ Add photo link</button></fieldset>;
}
export function VisitsEditor({ value, onChange, defaultType = 'mushroom' }: { value: Visit[]; onChange: (value: Visit[]) => void; defaultType?: Observation['type'] }) {
  function update(index: number, patch: Partial<Visit>) { onChange(value.map((v, i) => i === index ? { ...v, ...patch } : v)); }
  return <fieldset><legend>Visit history</legend>{value.map((v, i) => <details className="repeat-card" key={v.id} open><summary>Visit {i + 1} · {v.date}</summary>
    <div className="form-grid"><TextField label="Visit date" type="date" value={v.date} onChange={date => update(i, { date })} required />
    <TextField label="Weather notes" value={v.weather} onChange={weather => update(i, { weather })} />
    <TextField label="Catch or find" value={v.outcome} onChange={outcome => update(i, { outcome })} />
    <Field label="Success rating">{id => <select id={id} value={v.rating ?? ''} onChange={e => update(i, { rating: e.target.value ? Number(e.target.value) : null })}><option value="">Not rated</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select>}</Field></div>
    <TextField label="Visit notes (public if visit is included)" value={v.notes} onChange={notes => update(i, { notes })} multiline />
    <TextField label="Private visit notes" value={v.privateNotes} onChange={privateNotes => update(i, { privateNotes })} multiline />
    <ObservationsEditor value={v.observations} onChange={observations => update(i, { observations })} defaultType={defaultType} />
    <PhotosEditor value={v.photos} onChange={photos => update(i, { photos })} />
    <label className="check"><input type="checkbox" checked={v.publish} onChange={e => update(i, { publish: e.target.checked })} />Include this visit in public export</label>
    <button type="button" className="text-button danger" onClick={() => { if (confirm('Remove this visit from the form? Save the spot to apply the change.')) onChange(value.filter((_, j) => j !== i)); }}>Remove visit</button>
  </details>)}<button type="button" className="secondary" onClick={() => onChange([...value, newVisit()])}>+ Add visit</button></fieldset>;
}
