## Authoring the docs site

An [Astro Starlight](https://starlight.astro.build/) site: pages in `src/content/docs/`, PNGs in `public/screenshots/`. Install its dependencies once with `npm run docs:install`.

### Pages

`src/content/docs/<id>.md`, with frontmatter validated by `docsPageSchema` (`src/docs/docsPageSchema.ts`):

- `id` — the file name
- `group` — a sidebar group from `docsNavGroups`; `order` — position within it
- `title`
- `covers` — inventory ids documented: `cli:<command path>`, `claude:<name>`, `config:<key>`, `route:<path>`, `skill:<name>`
- `screenshots` — optional, see below

Each `##` starts a section. Unknown keys, ids or scenes and missing screenshots fail the build. `verify:docs-coverage` fails when any command, skill, config key or route is covered by no page; `npx tsx src/docs/docsCoverage.ts --report` lists the gaps.

### Directives

- `:kbd[Mod+N]` — key caps; `Mod`/`Ctrl`/`Alt`/`Shift` show as ⌘⌃⌥⇧ on macOS, by name elsewhere
- `:status[running]` — session status glyph (`running`, `verifying`, `waiting`, `done`, `error`, `stopped`)
- `:badge[clone]` — card badge (`clone`, `harness`, `serving`, `node`)
- `:icon[OpenInFull]` — a dashboard button icon; register new ones in `src/docs/starlight/renderIcon.ts`
- `::screenshot{file="<file>"}` — places a declared screenshot; an undeclared file, or a declared one never placed, fails the build

### Screenshots

Each `screenshots` entry has `file`, `alt` and one target:

- `route` — a path on the capture web server
- `url` — a live, logged-out `https://github.com/` page with the extension's `content.js` injected and `browser.*` stubbed

Optional fields: `viewport` (default 1280×800), `theme`, `waitFor`, `crop`, `scene` (named setup steps in `capture/scenes.json`), `setup` (steps run after the scene), `actions` and `highlight` (selectors outlined in the capture). Without `theme` it captures `<file>` and `<file>-dark.png` and the site shows the reader's theme.

`actions`, run before capture: `click: <selector>`, `press: <key>`, `type: <text>`, `drag: { from, to }`, `script: <name>` (runs `capture/github/<name>.js` to fill in what a logged-out page lacks).

Setup steps:

- `assist: [args]` — run an assist command in the sandbox
- `run: <name>` — start a run session from `capture/assist.yml`
- `session: { repo, prompt, title?, reply?, status? }` — start a session in `sandbox`, `api` or `website` with status `running`, `waiting` or `done`. A fake `claude` (`capture/bin/claude`) prints `reply` as the transcript and answers title generation with `title`
- `openPr: { repo, number, title, author? }` — an open PR, answered by a fake `gh` (`capture/bin/gh`) for `gh pr list`/`gh pr view`; other `gh` calls fail
- `gh: { match, json }` — fake `gh` prints `json` when its args contain every `match` string; `"{{ago:<n><m|h|d>}}"` becomes that ISO time ago
- `sql: <statements>` — run against the capture database
- `newsFeed: { name, title, items }` — serve an RSS feed of `{ title, hoursAgo, excerpt? }` and `assist news add` it
- Preview panes, held open on the session with the given `session` prompt until the state changes: `preview: { session, kind: ask|show, title, body }`, `pr: { session, title, what, why, how?, resolves?, prNumber?, draft? }`, `proposal: { session, item }` (an `assist backlog propose` payload), `highLevelReview: { session, prNumber, title, headRef, body, linkedIssues?, criticalPaths?, uiPaths?, files }` with files `{ path, status, content?, patch? }` (an added file's patch is built from `content`)

Screenshots sharing a scene and setup are captured together. Between states sessions are drained, `~/.assist.yml` is restored and the backlog, backups and usage tables are emptied.

### Recapture

`npm run docs:capture [-- <file.png>...] [--skip-build] [--keep-home]` builds assist and, in a temporary `HOME` with a throwaway Postgres container (Docker), clones of `staff0rd/sandbox` plus local `api` and `website` repos, and the real daemon and web server on a free port, captures with Playwright (`npx playwright install chromium` once). Commit the changed PNGs.

### Preview

`npm run docs:build` builds into `docs/dist/` (`DOCS_BASE_PATH=<path>` for a sub-path). `npm run docs:preview` serves on port 4173, replacing any existing dev server for the checkout, and reloads tabs as pages change (a tab with an open feedback popover waits for it to close). It restarts itself when a page is added or removed, a page's `group` or `order` changes, a screenshot PNG is added or removed, or `src/docs/` or `capture/scenes.json` changes. Invalid frontmatter shows its error in the browser.

### Feedback

Start the `docs` run entry (`server: docs`, `docs:preview` on 4173) from the dashboard and open it in Firefox with the [assist browser extension](https://staffordwilliams.com/assist/browser-extension/). Select text, type a prompt in the popover and press **Enter**. It arrives, naming the page id, section and source `.md` and quoting the selection, in the live Claude session sharing the docs server's directory: of several, the one that last wrote that page, else the newest; with none, the live session that last wrote the page or anything under `docs/src/`.

## Rules

- **R3** — **CLI-only commands under CLI** — Document a command that only exists on the CLI, with no web UI or slash command driving it, on a page in the CLI nav group, not on a feature area page
- **R4** — **No implementation details** — Describe what a feature does for the user; do not explain which commands, hooks or internals implement it
- **R5** — **Only actionable behaviour** — Document only the actions a user can take and the settings they can change. Leave out anything the app does on its own, whether it shows, asks, warns or prevents something: the user meets it when it happens and needs nothing from the docs to handle it
- **R6** — **Never start docs preview** — Never start the docs preview server; the user runs it, so assume it is already running when asking for a review
- **R7** — **No config scope flags** — Write config examples as `assist config set <key> <value>` with no scope flags; explain global and per-repo scope only on the config page
- **R8** — **Internal commands under CLI** — A command that an agent, slash command or hook runs on the user's behalf is internal: mark it with `internalCommand` and document it only on a CLI page with `:badge[internal]` and who calls it, never on a feature area page
