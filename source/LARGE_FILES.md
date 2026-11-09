# Files in the mirror that are NOT committed (over GitHub's 100 MB limit)

| size | sha256 | local path | live URL |
|------|--------|------------|----------|
| 140,696,410 | e05ccbe8823a621d140ee97b99df3325921020d423a001ef291a7556bc6cc7a1 | `source/www.vineyardutah.gov/Boards & Commissions/Vineyard Active Transportation Plan_Final.pdf?t=202504021754480` | https://www.vineyardutah.gov/Boards%20&%20Commissions/Vineyard%20Active%20Transportation%20Plan_Final.pdf |

Restore with `scripts/fetch_large_files.sh` before running `scripts/import.sh` (the media importer warns about, and skips, any file that is missing).
