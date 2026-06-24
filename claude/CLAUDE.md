After any code change, run `/verify` to ensure all checks pass.

`assist` is installed globally. Use it directly (e.g., `assist commit "message"`).

When renaming TypeScript files or symbols, use the refactor commands instead of doing it manually:

- `assist refactor rename file <source> <destination>` — rename/move a file and update all imports
- `assist refactor rename symbol <file> <oldName> <newName>` — rename a variable, function, class, or type across the project
- `assist refactor extract <file> <functionName> <destination>` — extract a function and its private dependencies to a new file
  All default to dry-run; add `--apply` to execute.
  When using extract, name the destination file after the exported function (e.g. `updateWorkerCapacity.ts` for `updateWorkerCapacity`) to satisfy `useFilenamingConvention` lint rules.

Do not modify `claude/settings.json` without asking the user first. Only read-only commands should be added to the allow list — write operations (add, remove, set, delete) must require confirmation.

## Fetching Jira context

When the user mentions a Jira issue key (e.g. `BAD-671`, `PROJ-123`), use the Atlassian MCP to fetch context.

## Commenting code

Do not include comments for standard logic or syntax. Only comment if the specific line involves unintuitive complexity or a hack.

## Backlog items, PRs, and commits

Do not mention assist backlog items in PR descriptions or PR comments. The reference goes the other way: mention the relevant commits or PRs in the assist backlog item.
