# Mushroom Kingdom

A mobile-friendly outdoor journal: public Leaflet map, mushroom/fishing spots, species, visits, and a separate browser-local editor. Built with Vite, TypeScript, React and IndexedDB. English interface; exact coordinates by default with optional approximate public export.

## Local development

Use Node 24 LTS (minimum 22.12). npm is included with Node. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`; changing execution policy is unnecessary.

```powershell
npm.cmd install
npm.cmd run dev
```

Open the URL printed by Vite, normally http://127.0.0.1:5173/mushroom_kingdom/ . After the lockfile exists, use `npm.cmd ci` for reproducible installs. npm cache is configured inside this repository. On macOS/Linux use `npm` in place of `npm.cmd`.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

Browser tests need Playwright Chromium installed. To keep browser downloads local on Windows:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/.tooling/browsers"
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

`dist/` is the static production artifact. Preview is a local check, not a production server.

## Use the journal

- **Outdoor journal** reads the deployed public JSON. Bundled examples are fictional, not real location recommendations.
- **My local journal** saves only to this browser/site origin. Add by map, coordinates or device location; edit species, visits, notes and photo links. Device location requires browser permission and HTTPS (or localhost).
- **Backup & publishing** restores full JSON backups, imports Google Maps Saved-list CSVs, and previews/downloads public JSON.
- **Import guide** explains Google Takeout and handling missing coordinates.

Spot forms offer common mushroom and fish choices with Swedish labels, plus unrestricted free-text names. Optional groups such as Hågadalen can be reused and filtered. Click a local field note to zoom to its marker; Open notes or Read journal in the popup opens its full entry. Tag and description placeholders are examples and are not saved automatically.

On a phone, tap **My location** on the map and allow browser location access. A blue position dot and accuracy circle appear, and the map centres on your position. Tap again to refresh or Hide position to remove the indicator. This is a one-time request, not continuous tracking; it does not create a spot or save/publish your position. Location requires HTTPS (GitHub Pages) or localhost. An ordinary HTTP address on your local network will not provide phone location access. To save a new spot at your position, use **Use my location** in the spot form and save it explicitly.

Backup & publishing separates Import places, Back up & restore, and Prepare publication. Selecting a CSV only opens a preview. Confirm Add places to save it locally. Backups include all saved local spots; public exports include selected spots and visits, and replace the public dataset after its repository file is updated and deployed. Older backups without groups load as ungrouped spots.

This editor is not login protection. Anyone can use their own browser-local journal. Publishing requires a repository update and deployment. No custom backend, synchronization, photo upload, or API key is used.

## Backup and recovery

Local edits do not synchronize or publish. Clearing browser data, changing devices, using a different browser/profile, or changing the site address can make local data unavailable. Use one editing tab at a time to avoid stale updates. Export a full backup after important edits and before restoration. Private backups include exact coordinates and private notes; keep them outside tracked/public directories.

Restore accepts only the versioned private backup format. It validates the full file, previews the records, and asks before replacing the local journal. A current backup downloads before replacement; verify that you keep it. Invalid imports leave existing data unchanged. If storage fails, do not clear it: retain the tab, export a backup if possible, and retry after addressing available space/browser settings. Public JSON cannot recover omitted private fields.

## Publish

Mark spots and visits for public export, inspect the preview and download `spots.json`. Replace `public/data/spots.json` on a feature branch, review the diff, test, and merge through a PR to `main`. The Pages workflow builds and deploys after checks. Setup, HTTPS, verification and rollback: [deployment guide](docs/git-and-deployment.md).

All fields on included records are public except explicit private notes, favorite status, source URLs and publication flags. Approximation replaces exported coordinates but cannot conceal clues in names, descriptions or photos. Public repository contents and history are public; removal cannot recall downloaded copies. Never commit private backups, Takeout archives, secrets or credentials.

## Project organization

UI lives in `src/components`, `src/pages`, and `src/forms`; Leaflet in `src/map`; types/filtering in `src/models`; persistence in `src/storage`; schema validation in `src/validation`; backup/public/Google import in `src/import-export`; visual styling in `src/styles`. Tests separate unit/data checks and browser journeys. `public/data` contains only reviewed public content. `sample-data` contains fictional import fixtures.

See [architecture and privacy](docs/architecture.md), [Google Maps migration](docs/google-maps-import.md), and [Git/deployment workflow](docs/git-and-deployment.md). No deployment is implied by generating these files.
