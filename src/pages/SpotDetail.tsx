import type { Spot, Observation, Photo } from '../models/types';
function Photos({ photos }: { photos: Photo[] }) { return <div className="photo-links">{photos.map((p, i) => <a key={i} href={p.url} target="_blank" rel="noreferrer">{p.kind === 'album' ? '▧' : '◫'} {p.label || `Open ${p.kind}`} ↗</a>)}</div>; }
function Observations({ observations }: { observations: Observation[] }) { return <ul className="observations">{observations.map((o, i) => <li key={i}><strong>{o.commonName}</strong>{o.scientificName && <em> {o.scientificName}</em>}<span className="muted"> · {o.type}{o.quantity && ` · ${o.quantity}`}</span>{o.notes && <p>{o.notes}</p>}{o.photoUrl && <a href={o.photoUrl} target="_blank" rel="noreferrer">Open species photo ↗</a>}</li>)}</ul>; }
export function SpotDetail({ spot: s, local, onBack, onEdit, onDelete }: { spot: Spot; local: boolean; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  return <article className="page narrow detail"><button className="text-button" onClick={onBack}>← Back to the journal</button><p className="eyebrow">{s.category === 'fishing' ? '≈ BY THE WATER' : '♠ IN THE WOODS'} · {local ? 'LOCAL JOURNAL' : 'PUBLIC JOURNAL'}</p><h1>{s.name}</h1>
    <div className="tags">{s.group && <span>Group: {s.group}</span>}{s.tags.map(t => <span key={t}>{t}</span>)}{local && s.favorite && <span>★ Favorite</span>}</div>
    <p className="lead preserve">{s.description || 'A place with a story still to be written.'}</p>
    <p className="coordinates">{s.latitude.toFixed(5)}, {s.longitude.toFixed(5)} · {s.approximate ? local ? `Public export uses a ${s.precisionKm} km grid` : `Approximate area · ${s.precisionKm} km grid` : 'Saved coordinates'}</p>
    {local && <div className="actions"><button onClick={onEdit}>Edit spot & visits</button><button className="secondary danger" onClick={onDelete}>Delete spot</button><span className="muted">{s.publish ? 'Included in next public export' : 'Not included in public export'}</span></div>}
    {s.atmosphere && <section><h2>The feeling of the place</h2><p className="preserve">{s.atmosphere}</p></section>}
    {s.access && <section><h2>Getting there</h2><p className="preserve">{s.access}</p></section>}
    {!!s.observations.length && <section><h2>Species at this place</h2><Observations observations={s.observations} /></section>}
    {!!s.photos.length && <section><h2>Photos & albums</h2><Photos photos={s.photos} /></section>}
    {s.coverUrl && <a href={s.coverUrl} target="_blank" rel="noreferrer">Open cover photo ↗</a>}
    {local && s.privateNotes && <aside className="notice"><h2>Private notes</h2><p className="preserve">{s.privateNotes}</p></aside>}
    {local && s.sourceUrl && <p><a href={s.sourceUrl} target="_blank" rel="noreferrer">Original saved place ↗</a></p>}
    <section><h2>Visits <span className="count">{s.visits.length}</span></h2>{!s.visits.length && <p className="muted">No visits recorded yet.</p>}
      {[...s.visits].sort((a, b) => b.date.localeCompare(a.date)).map(v => <article className="visit" key={v.id}><p className="eyebrow"><time dateTime={v.date}>{v.date}</time>{v.rating && ` · ${v.rating}/5`}{local && ` · ${v.publish ? 'For public export' : 'Local only'}`}</p><p className="preserve">{v.notes}</p>{v.weather && <p><strong>Weather:</strong> {v.weather}</p>}{v.outcome && <p><strong>Find / catch:</strong> {v.outcome}</p>}<Observations observations={v.observations} /><Photos photos={v.photos} />{local && v.privateNotes && <p className="notice preserve">Private: {v.privateNotes}</p>}</article>)}
    </section><p className="muted">Added {s.createdAt.slice(0, 10)} · Updated {s.updatedAt.slice(0, 10)}</p>
  </article>;
}
