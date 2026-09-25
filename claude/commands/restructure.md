---
description: Analyze and restructure tightly-coupled files
---

1. Run `assist refactor restructure $ARGUMENTS` and review the planned moves, resulting tree and depth statistics.
2. If it reports basename collisions or occupied targets, resolve them (rename one of the files with `assist refactor rename file`, or add a `restructure.ignore` glob) and re-run until there are no errors.
3. Run `assist refactor restructure --apply $ARGUMENTS`, then `assist refactor restructure --check $ARGUMENTS` to confirm the tree matches the plan.
4. Run `assist verify` and fix anything the moves broke.
