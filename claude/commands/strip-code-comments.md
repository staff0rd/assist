---
description: Enforce self-documenting code by declaring the comment policy and stripping redundant comments
---

You are enforcing a self-documenting code style: code should explain itself, and comments should only earn their place when they convey something the code cannot.

## Step 1: Ensure CLAUDE.md declares the policy

Read `CLAUDE.md` at the repository root.

Decide whether it already states a code-style or commenting policy — look for an existing `## Code style` heading, a `## Commenting code` (or similar) section, or any prose that tells contributors not to write comments that restate the code.

- If such a policy is **already present**, leave `CLAUDE.md` unchanged. Do not duplicate or reword it.
- If **no** such policy exists, append the following section verbatim (including the heading) to the end of `CLAUDE.md`:

```markdown
## Code style

Write self-documenting code. Do not add comments that restate what the code already says, label obvious sections, or narrate standard logic and syntax. Only comment when a line involves unintuitive complexity, a genuine hack, or a workaround that the code itself cannot make clear. Never leave commented-out code in the tree.
```

## Step 2: Enumerate tracked source files

List git-tracked source files with `git ls-files`. Restrict to source files (e.g. `.ts`, `.tsx`, `.js`, `.jsx`, `.cs`, `.py`, `.go`, `.rs`, `.java`, `.kt`, `.rb`, `.c`, `.h`, `.cpp`, `.css`, `.scss`), plus `#`-comment config and script files: `Dockerfile` (and variants `Dockerfile.*` / `*.dockerfile`), `*.env`, and `*.sh`. Skip generated output, lockfiles, vendored dependencies, and markdown/docs.

For `*.sh` files, leave the leading header block untouched — the contiguous run of shebang, blank, and `#` lines from the top of the file, ending at the first line of code. Only strip violating `#` comments that appear **after** that header block. Dockerfile and `*.env` files have no such allowance; treat every `#` comment as in-scope.

## Step 3: Remove violating comments

Read each file and remove only comments that violate the policy:

- **Redundant explanatory comments** that restate what the adjacent code plainly does (e.g. `// increment counter` above `counter++`).
- **Commented-out code** — dead code left in the tree.
- **Section-banner comments** that merely label a region (e.g. `// ---- helpers ----`, `// === Setup ===`).

**Never remove** the following, even if they look like noise:

- **Functional directives** that the toolchain acts on: `eslint-disable*`, `@ts-expect-error`, `@ts-ignore`, `oxlint-disable`, `prettier-ignore`, `// @ts-nocheck`, coverage pragmas (`c8 ignore`, `istanbul ignore`), `noqa`, `type: ignore`, `#pragma`, `//go:`-style directives, and similar.
- **Comments marking a genuine hack or workaround** — anything explaining _why_ non-obvious code exists, including `HACK`/`WORKAROUND`/`FIXME`/`TODO` notes, links to issues, or rationale the code cannot convey on its own.
- **Doc comments** that form part of an API contract (JSDoc/TSDoc, XML doc comments, docstrings) unless they only restate the signature.

When in doubt, keep the comment. The cost of leaving a borderline comment is far lower than deleting one that carries intent.

## Step 4: Apply as unstaged edits and summarise

Apply every removal directly to the working tree using Edit. **Do not stage and do not commit** — leave all changes unstaged for the user to review.

Then print a per-file summary, for example:

```
src/foo.ts        3 removed
src/bar/baz.ts    1 removed
```

For each file with removals, list the removed comments (a short quote of each) so the user can audit the changes. End with the total count and a reminder that the edits are unstaged and ready for review.
