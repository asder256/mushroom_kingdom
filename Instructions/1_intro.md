# Mushroom Kingdom — project instructions

## 1. Role and purpose

Act as a senior web architect, UX designer, and frontend developer. Plan, and later build, the first version of my personal website: a mobile-friendly outdoor journal for mushroom and fishing locations, centered on an interactive map.

The site should feel like a personal nature journal and support additional spot categories and personal pages over time.

## 2. Workflow and approval

### Phase 1 — planning and discussion

- Analyze this brief and recommend a practical architecture and MVP.
- Explain material assumptions, tradeoffs, limitations, privacy implications, and alternatives.
- Recommend one default for each decision rather than leaving every choice unresolved.
- Present a phased implementation and deployment plan.
- Ask questions when requirements are unclear, focusing on decisions that materially affect architecture or user experience.
- Stop after presenting the plan so I can review and discuss it.
- Do not write application code during this phase.

### Phase 2 — implementation

Begin only after I explicitly approve the plan. Follow the implementation rules in section 13.

This document is a project brief; editing or reviewing it does not authorize application implementation.

## 3. Product direction and visibility

- Saved locations should be published so everyone can view them.
- The MVP is primarily maintained by one person; avoid unnecessary multi-user administration.
- Explain the difference between published data available to visitors and browser-local edits available only on a specific browser or device.
- Recommend a practical static-site publishing workflow for additions, edits, and deletions. Do not imply that local browser storage automatically updates the public site.
- Include approximate-location export in the MVP so published datasets can use reduced-precision or offset coordinates.
- Explain that coordinates and other content committed to a public repository are public, and that later removal may not erase copies or Git history.
- Do not publish private notes, precise coordinates intended to remain private, or other private fields accidentally. Define which fields are included in public exports.

The plan must explain how a publicly viewable site and its owner's editing workflow fit together without a custom backend.

## 4. MVP scope and user experience

The main screen contains an interactive map. Essential features must work on a phone.

### Map, discovery, and navigation

- Display saved spots as markers.
- Distinguish mushroom and fishing spots by icon or shape as well as color.
- Select a marker to see a summary and open a detailed spot view.
- Filter by category, species, tags, and visit date.
- Provide basic search or browsing and a list view as an alternative to the map.
- Support additional spot categories later.

### Journal editing

- Add a spot by clicking or tapping the map.
- Optionally use the device's current location.
- View, edit, and delete spots; confirm deletion.
- Record multiple species per spot and per visit.
- Record visit history, descriptions, and notes about how a place looks, feels, and changes over time.
- Attach photo or album links, including shared Google Photos links.

### Data and delivery

- Persist edits locally using browser storage.
- Export JSON for backup and import JSON for restoration or migration.
- Export a public dataset with approximate locations and an explicitly defined set of public fields.
- Include fictional sample locations only.
- Provide responsive design, basic accessibility, documentation, and GitHub Pages deployment.
- Display a concise data-backup warning in the interface.

Clarify visitor viewing and owner editing behavior in the plan. Do not treat a client-side editing control as authentication or access control.

## 5. Data model

Propose and document a model with the following fields and relationships.

### Spot

- Unique ID and name
- Extensible category, initially `mushroom` or `fishing`
- Latitude and longitude
- Approximate-location option
- Species observations and tags
- General description
- Notes about the place's appearance and atmosphere
- Access and terrain notes
- Date first added and date last updated
- Visit history
- Photo links and optional cover-photo URL
- Privacy level and favorite status

### Visit

- Visit date
- Multiple species observations
- Free-text notes
- Manually entered weather notes
- Catch or find information
- Photo links
- Rating or success level

### Species observation

- Common name
- Optional scientific name
- Type: mushroom, fish, plant, or other
- Optional quantity, notes, and photo link

Do not represent a spot's or visit's species as a single free-text value. Explain how spot-level observations relate to visit-level observations and how privacy and approximate-location fields affect public exports.

## 6. Storage, publishing, and privacy

### Static-hosting constraints

- The MVP must run as a client-side static application on GitHub Pages without a custom server.
- Recommend localStorage or IndexedDB for browser-local edits.
- Use JSON export/import for backup, restoration, and migration.
- Support bundled fictional sample data for development and a published dataset for public viewing.
- Keep persistence behind a storage or repository interface so a future backend does not require rewriting the UI.

Explain these consequences:

- Local data belongs to a particular browser or device.
- Clearing browser storage can remove it.
- Backups are important.
- Local edits do not automatically synchronize between devices or publish to the site.
- Public repository content must be treated as public.

### Privacy and safe handling

- Support storing or displaying approximate locations instead of exact coordinates.
- Make coordinate offset or reduced precision configurable for public export.
- Explain the limitations of approximate locations and shared photo links.
- Define public export fields and keep private fields out of public exports.
- Never include real private coordinates in demo or test data.
- Never place API secrets, authentication tokens, or credentials in frontend code or committed data.
- Validate URLs and safely render user-entered text.
- Confirm destructive actions and document backup and restoration.

Propose a future upgrade path for authentication, synchronization, and cloud storage. Do not add a backend to the MVP without a clearly justified reason.

## 7. Photo handling

For the MVP:

- Allow pasted photo and album URLs, including shared Google Photos links.
- Do not assume Google Photos links are stable direct image URLs.
- Show an external “Open photo” or “Open album” action when reliable embedding is unavailable.
- Optionally preview ordinary direct image URLs.
- Validate URLs and avoid exposing authentication tokens.
- Explain the privacy implications of publicly shared photo links.

