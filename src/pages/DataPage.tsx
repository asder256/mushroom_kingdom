import { useMemo, useState } from 'react';
import type { Spot, Dataset } from '../models/types';
import { backup, downloadJson, parseBackup, publicExport } from '../import-export/datasets';
import { googleRowsToSpots, mergeGoogle, parseGoogleCsv, rowNeedsReview, speciesFromNotes, type GoogleRow } from '../import-export/google';
import { errorMessage, fromPublic } from '../validation/schema';
import { Field, TextField } from '../components/Fields';
import { JournalMap } from '../map/JournalMap';

type Task = 'import' | 'backup' | 'publish';
const tasks: { id: Task; title: string; description: string; symbol: string }[] = [
  { id: 'import', title: 'Import places', description: 'Bring a Google Maps list into this browser.', symbol: '↙' },
  { id: 'backup', title: 'Back up & restore', description: 'Keep or recover a complete private copy.', symbol: '▧' },
  { id: 'publish', title: 'Prepare publication', description: 'Choose what the public site will receive.', symbol: '↗' },
];
const pageSize = 10;

export function DataPage({ spots, ready, onReplace }: { spots: Spot[]; ready: boolean; onReplace: (spots: Spot[]) => Promise<void> }) {
  const [task, setTask] = useState<Task>('import');
  const [restore, setRestore] = useState<Dataset | null>(null);
  const [restoreName, setRestoreName] = useState('');
  const [rows, setRows] = useState<GoogleRow[]>([]);
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState('mushroom');
  const [detectSpecies, setDetectSpecies] = useState(true);
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pickRow, setPickRow] = useState<string | null>(null);
  const [reviewOnly, setReviewOnly] = useState(false);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const exported = useMemo(() => publicExport(spots), [spots]);
  const previewSpots = useMemo(() => exported.spots.map(fromPublic), [exported]);
  const selected = rows.filter(r => r.include);
  const detectedCount = detectSpecies ? selected.reduce((count, row) => count + speciesFromNotes(row.notes, category).length, 0) : 0;
  const unresolved = selected.filter(rowNeedsReview).length;
  const visibleRows = rows.filter(r => !reviewOnly || reviewIds.includes(r.id));
  const lastPage = Math.max(0, Math.ceil(visibleRows.length / pageSize) - 1);
  const currentPage = Math.min(page, lastPage);
  const publicVisits = exported.spots.reduce((sum, s) => sum + s.visits.length, 0);

  async function readFile(file: File | undefined, kind: 'backup' | 'google') {
    if (!file) return;
    setStatus(''); setError(''); setBusy(true);
    if (kind === 'backup') { setRestore(null); setRestoreName(''); }
    else { setRows([]); setFilename(''); setPickRow(null); }
    try {
      if (file.size > 20_000_000) throw new Error('Choose a file smaller than 20 MB.');
      const text = await file.text();
      if (kind === 'backup') {
        const data = JSON.parse(text);
        if (data?.kind !== 'backup') throw new Error('This is not a Mushroom Kingdom private backup. Google Takeout JSON and public spots.json files cannot be restored here. For a Google Maps CSV, choose Import places.');
        setRestore(parseBackup(text)); setRestoreName(file.name);
      } else {
        if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Choose a Google Saved-list CSV. Google Takeout JSON is a different format and is not supported by this importer yet.');
        const parsed = parseGoogleCsv(text);
        setRows(parsed); setExpandedIds(parsed.filter(rowNeedsReview).map(r => r.id)); setFilename(file.name);
        setTag(file.name.replace(/\.csv$/i, '')); setReviewOnly(false); setPage(0);
      }
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  async function run(action: () => Promise<void>) {
    setBusy(true); setStatus(''); setError('');
    try { await action(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  function switchTask(next: Task) { setTask(next); setStatus(''); setError(''); }
  function selectAllForPublication(publish: boolean) {
    setPreview(false);
    void run(async () => {
      await onReplace(spots.map(spot => ({ ...spot, publish })));
      setStatus(publish
        ? `All ${spots.length} spots selected for the next public export. Visit selections are unchanged. Nothing has been published yet.`
        : 'All spots excluded from the next public export. Visit selections are unchanged. Nothing has been published yet.');
    });
  }
  const changeRow = (id: string, patch: Partial<GoogleRow>) => setRows(current => current.map(r => r.id === id ? { ...r, ...patch } : r));

  return <section className="page data-workspace">
    <header className="data-heading"><p className="eyebrow">YOUR JOURNAL, IN YOUR HANDS</p><h1>Backup & publishing</h1><p className="lead">Bring places in. Keep a safe copy. Share when you’re ready.</p></header>
    <div className="data-overview"><div><span className="eyebrow">SAVED IN THIS BROWSER</span><strong>{ready ? spots.length : '…'} <small>spots</small></strong><a href="#local">Open my local journal →</a></div><div><span className="eyebrow">IN YOUR NEXT PUBLIC EXPORT</span><strong>{ready ? exported.spots.length : '…'} <small>spots · {publicVisits} visits</small></strong><span>Selected for export does not mean published.</span></div></div>
    <p className="data-boundary"><strong>The public site changes only after deployment.</strong> Choosing a file, saving locally, or downloading an export does not update it.</p>
    <div className="data-task-picker" aria-label="Choose a data task">{tasks.map(t => <button key={t.id} disabled={busy} className={`data-task ${task === t.id ? 'chosen' : ''}`} aria-pressed={task === t.id} aria-controls="data-task-content" onClick={() => switchTask(t.id)}><span className="task-symbol" aria-hidden="true">{t.symbol}</span><strong>{t.title}</strong><span>{t.description}</span></button>)}</div>
    <div id="data-task-content" className="data-task-content" aria-busy={busy}>
      {!ready && <p role="alert" className="notice">Local storage is not ready. Imports and exports are disabled to protect existing data.</p>}
      {status && <div className="notice" role="status">{status}</div>}
      {error && <div className="notice data-error" role="alert">{error}</div>}
      {task === 'import' && <section aria-labelledby="import-heading">
        <p className="eyebrow">GOOGLE MAPS → LOCAL JOURNAL</p><h2 id="import-heading">Bring in a saved list</h2>
        <ol className="data-flow"><li><strong>1. Choose a CSV</strong><span>Read a preview. Nothing is saved.</span></li><li><strong>2. Review the places</strong><span>Check locations and choose rows.</span></li><li><strong>3. Add to local journal</strong><span>Save the selected places in this browser.</span></li></ol>
        <div className="file-drop-panel"><Field label="Import Google Maps list (.csv)">{id => <input id={id} type="file" accept=".csv,text/csv" disabled={!ready || busy} onChange={e => { void readFile(e.target.files?.[0], 'google'); e.target.value = ''; }} />}</Field><p>Choose one extracted Google Takeout CSV at a time. English and Swedish column names are supported. <a href="#guide">How to get your file →</a></p><small>Files placed in the repository’s sample-data folder are not automatically imported or published. Select the file here.</small></div>
        {!!rows.length && <>
          <div className="import-summary"><div><span className="eyebrow">PREVIEW ONLY · NOT SAVED</span><h3>{filename}</h3><p>{rows.length} places found · {selected.length} selected · {unresolved} selected places need review</p></div><button className="text-button" disabled={busy} onClick={() => { setRows([]); setFilename(''); setPickRow(null); }}>Cancel import</button></div>
          <div className="form-grid"><Field label="Category for this list">{id => <select id={id} value={category} onChange={e => setCategory(e.target.value)}><option value="mushroom">Mushroom</option><option value="fishing">Fishing</option></select>}</Field><TextField label="List tag" value={tag} onChange={setTag} /></div>
          <label className="check"><input type="checkbox" checked={detectSpecies} onChange={e => setDetectSpecies(e.target.checked)} />Add recognized species names from notes as observations</label>
          <p className="muted">{detectedCount} species observations detected in selected places. Expand a place to review its species.</p>
          <p className="muted">English and Swedish names are recognized, including common plurals and lists separated by commas, “and,” or “och.” Original notes are kept private. Unrecognized text stays as notes. Review the detected species below. Existing spots are kept, duplicates are skipped, and new spots start excluded from public export.</p>
          <div className="import-controls"><label className="check"><input type="checkbox" checked={reviewOnly} onChange={e => { setReviewOnly(e.target.checked); setReviewIds(rows.filter(rowNeedsReview).map(r => r.id)); setPage(0); }} />Show only places needing review</label><button className="text-button" disabled={busy} onClick={() => setRows(current => current.map(r => ({ ...r, include: !rowNeedsReview(r) })))}>Select only places with valid locations</button><button className="text-button" disabled={busy} onClick={() => setRows(current => current.map(r => ({ ...r, include: true })))}>Select all</button></div>
          <div className="import-rows">{visibleRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map(r => {
            const index = rows.indexOf(r) + 1;
            const detected = detectSpecies ? speciesFromNotes(r.notes, category) : [];
            return <div className="import-row" key={r.id}><div className="import-row-title"><label className="check"><input type="checkbox" checked={r.include} onChange={e => changeRow(r.id, { include: e.target.checked })} />Include place {index}</label><span className={`row-state ${rowNeedsReview(r) ? 'needs-review' : ''}`}>{rowNeedsReview(r) ? 'Needs review' : 'Location found'}</span></div><details open={expandedIds.includes(r.id)} onToggle={e => { const open = e.currentTarget.open; setExpandedIds(ids => open ? ids.includes(r.id) ? ids : [...ids, r.id] : ids.filter(id => id !== r.id)); }}><summary>{r.name || 'Unnamed place'}</summary>{detected.length > 0 && <p className="muted">Species to add: {detected.map(o => o.commonName).join(', ')}</p>}
              <TextField label={`Place name ${index}`} value={r.name} onChange={name => changeRow(r.id, { name })} />{r.url && <a href={r.url} target="_blank" rel="noreferrer">Open original place ↗</a>}{r.notes && <p className="preserve muted">Imported private notes: {r.notes}</p>}
              <div className="form-grid"><TextField label={`Latitude for place ${index}`} value={r.latitude} onChange={latitude => changeRow(r.id, { latitude })} /><TextField label={`Longitude for place ${index}`} value={r.longitude} onChange={longitude => changeRow(r.id, { longitude })} /></div>
              {rowNeedsReview(r) && <p className="warning">Check the name and location, or uncheck this place to leave it out.</p>}<button className="secondary" disabled={busy} onClick={() => setPickRow(pickRow === r.id ? null : r.id)}>Choose location on map</button>
              {pickRow === r.id && <JournalMap spots={[]} onSelect={() => {}} picking onPick={(lat, lng) => { changeRow(r.id, { latitude: lat.toFixed(6), longitude: lng.toFixed(6) }); setPickRow(null); }} />}
            </details></div>;
          })}</div>
          {!visibleRows.length && <p>All places have a name and valid coordinates.</p>}
          {visibleRows.length > pageSize && <div className="actions pagination"><button className="secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous places</button><span>Page {currentPage + 1} of {lastPage + 1}</span><button className="secondary" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)}>Next places</button></div>}
          <div className="data-action-bar"><div><strong>{selected.length} places selected</strong><p>{unresolved ? `Resolve ${unresolved} selected places or uncheck them before adding.` : 'Ready to save locally. The public site will not change.'}</p></div><button disabled={!ready || busy || !selected.length || unresolved > 0} onClick={() => void run(async () => { const incoming = googleRowsToSpots(rows, category, tag, detectSpecies); const merged = mergeGoogle(spots, incoming); await onReplace(merged.spots); setRows([]); setFilename(''); setStatus(`Saved ${incoming.length - merged.skipped} places to this browser; skipped ${merged.skipped} duplicates. They are now in My local journal and in future private backups. They are not selected for publication.`); })}>{busy ? 'Saving…' : `Add ${selected.length} places to local journal`}</button></div>
        </>}
      </section>}
      {task === 'backup' && <section aria-labelledby="backup-heading"><p className="eyebrow">LOCAL JOURNAL ↔ PRIVATE FILE</p><h2 id="backup-heading">Keep a complete copy</h2><p>A backup includes <strong>all {spots.length} saved local spots</strong>, every visit, exact coordinates, private notes, and publication settings. Unsaved forms and file previews are not included. Public spots are included only if you have copied them into your local journal.</p>
        <div className="backup-download"><div><h3>Download your private backup</h3><p>Use it to recover this journal or move it to another browser. Keep the file safe; it is not the file used to publish the site.</p></div><button disabled={!ready || busy} onClick={() => { downloadJson(backup(spots), `mushroom-kingdom-private-backup-${new Date().toISOString().slice(0, 10)}.json`); setStatus(`Backup download requested for ${spots.length} saved spots. Check your browser’s downloads and keep the file safe. Nothing was published.`); }}>Download private backup · {spots.length} spots</button></div>
        <p className="notice">Saved on this device only. Export a backup after important edits. Clearing browser storage can erase the local journal.</p>
        <details className="restore-panel"><summary>Restore from a private backup</summary><p><strong>Restoration replaces your whole local journal.</strong> It does not add to it. Choosing a file only opens a preview; replacement happens after confirmation. Use a private backup exported by this app, not Google JSON or public <code>spots.json</code>.</p>
          <Field label="Restore a journal backup (.json)">{id => <input id={id} type="file" accept=".json,application/json" disabled={!ready || busy} onChange={e => { void readFile(e.target.files?.[0], 'backup'); e.target.value = ''; }} />}</Field>
          {restore && <div className="restore-preview"><p className="eyebrow">PREVIEW ONLY · NOT RESTORED</p><h3>Restore preview</h3><p><strong>{restoreName}</strong> · Exported {restore.exportedAt.slice(0, 10)}</p><p>{restore.spots.length} spots in this file will replace {spots.length} spots currently saved in this browser.</p><ul>{restore.spots.slice(0, 10).map(s => <li key={s.id}>{s.name} · {s.visits.length} visits</li>)}</ul>{restore.spots.length > 10 && <p>And {restore.spots.length - 10} more spots.</p>}
            <div className="actions"><button disabled={busy} onClick={() => void run(async () => { if (!confirm(`Replace all ${spots.length} local spots with ${restore.spots.length} spots from this backup? A safety backup download will be requested first.`)) return; downloadJson(backup(spots), 'mushroom-kingdom-before-restore.json'); await onReplace(restore.spots); setRestore(null); setRestoreName(''); setStatus('Backup restored in this browser. Check that the safety backup downloaded. Public data has not changed.'); })}>Back up current journal & confirm restore</button><button className="secondary" disabled={busy} onClick={() => { setRestore(null); setRestoreName(''); }}>Cancel restore</button></div></div>}
        </details>
      </section>}
      {task === 'publish' && <section aria-labelledby="publish-heading"><p className="eyebrow">LOCAL JOURNAL → PUBLIC FILE → DEPLOYED SITE</p><h2 id="publish-heading">Prepare the public edition</h2><p>This is a <strong>complete replacement</strong> for the public dataset, not an addition to it. After deployment, visitors see exactly the spots in this export. Previously published spots omitted from it disappear from the current site.</p>
        <ol className="data-flow"><li><strong>1. Choose content</strong><span>Select local spots below. Include visits in the spot editor.</span></li><li><strong>2. Review & download</strong><span>Create a public spots.json file on your device.</span></li><li><strong>3. Replace & deploy</strong><span>Update the repository file and deploy via GitHub.</span></li></ol>
        <div className="publication-selection"><h3>Choose spots for the next export</h3>{spots.length > 0 && <div className="actions"><button className="secondary" disabled={!ready || busy || spots.every(s => s.publish)} onClick={() => selectAllForPublication(true)}>Select all spots</button><button className="text-button" disabled={!ready || busy || spots.every(s => !s.publish)} onClick={() => selectAllForPublication(false)}>Clear selection</button><span className="muted">{exported.spots.length} of {spots.length} spots selected</span></div>}{!spots.length ? <p>Your local journal is empty. <button className="text-button" onClick={() => switchTask('import')}>Import places</button> or <a href="#local">copy public spots into your local journal</a> first.</p> : spots.map(s => <label className="publish-row" key={s.id}><input type="checkbox" checked={s.publish} disabled={!ready || busy} onChange={e => { const publish = e.target.checked; setPreview(false); void run(async () => { await onReplace(spots.map(current => current.id === s.id ? { ...current, publish } : current)); }); }} /><span><strong>{s.name}</strong><small>{s.visits.filter(v => v.publish).length} of {s.visits.length} visits included · {s.approximate ? `${s.precisionKm} km approximation` : 'Exact coordinates'}</small></span><span>{s.publish ? 'Included' : 'Excluded'}</span></label>)}</div>
        <p className="muted">Private notes, favorites, and original Google Maps links are always excluded. Other notes and photo links on included spots and visits are public. To choose visits or change location precision, edit the spot in <a href="#local">My local journal</a>.</p>
        <div className="data-action-bar"><div><strong>{exported.spots.length} spots · {publicVisits} visits</strong><p>{exported.spots.length ? 'Selected locally. Not yet published.' : 'An empty export will remove all public spots when deployed.'}</p></div><button disabled={!ready || busy} onClick={() => setPreview(!preview)}>{preview ? 'Close export review' : 'Review public export'}</button></div>
        {preview && <div className="public-review"><h3>Review the file visitors will receive</h3><ul>{exported.spots.map(s => <li key={s.id}><strong>{s.name}</strong> · {s.latitude}, {s.longitude} · {s.visits.length} visits</li>)}</ul><details><summary>Inspect complete public JSON</summary><pre>{JSON.stringify(exported, null, 2)}</pre></details><button className="text-button" onClick={() => setShowMap(!showMap)}>{showMap ? 'Hide map preview' : 'Show map preview'}</button>{showMap && <JournalMap spots={previewSpots} onSelect={() => {}} />}<p className="warning">Review descriptions and shared photo links too. Public copies and Git history may retain removed information.</p><button disabled={!ready || busy} onClick={() => { downloadJson(exported, 'spots.json'); setStatus('Public file download requested: spots.json. It is not published yet. Follow Replace & deploy below.'); }}>Download public file · spots.json</button></div>}
        <section className="deploy-instructions"><p className="eyebrow">FINAL STEP · OUTSIDE THIS PAGE</p><h3>Replace & deploy</h3><ol><li>Find the downloaded <strong>spots.json</strong> on your device.</li><li>Replace <code>public/data/spots.json</code> in this project with it. Putting a file in <code>sample-data</code> does not publish it.</li><li>Review the changes on a feature branch, run tests and the build, then commit and push. Merge the reviewed pull request into <code>main</code>.</li><li>The configured GitHub Pages workflow builds the site with that file. <strong>Visitors receive it after deployment succeeds.</strong> Verify the public journal afterward.</li></ol><p>For a local static preview, replace the file first, then rebuild and run preview. A running preview does not rebuild itself. This page cannot commit files, deploy, or confirm the live deployment status.</p></section>
      </section>}
    </div>
  </section>;
}
