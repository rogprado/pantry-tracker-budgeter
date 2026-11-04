# Import from a spreadsheet

## 2026-11-04

New feature: spreadsheet import. Follow CLAUDE.md.
- An "Import from spreadsheet" page that accepts a .csv file with columns:
  name, category, quantity, unit, price, purchased_on, expires_on. Offer a
  downloadable template with those headers.
- Show a preview table before saving, flag rows with problems in friendly
  words (missing name, negative price, unknown unit), and import only the
  valid rows.
- If an item with the same name already exists, add the quantity as a
  purchase instead of creating a duplicate. Create missing categories.
Done when: importing the template with 5 rows of my real groceries adds
them correctly, and a bad row is flagged instead of saved.

it can be a .excl file as well

### Summary
Added /pantry/import (linked from the pantry header and its empty state). You download a CSV template with the 7 headers, pick a .csv or .xlsx file, and it is read in the browser (Papa Parse for CSV, read-excel-file for Excel; old .xls gets a "save as .xlsx" message). A preview table shows every row with "Ready", "Ready · adds to existing" or its problems in plain words (missing name/category/quantity, negative price, unknown unit, bad date); only valid rows are sent. The server action re-checks every row with the same pure rules in `lib/importRows.ts`, creates missing categories (case-insensitive match), creates new items, and for names you already have adds the quantity as a logged purchase via `record_movement`, so there are no duplicates. A results list shows what happened to each row.
Tested: 10 unit tests (header aliases, blank rows, Excel dates, every problem message, strict dates), an end-to-end run on a temporary account with a 7-row CSV (5 imported incl. brown rice topped up 1 → 2 kg, 2 flagged and not saved, categories created) and an .xlsx (Excel dates read, Spinach topped up instead of duplicated, unknown unit flagged), plus the 14-step regression click-through. Fixed: the preview showed "$-9.99" for a bad price; it now shows what was typed. Note: topping up an existing item doesn't change its stored price or purchase date, so it doesn't add to dashboard spending.
