After any code change, run `/verify` to ensure all checks pass.

The tool is invoked using the `assist` command and is installed globally. Use it directly (e.g., `assist commit "message"`). Do NOT try to invoke it via `npx tsx src/index.ts` or guess at the entry point.

When renaming TypeScript files or symbols, use the refactor commands instead of doing it manually:
- `assist refactor rename file <source> <destination>` — rename/move a file and update all imports
- `assist refactor rename symbol <file> <oldName> <newName>` — rename a variable, function, class, or type across the project
Both default to dry-run; add `--apply` to execute.
