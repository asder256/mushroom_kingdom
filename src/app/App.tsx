import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { Spot } from '../models/types';
import { newSpot } from '../models/types';
import { IndexedDbRepository } from '../storage/repository';
import { errorMessage, fromPublic, publicSchema } from '../validation/schema';
import { Journal } from '../pages/Journal';
import { SpotDetail } from '../pages/SpotDetail';
import { Guide } from '../pages/Guide';

const SpotEditor = lazy(() => import('../forms/SpotEditor').then(module => ({ default: module.SpotEditor })));
const DataPage = lazy(() => import('../pages/DataPage').then(module => ({ default: module.DataPage })));

const repository = new IndexedDbRepository();
export function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || 'journal');
  const [published, setPublished] = useState<Spot[]>([]); const [local, setLocal] = useState<Spot[]>([]);
  const [ready, setReady] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null); const [editing, setEditing] = useState<Spot | null>(null);
  const [saving, setSaving] = useState(false); const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const listener = () => { setRoute(location.hash.slice(1) || 'journal'); setSelected(null); setEditing(null); };
    window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener);
  }, []);
  useEffect(() => {
    void repository.load().then(s => { setLocal(s); setReady(true); }).catch(e => setError(`Local journal could not be loaded: ${errorMessage(e)}. Do not clear browser storage; try reopening this browser.`));
    fetch(`${import.meta.env.BASE_URL}data/spots.json`).then(r => { if (!r.ok) throw new Error('Published dataset could not be fetched.'); return r.json(); }).then(data => setPublished(publicSchema.parse(data).spots.map(fromPublic))).catch(e => setError(errorMessage(e))).finally(() => setLoading(false));
  }, []);
  useEffect(() => { main.current?.focus(); window.scrollTo(0, 0); }, [route, selected, editing?.id]);
  useEffect(() => {
    if (!editing) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [editing]);
  async function replace(spots: Spot[]) {
    if (!ready) throw new Error('Local storage is not ready.');
    await repository.replace(spots); setLocal(spots);
  }
  const isLocal = route === 'local'; const spots = isLocal ? local : published; const detail = spots.find(s => s.id === selected);
  const nav = [{ id: 'journal', label: 'Outdoor journal' }, { id: 'local', label: 'My local journal' }, { id: 'data', label: 'Backup & publishing' }, { id: 'guide', label: 'Import guide' }, { id: 'about', label: 'About' }];
  return <><a className="skip-link" href="#main" onClick={e => { e.preventDefault(); main.current?.focus(); }}>Skip to content</a><header className="site-header"><a className="brand" href="#journal" onClick={e => { if (editing && !confirm('Discard unsaved form changes?')) e.preventDefault(); }}><span className="brand-mark" aria-hidden="true">♠</span><span>Mushroom<br /><strong>Kingdom</strong></span></a><nav aria-label="Main navigation">{nav.map(n => <a key={n.id} href={`#${n.id}`} aria-current={route === n.id ? 'page' : undefined} onClick={e => { if (editing && !confirm('Discard unsaved form changes?')) e.preventDefault(); }}>{n.label}</a>)}</nav><span className="header-note">OUTSIDE IS A GOOD PLACE TO BE</span></header>
    <main id="main" ref={main} tabIndex={-1}><Suspense fallback={<p className="page" role="status">Opening the journal…</p>}>{error && <div className="notice error-banner" role="alert">{error}<button className="text-button" onClick={() => setError('')}>Dismiss</button></div>}
      {editing ? <SpotEditor key={editing.id} spot={editing} groups={local.map(s => s.group).filter(Boolean)} onCancel={() => setEditing(null)} onSave={async spot => { await replace(local.some(s => s.id === spot.id) ? local.map(s => s.id === spot.id ? spot : s) : [...local, spot]); setEditing(null); setSelected(spot.id); }} /> : detail ? <SpotDetail spot={detail} local={isLocal} onBack={() => setSelected(null)} onEdit={() => setEditing(detail)} onDelete={() => { if (!saving && confirm(`Delete “${detail.name}” and its visits from this browser? Export a backup first if needed. The public site changes only after publication.`)) { setSaving(true); void replace(local.filter(s => s.id !== detail.id)).then(() => setSelected(null)).catch(e => setError(errorMessage(e))).finally(() => setSaving(false)); } }} /> : route === 'data' ? <DataPage spots={local} ready={ready} onReplace={replace} /> : route === 'guide' ? <Guide /> : route === 'about' ? <section className="page narrow prose"><p className="eyebrow">MUSHROOM KINGDOM</p><h1>A little closer to the outdoors.</h1><p className="lead">A personal journal of woodland finds, familiar shorelines, and the small details worth remembering.</p><p>Browse the public collection, or use My local journal to keep a collection in your own browser. The editor is available to everyone; it is not an authenticated owner account. Only a reviewed repository update publishes changes.</p><p>The first edition contains fictional sample places. More personal pages can grow here over time.</p><h2>Map & data</h2><p>Map data © OpenStreetMap contributors. Maps require an internet connection. The tile provider receives requests for the area you view. External photo links open only when you choose them.</p><p><a href="https://operations.osmfoundation.org/policies/tiles/" target="_blank" rel="noreferrer">Tile usage policy ↗</a></p></section> : loading && !isLocal ? <p className="page" role="status">Opening the journal…</p> : <Journal key={route} spots={spots} local={isLocal} ready={ready} onSelect={setSelected} onAdd={(lat, lng) => setEditing(newSpot(lat, lng))} onCopy={() => { if (ready && !local.length && confirm('Copy the public dataset into this browser? Private fields cannot be recovered from public data. Copied spots start unpublished.')) void replace(published.map(s => ({ ...s, publish: false }))).catch(e => setError(errorMessage(e))); }} />}
    </Suspense></main><footer><span>Mushroom Kingdom</span><span>A field journal for the places we return to.</span><a href="#guide" onClick={e => { if (editing && !confirm('Discard unsaved form changes?')) e.preventDefault(); }}>Bring your places along ↗</a></footer></>;
}