Describe secure image-storage options for a later version. Direct uploads are deferred.

## 8. Technical direction and map requirements

Evaluate these approaches and recommend one:

| Option | Stack |
| --- | --- |
| A | Plain HTML, CSS, JavaScript or TypeScript, Leaflet, OpenStreetMap-compatible tiles, localStorage or IndexedDB, GitHub Pages |
| B | Vite, TypeScript, React, Leaflet or React Leaflet, localStorage or IndexedDB, GitHub Actions and GitHub Pages |

Choose based on simplicity, maintainability, mobile usability, static deployment, future expansion, reasonable testability, and avoiding unnecessary complexity. Explain the selection.

Do not introduce a backend, paid platform, or complicated state-management library without a strong reason.

The map must support:

- Static client-side use
- Markers and custom marker styles
- Popups
- Clicking or tapping to select coordinates
- Touch interaction
- Required attribution
- A path to marker clustering if the dataset grows

Avoid requiring a commercial map API key unless necessary. Document the selected tile provider's usage policy and the site's responsibility to follow it.

## 9. Visual design, accessibility, and site structure

Use a calm nature-oriented style: forest green, lake blue, warm earth tones, neutral backgrounds, and clear typography.

Include:

- Responsive, mobile-first layouts and large touch targets
- A collapsible mobile filter panel
- Helpful empty states and validation messages
- Semantic HTML and labeled forms
- Keyboard-accessible controls and visible focus indicators
- Sufficient color contrast
- Errors and marker categories distinguishable without color alone
- Reduced-motion support where relevant

Allow the repository to grow into a broader personal website with pages such as Home, About, Projects, Outdoor journal, Map, and Contact or links.

## 10. Deferred features

Keep these separate from the MVP:

- User authentication, shared accounts, and multi-user administration
- Automatic multi-device synchronization and a cloud database
- Direct photo uploads
- Offline-first progressive web app support
- Weather and species lookup APIs
- Route recording
- Advanced search
- Statistics and journal summaries
- Advanced public/private sharing modes beyond the MVP's public dataset and approximate-location export

## 11. Planning deliverable

Present a concise but complete plan covering:

1. Product vision and assumptions
2. Recommended stack and tradeoffs
3. Architecture and data flow, including public viewing and local editing/publishing
4. Data model and relationships
5. Storage strategy and future storage abstraction
6. Privacy, public export, and approximate-location behavior
7. Photo-link strategy
8. Screens, navigation, and main user journeys
9. MVP features and explicitly deferred features
10. Proposed repository structure
11. Testing strategy and accessibility checklist
12. Implementation order and milestones
13. Deployment and rollback plan
14. Backup and recovery plan
15. Future migration path
16. Risks and mitigations
17. Decisions I need to make
18. MVP acceptance criteria

The proposed repository structure should separate UI components, map functionality, forms, data models/types, storage, validation, import/export, sample data, styles, tests, deployment configuration, and documentation.

## 12. Deployment plan

Include:

- GitHub repository setup, accounting for the existing repository
- Choice between a user site and a project site
- Local development commands and production build process
- GitHub Actions or another appropriate Pages publishing method
- Correct base URL handling for a project site
- Deployment from the main branch
- HTTPS
- An optional custom domain as a later step
- README instructions
- Public dataset update workflow
- Post-deployment verification checklist
- Rollback approach
- A warning against committing secrets or private location data

## 13. Phase 2 implementation rules

After approval:

1. Implement in small, coherent steps.
2. Show the proposed file structure before generating files.
3. Generate complete files rather than partial fragments; when presenting code blocks, state the file path above each block.
4. Keep the application runnable after each meaningful milestone.
5. Do not silently change the approved architecture. Explain necessary deviations before making them.
6. Include setup, deployment, publishing, and rollback instructions.
7. Include meaningful tests for storage, validation, and import/export, including public export sanitization.
8. Use fictional sample locations only.
9. Provide a concise README explaining browser-local storage and public publishing.
10. Include an interface warning to back up local data.
11. Make the first version useful without external accounts or paid services for ordinary use.

## 14. MVP acceptance criteria

The MVP is complete when:

- Documented commands run the site locally and build it without errors.
- Deployment to GitHub Pages succeeds.
- The map loads with correct attribution and publicly published spots are visible to visitors.
- A mushroom or fishing spot can be added from the map, viewed, edited, and deleted.
- Multiple species, visits, descriptive notes, and photo/album links can be saved.
- Filters and basic search or browsing work.
- Local edits survive refresh in the same browser.
- JSON backup export can be imported again.
- Invalid imports are rejected safely.
- Public export supports approximate coordinates and excludes fields designated private.
- The documented publishing workflow makes updates visible to visitors.
- The interface works at common mobile widths, with usable keyboard focus and form labels.
- No secret keys or real private coordinates occur in demo or test data.
- The README explains local-storage limitations, backup/restore, public-data implications, deployment, publishing, and rollback.

## 15. Response style and next action

Be practical and opinionated while explaining tradeoffs. Use clear headings and concise bullets. Specify whether each proposed service or feature belongs in the MVP or a later phase.

When asked to begin the project, start with Phase 1 only and stop for plan review. Do not write application code until I explicitly approve the plan.
