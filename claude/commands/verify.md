---
description: Run all verification commands in parallel
---

Run `assist verify 2>&1` (not npm run, not npx - just `assist verify 2>&1` directly). If it fails, fix all errors and run again until it passes.

Use `assist verify all 2>&1` to bypass diff-based filters and run every check regardless of which files changed.
