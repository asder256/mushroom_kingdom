# Verification record — October 10, 2026

## Passed locally

- Node 24.21.0 and npm 12.2.0 detected.
- `npm.cmd test`: 20 tests passed across validation/backup/public export, groups and legacy data compatibility, filtering, IndexedDB persistence/replacement, English/Swedish Google CSV parsing/duplicate handling, species detection from notes (including preservation and opt-out), and shipped fictional public-data validation.
- `npm.cmd run build`: TypeScript check and Vite production build passed. Editor and data/import tools are separate lazy-loaded bundles. Rollup emits two non-blocking annotation warnings from Zod dependency comments.
- Existing Codex browser: Backup & publishing loaded; fictional Google CSV preview recovered two names, private notes, and the available coordinate pair. The missing-coordinate row was flagged and confirmation was rejected without modifying storage. Preview was canceled afterward.
- Backup & publishing at 390 px viewport: no horizontal overflow, readable stacked layout, no captured browser console errors. Viewport was reset afterward.
- Subsequent redesign separates importing, private backup/restore, and public export/deployment, with file names, preview states, pagination, and publication selection. Owner confirms list import works.
- Subsequent browser checks on isolated port 5175 with a fictional spot: common mushroom choice fills the name, custom free text is saved, fish choices default correctly, visit fish choices work, and the named group/visit survive refresh. Group filtering works. Clicking a local field note switches from list to map, zooms to the marker and opens its popup; Read journal opens its detail.

## Pending

- The added My location control has not been tested, at the owner's request. It requests a single device position and renders a temporary position/accuracy layer.

- Automated Playwright journeys: Chromium download failed inside the sandbox; outside-sandbox download retry was declined. The checked-in browser tests have not been executed locally.
- Full journal/editor keyboard and mobile journey checks, live tiles/marker interaction, device geolocation and browser download/restore UI verification.
- GitHub checks, Pages settings, deployment, HTTPS and post-deployment verification. No commit, push, PR, merge, repository-setting change or deployment has been performed.

The full MVP acceptance criteria are therefore not yet signed off. The local implementation is ready for review, with the limitations above.
