---
id: rules
title: Rules
group: Repo tooling
order: 3
covers:
  - claude:add-rule
  - claude:fix-rules
  - route:/rules
screenshots:
  - file: rules-page.png
    alt: The Rules page listing a repo's rule scopes, with the rules in its root CLAUDE.md
    route: /rules
    setup:
      - assist:
          [
            rules,
            add,
            Keep each component in its own file named after it,
            --title,
            One component per file,
          ]
      - assist:
          [
            rules,
            add,
            Use the design tokens for colours and spacing,
            --title,
            Design tokens only,
          ]
      - assist:
          [
            rules,
            add,
            Write user-facing copy in sentence case,
            --title,
            Sentence case,
          ]
      - assist:
          [
            rules,
            add,
            Give the URL when sending someone to a page,
            --title,
            Show location URLs,
            --user,
          ]
    waitFor: text=In effect for
    actions:
      - click: "nav[aria-label='Rule scopes'] >> text=CLAUDE.md"
      - click: "#rules-in-effect-for"
      - type: README.md
    viewport:
      width: 1280
      height: 640
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

Run `/add-rule` with what the rule should say, optionally followed by a flag:

| Flag     | The rule goes                                                                        |
| -------- | ------------------------------------------------------------------------------------ |
| none     | Where the agent judges it fits, usually the `CLAUDE.md` nearest the files it's about |
| `--user` | To every repo, on every node                                                         |
| `--node` | To every repo, on this node only                                                     |
| `--repo` | To this repo, on every node                                                          |

In the [diff](../sessions-diff/#commenting) and [preview panes](../sessions-preview-panes/), **Add rule** in the comment box runs `/add-rule` with your note and the selected text. The agent adds the rule, then fixes the selected text so it follows it.

## Citing a rule

In the same comment box, **Cite a broken rule** lists the rules that apply to the file. Pick one and the agent fixes the selected text so it follows that rule.

## Converting existing rules

When a repo's conventions are already in its `CLAUDE.md` files but as prose, numbered lists or under another heading, run `/fix-rules [directory]`. The agent moves each convention into its file's `## Rules` section in the form above, keeping its wording, and reports anything it left alone.

## The Rules page

The :icon[AccountBalanceOutlined] **Rules** button in the toolbar opens every rule that applies in the selected repo, grouped by where it lives: the repo's `CLAUDE.md` files, then the rules that reach every repo. Type a path in **In effect for** to mark the scopes whose rules apply to it.

::screenshot{file="rules-page.png"}

- **Move** sends a rule to another scope, and **Delete** removes it. Each change waits under **Awaiting approval** until you **Approve** or **Reject** it.
- Select text in a rule and type a note to send it to the session you have selected, for example to have the agent reword the rule.

To see the rules that apply to a path from the command line, see [assist rules](../cli-rules/).
