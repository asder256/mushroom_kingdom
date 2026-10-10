# Google Maps list migration

The same guide is available in the site's Import guide page. Official Google instructions (checked October 10, 2026): https://support.google.com/maps/answer/7280933?hl=en and https://support.google.com/accounts/answer/3024190?hl=en .

1. Sign into Google Takeout, deselect other products and choose **Saved**. Choose a one-time ZIP export and create it.
2. Download and unzip the archive yourself. Preserve an original backup. Do not put the archive in tracked/public project folders.
3. In Backup & publishing → Import places, select one list CSV. English and Swedish headers are supported: Title or Name / Namn; URL or Google Maps URL / Webbadress; optional Note / Anteckning, Notes, Comment / Kommentar, Tags / Taggar. Selecting a file only opens a preview. Files in sample-data are not automatically imported. Headers are case-insensitive; quoted commas, newlines and UTF-8 BOM are supported. ZIP, Google JSON, KML and GeoJSON are not currently accepted.
4. Choose category and list tag (initially the filename). Use pagination and the needs-review filter to check places. Coordinates can come from numeric `/maps/search/lat,lng` paths, coordinate query pairs and `!3d...!4d...` place pairs. Camera coordinates are never used. Link-only rows require manual coordinates or map selection; uncheck rows to skip them. No scraping, API key, link resolution, or geocoding is performed.
5. Review recognized species from notes. Detection is enabled by default and can be switched off. Complete English/Swedish names (including common plurals and delimiter-separated lists) become spot observations for the chosen mushroom/fishing category. Unknown names and prose are not guessed. Original notes remain private. Confirm import: existing spots are preserved; identical source URLs or name/coordinate combinations are skipped, including their existing species. Records start unpublished. Re-exporting different URL forms can still create duplicates, so review first.
6. Add species and visits, select publication settings, back up, and follow the publication workflow.

Regression tests use fictional English and Swedish CSVs. Owner-provided examples informed header/URL support and are ignored by Git; they are not bundled in the public site. Google can change export formats. Downloading data does not delete it from Google, and this is not ongoing synchronization.
