---
description: Check README.md for missing command documentation
---

IMPORTANT: Do NOT read or search `.claude` directories. Only read the files listed below.

Analyze the following files to find commands that are missing from README.md:

1. Read `claude/commands/` directory - these are Claude slash commands (documented under "## Claude Commands")
2. Read `src/index.ts` - these are CLI commands (documented under "## CLI Commands")
3. Read `README.md` - the current documentation

Compare and report:
- Any Claude commands in `claude/commands/` not documented in README.md
- Any CLI commands in `src/index.ts` not documented in README.md
- Any documented commands that no longer exist

If there are missing commands, update README.md to include them following the existing format.
