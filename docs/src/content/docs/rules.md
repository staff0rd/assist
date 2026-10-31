---
id: rules
title: Rules
group: Repo tooling
order: 3
covers:
  - claude:add-rule
  - claude:fix-rules
---

Rules are a repo's written conventions, kept in its `CLAUDE.md` files where agents read them. Written in the form assist reads, they can be cited from a review comment, so a reviewer can point at the rule a change breaks rather than explaining it again.

## Writing rules

assist reads the `## Rules` section of each `CLAUDE.md`, with one rule per bullet:

```markdown
## Rules

- **R1** — **Keep it tight** — Keep each section under 30 lines
- **R2** — **No implicit documentation** — State only what the reader could not infer
```

Each rule has a code, unique across the repo, a short title and the rule itself. A rule applies to files in its `CLAUDE.md`'s directory and below, so a `docs/CLAUDE.md` holds rules for the docs alone.

## Adding a rule

Run `/add-rule` with what the rule should say. The agent words it as one short instruction, picks the `CLAUDE.md` it belongs in and gives it the next free code. A rule about how agents behave that holds in every repo, rather than about one repo's code, goes in your own rules instead, reaching every repo on every node; ask for it to stay on this node to keep it to this machine.

In the [diff](../sessions-diff/#commenting) and [preview panes](../sessions-preview-panes/), **Add rule** in the comment box runs `/add-rule` with your note and the selected text. The agent adds the rule, then fixes the selected text so it follows it.

## Citing a rule

In the same comment box, **Cite a broken rule** lists the rules that apply to the file. Pick one and the agent fixes the selected text so it follows that rule.

## Converting existing rules

When a repo's conventions are already in its `CLAUDE.md` files but as prose, numbered lists or under another heading, run `/fix-rules [directory]`. The agent moves each convention into its file's `## Rules` section in the form above, keeping its wording, and reports anything it left alone.

To see the rules that apply to a path, see [assist rules](../cli-rules/).
