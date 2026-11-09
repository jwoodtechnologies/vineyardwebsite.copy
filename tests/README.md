# Tests

| Command | What it checks |
|---|---|
| `php tests/test-home-fix.php` | Home page fix + 1.0.2 upgrade against the exact broken state reported on the live site (real plugin code, in-memory WordPress) |
| `php tests/editor/dump-editor-data.php > tests/editor/editor-data.json` then `cd tests/editor && npm install && cd ../.. && NODE_PATH=tests/editor/node_modules node tests/editor/blocks-editor.test.js tests/editor/editor-data.json` | Blocks in the editor with WordPress's real block library: registered under “Vineyard City”, saved Home markup never “unsupported”/“invalid”, stable when re-saved, insertable, each card has title + help + edit link + live preview |
| `php tests/city-render.php OUT http://localhost:8765` | Renders front page, all 621 pages and an editor-preview page through the real plugin + theme for screenshot comparison with the live site |
| `python3 -I tests/validate_wxr.py`, `validate_missing.py`, `validate_media.py`, `validate_city.py` | Import files, media chunks, plugin data and zips |
| `php tests/test-rewrite.php` | Link rewriting over every page |
