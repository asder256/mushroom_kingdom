# Git and release workflow

Use the existing repository. `main` is the release branch. Create short-lived `codex/<purpose>` branches from an up-to-date main (for example `codex/journal-mvp`, `codex/publish-spots`). Keep commits focused: foundation, journal UI, import/export, tests/docs. Review the diff before staging, especially public datasets. Do not commit downloaded Takeout archives or private backups.

Push a branch and open a pull request. `Check` runs unit tests, TypeScript/build and browser tests. Configure branch protection on GitHub to require this check and review when setting up the repository; no remote settings are changed by the initial implementation. Squash merge approved changes to main. No develop branch is needed for this single-maintainer project. Git commits/pushes/merges/deployment require owner authorization when performed by an agent.

## First deployment

1. Review all changes and approve the public dataset. The bundled examples are fictional.
2. Confirm GitHub Pages is available for the repository's visibility/account plan.
3. In repository Settings → Pages, choose GitHub Actions. The checked-in workflow builds and deploys from main. All checks must pass before its deploy job.
4. Merge the approved branch to main. The workflow builds `dist`, uploads that directory only, and deploys it using the Pages environment.
5. Enable/verify HTTPS in Pages settings. Expected project address: https://asder256.github.io/mushroom_kingdom/ . A custom domain is optional later.

Vite's base is `/mushroom_kingdom/`. Data/config requests use the same base. Hash navigation avoids static-host path fallback requirements. If the repository name or hosting base changes, update Vite configuration, test URL, and documentation. A user site/custom domain would normally use `/` instead.

## Publish a dataset

1. Export a full private backup and store it safely.
2. Review the public export preview in the app; download `spots.json`.
3. On a publishing branch, replace `public/data/spots.json`. Inspect the entire diff, including URLs, descriptions and coordinates.
4. Run `npm.cmd test`, `npm.cmd run build`, and `npm.cmd run test:e2e` (use `npm` on other platforms).
5. Commit, push, create a PR, review and merge after passing checks.
6. Check the deployed public edition in a fresh browser. Local edits/downloads do not publish or synchronize anything.

Public deletion is also a new export and deployment. If every record is excluded, the empty dataset intentionally removes all public spots after deployment. Never substitute a private backup for a public export: public-schema validation rejects it, but a committed file would still be exposed by Git history.

## Verify release

- HTTPS and project-base assets load; navigation and refresh work.
- Published markers, list, filters, detail and attribution work.
- Mobile has no horizontal overflow; controls and keyboard focus are usable.
- A local edit survives refresh and does not alter the public edition.
- Backup restore and public preview work; browser console has no application errors.
- External links open intentionally; a tile outage leaves list browsing available.

## Roll back

Revert the problematic commit through a reviewed branch/PR, or restore known-good application/data files in a new commit and redeploy. Do not rewrite history. Rollback changes the site, not browser-local journals. Restore local data separately from a compatible private backup. Removing data from a deployment does not erase public history or copies.

Sources: https://vite.dev/guide/static-deploy.html and https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages .
