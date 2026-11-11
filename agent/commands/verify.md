---
description: Run all verification commands in parallel
---

Run `assist verify $ARGUMENTS 2>&1` (not npm run, not npx - just `assist verify` directly). If it fails, fix all errors and run again until it passes.

Each `verify:<name>` / `verify:<name>:fix` pair (the [MakerXStudio/verify](https://github.com/MakerXStudio/verify) convention) runs once: the `:fix` variant in fix mode, the base entry in check mode. `VERIFY_MODE=check|fix` picks the mode; otherwise a truthy `CI` means check, else fix. A `:fix` run may rewrite files, so review the resulting diff.

ARGUMENTS: $ARGUMENTS
