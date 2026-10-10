# Architecture and approved decisions

Phase 2 approved October 10, 2026. Stack: Vite, TypeScript, React, Leaflet, IndexedDB, GitHub Pages. English first. Exact coordinates by default; optional grid approximation remains available. GPS uncertainty is not a privacy measure. No custom backend, accounts, direct uploads, cloud sync, offline tile downloads, or external lookup APIs.

Public visitors load `public/data/spots.json`. My local journal uses the asynchronous `JournalRepository` interface with an IndexedDB implementation. Publishing never reads browser storage. Deployments never replace the local journal. The local editor is not authentication; anyone can use it in their browser, while GitHub repository permissions control publishing.

## Data

Version 1 backups contain spots with stable IDs and nested visits. Species are structured observation arrays at both spot and visit level. Spot observations describe general associations; visit observations record a dated encounter. Filters derive the union without copying observations. Categories are strings validated as identifiers, allowing future category additions without schema changes. The initial creation form offers mushroom and fishing and preserves imported custom categories.

Private notes exist at spot and visit level. All other content on included spots and included visits is public, as labeled in the form. New spots and visits start excluded from export. Imported Google notes start private. Public JSON explicitly allowlists fields and excludes private notes, favorites, source URLs and inclusion flags. Backup and public formats are distinct; public files cannot restore omitted information.

Exact coordinates are exported by default. Optional approximation snaps to a stable configurable grid; the original coordinates are omitted from the public object. The displayed circle is an illustrative area, not a statistical accuracy guarantee or access instruction. Repeated exports at differing grid sizes and clues in text/photos can narrow the location. Public information cannot be recalled from others' copies or repository history.

Public fields: ID, name, category, group, exported latitude/longitude, approximation flag/grid size, observations (common/scientific name, type, quantity, notes, photo URL), tags, description, atmosphere, access, timestamps, photo links, cover URL, and included visits (ID, date, observations, notes, weather, outcome, photos, rating).

Each spot has one optional group name. Missing groups in earlier version-1 backups/public files default to an empty string, so existing browser journals remain readable. Group names are searchable, filterable, and public on included spots. Common-species choices are a local English/Swedish catalogue, and arbitrary names remain valid. Local field-note selection focuses the map without navigating away; an explicit Open notes action or popup opens the full detail page.

## Safety and limits

Imports are limited to 20 MB / 10,000 spots. Validate before an atomic IndexedDB replacement. Unknown fields and unsupported schema versions fail closed. Storage failures retain the previous state; the UI reports failure instead of claiming a save. Backups have no encryption. Use one editing tab at a time: the initial repository adapter does not merge concurrent tab edits, and a stale tab could overwrite newer edits.

React renders text; map popups use DOM textContent. HTTPS URLs are validated, credential-bearing URLs and recognizable authentication parameters are rejected. Shared album capability links are deliberately supported; the owner must review their audience and contents. Images open as external links; no remote image is automatically embedded.

## Maps

Leaflet is isolated in `src/map`. The configurable tile URL is in `public/config/map.json`. The initial provider is standard OpenStreetMap raster tiles. Visible OSM attribution is fixed trusted markup. Browser caching and referrer defaults are preserved. No scraping, prefetch or offline downloads. A list remains usable when tiles fail. Tests abort external requests.

The owner must follow https://operations.osmfoundation.org/policies/tiles/ (reviewed October 10, 2026). Service is best-effort and can block heavy use; change providers if scale requires it and update attribution and documentation for that provider. Tile requests expose viewport/IP information. Clustering can be added in the map adapter when needed.

My location uses a permission-based, one-time browser geolocation request with a 15-second timeout. A separate Leaflet layer displays the position and device-reported accuracy, without writing journal data or exports. The indicator can be hidden or refreshed. HTTPS is required on phones; localhost is suitable for desktop development. Centring the map still requests tiles for the viewed area from the provider. Continuous tracking and route recording are deferred.

## Future migration

Keep forms working against validated models and the repository interface. A future API adapter would add authenticated ownership, cloud storage, revision/conflict handling, and versioned migration of local backups. Photo uploads would use authenticated object storage with controlled permissions and metadata review. Neither authentication nor synchronization can be implemented securely by hiding client-side controls.
