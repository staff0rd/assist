After any code change, run `/verify` to ensure all checks pass.

`assist` is installed globally. Use it directly (e.g., `assist commit "message"`).

When renaming TypeScript files or symbols, use the refactor commands instead of doing it manually:

- `assist refactor rename file <source> <destination>` — rename/move a file and update all imports
- `assist refactor rename symbol <file> <oldName> <newName>` — rename a variable, function, class, or type across the project
- `assist refactor extract <file> <functionName> <destination>` — extract a function and its private dependencies to a new file
  All default to dry-run; add `--apply` to execute.
  When using extract, name the destination file after the exported function (e.g. `updateWorkerCapacity.ts` for `updateWorkerCapacity`) to satisfy the `oxlint-rules/filenameConvention.ts` lint rule.

Do not modify `claude/settings.json` without asking the user first. Only read-only commands should be added to the allow list — write operations (add, remove, set, delete) must require confirmation.

## Fetching Jira context

When the user mentions a Jira issue key (e.g. `BAD-671`, `PROJ-123`), use the Atlassian MCP to fetch context.

## Editing Jira issues with Smart Links

When editing a Jira issue whose description (or comment) contains Smart Links — rendered issue-key/URL chips, stored as ADF `inlineCard` nodes — edit via `editJiraIssue` with `contentFormat: "adf"` and emit real `inlineCard` nodes. Never round-trip such content through `contentFormat: "markdown"`: markdown has no representation for `inlineCard`, so every existing Smart Link is flattened to a plain browse URL and lost. Jira does not auto-promote plain browse URLs back into Smart Links, so the damage is not self-healing. Inspect the current stored ADF first and preserve existing `inlineCard` nodes when making a small edit. For anything beyond a trivial edit, build the ADF programmatically (a small script) rather than hand-authoring it inline — full-description ADF is verbose and easy to get wrong.

## Commenting code

Do not include comments for standard logic or syntax. Only comment if the specific line involves unintuitive complexity or a hack.

## Backlog items, PRs, and commits

Do not mention assist backlog items in PR descriptions or PR comments. The reference goes the other way: mention the relevant commits or PRs in the assist backlog item.
