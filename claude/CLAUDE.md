After any code change, run `/verify` to ensure all checks pass.

The tool is invoked using the `assist` command and is installed globally. Use it directly (e.g., `assist commit "message"`). Do NOT try to invoke it via `npx tsx src/index.ts` or guess at the entry point.

When renaming TypeScript files or symbols, use the refactor commands instead of doing it manually:
- `assist refactor rename file <source> <destination>` — rename/move a file and update all imports
- `assist refactor rename symbol <file> <oldName> <newName>` — rename a variable, function, class, or type across the project
- `assist refactor extract <file> <functionName> <destination>` — extract a function and its private dependencies to a new file
All default to dry-run; add `--apply` to execute.
When using extract, name the destination file after the exported function (e.g. `updateWorkerCapacity.ts` for `updateWorkerCapacity`) to satisfy `useFilenamingConvention` lint rules.

Do not modify `claude/settings.json` without asking the user first. Only read-only commands should be added to the allow list — write operations (add, remove, set, delete) must require confirmation.

When the user mentions a Jira issue key (e.g. `BAD-671`, `PROJ-123`), use the Atlassian MCP to fetch context.
