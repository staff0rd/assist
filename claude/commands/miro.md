---
description: Dump a Miro frame and extract its boxes as an ordered YAML list
allowed_args: "[board url | extract name]"
---

The user wants the text of every box inside a rectangle on a Miro board, in priority order. Fetching is your job; everything after the dump is `assist miro extract`.

## Step 0: is this a saved extract?

If `$ARGUMENTS` names a saved extract, or the user asks to refresh one they have picked before, do not re-pick anchors. Re-dump the frame over the extract's `items` file (step 2), then run `assist miro extract <name>`, which resolves board, frame, anchors, items, ignore and out from config. `assist config get miro.extracts` lists what is already saved.

## Step 1: confirm the frame

Run `context_explore` on the board URL and show the user the frames it returns. Confirm which frame is the target before dumping anything — a whole-board dump is large and usually wrong.

## Step 2: dump the raw pages

Call `board_list_items` with the board URL plus `?moveToWidget=<frame_id>` for the confirmed frame and `limit: 50`. Page with the returned `cursor` until `has_more` is false.

Write the raw response pages to a file (e.g. `board-items.json`) **exactly as returned** — a JSON array of the page objects, or one page object per line. Do not rename, reshape, flatten, sort or filter anything: the CLI normalises centre-origin positions, `geometry` and the HTML in `data.content` itself, and it errors if the shape is wrong rather than guessing.

## Step 3: extract

- Already picked: `assist miro extract <name>`
- Anchors known: `assist miro extract --items board-items.json --top-left <id|link> --bottom-right <id|link>`
- First time: `assist miro extract --items board-items.json --save <name>`

With no anchor flags the command renders the dump in the assist web UI preview pane, where the user clicks the top-left then the bottom-right box. **That needs the assist web UI running and this conversation attached to an assist session** — without one the command fails naming both flags rather than hanging. If it fails that way, tell the user to start the web UI (or supply the two ids).

Pass `--save <name>` on a first-time run. The interactive "save this selection?" prompt only appears on a TTY, so an agent run that omits `--save` picks anchors and then discards them. Add `--node` (user (node)) or `-r [repo]` (repo (db)) only if the user asks for a config scope other than repo (git), the repo's `assist.yml`; the command prints the file it wrote and, on later runs, the file the extract came from.

Add `--ignore <file>` (a YAML list of box texts) to drop banners and containers, and `--out <file>` to write the YAML with a provenance header instead of printing it.

## Anchor ids

Anchors are chosen visually, in the picker. There is no reliable way to read them off the board by hand:

- A per-item **Copy link to object** link gives `?moveToWidget=<id>`, which the command accepts verbatim as an anchor.
- A multi-select share link gives an opaque `moveToWidgets=<token>` — the API cannot resolve it, so it is useless here. Do not try to pass one.
- Nothing exposes the user's live Miro selection.

The picker echoes `--top-left <id> --bottom-right <id>` to stdout; report that pair to the user so it can be reused as flags.

## Reporting

Show the extracted list. The order is leftmost box edge first, topmost edge breaking ties — a wide banner spanning the board sorts early by design, so suggest the ignore list rather than treating it as a bug.
