---
title: Renaming and extracting TypeScript
when: typescript
---

When renaming TypeScript files or symbols, use the refactor commands instead of doing it manually:

- `assist refactor rename file <source> <destination>` — rename/move a file and update all imports
- `assist refactor rename symbol <file> <oldName> <newName>` — rename a variable, function, class, or type across the project
- `assist refactor extract <file> <functionName> <destination>` — extract a function and its private dependencies to a new file

All default to dry-run; add `--apply` to execute.
