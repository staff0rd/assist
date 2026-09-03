---
description: Put a repo's existing rules into the `## Rules` format assist reads
allowed_args: "[directory to fix, defaults to cwd]"
---

You are fixing existing written rules so `assist rules` can read them, and so they become citable from the comment panes. `$ARGUMENTS` is the directory to fix — the cwd when it is empty.

Assist reads exactly one thing: a `## Rules` heading whose body holds `- **<code>** — <text>` bullets. Rules written any other way — numbered lists, prose sections, bullets under a differently-named heading — are invisible to the rule picker no matter how well written they are. This command finds them, suggests the changes that would fix them, and applies what the user agrees to.

Nothing leaves the file it is in. A rule stays in its own `CLAUDE.md`; it just ends up under that file's `## Rules` heading, in the bullet form the parser reads.

## Step 1: Inventory

The target directory bounds everything you inventory and everything you change. Find every `CLAUDE.md` at or below it:

```
git -C <target> ls-files '**/CLAUDE.md' 'CLAUDE.md' 2>&1
```

A `CLAUDE.md` **above** the target is out of scope, even though its rules still apply to files inside the target. So when the target is not the repo root, open by naming the files you are therefore not touching — the user asked for a directory, and they should not have to guess what that excluded.

Also check for untracked ones (`git -C <target> status --short`) and mention any you find. Then, for each directory that has one, see what already parses:

```
assist rules list <dir> 2>&1
```

A directory that prints "No rules in scope" has nothing assist can read yet — that is what you are fixing. Read every `CLAUDE.md` you found, including ones that already have a `## Rules` section, since a file can have rules in the section and more of them scattered elsewhere.

## Step 2: Find the rule-like content

Read each `CLAUDE.md` in full. A rule is a standing instruction to whoever writes in that scope — something you could be told you broke. Look for:

- Numbered lists of directives ("Every rule comes from a transcript…", "Numbered lists only.")
- `- **<code>** — <text>` bullets already in rule form but under a heading that is not `## Rules`
- Short prose sections that state one standing instruction ("Never hard-wrap.", "Attribute each quote as…")

Not rules, and left alone: where files live, what a directory is for, source locations, epic and project background, worked examples, anything describing the repo rather than constraining what you write in it.

## Step 3: Classify each file

**Rename** — the section's bullets are already `- **<code>** — <text>` and the whole section is rules. Rename that heading to `## Rules`. The existing codes are preserved. This is the cheapest and safest fix; prefer it whenever it applies.

**Reword** — the rules are prose or a numbered list. Word each as one short imperative line, then add them one at a time:

```
assist rules add '<rule text>' --title '<title>' --scope <path to that CLAUDE.md> 2>&1
```

`rules add` allocates the next repo-wide code, creates the `## Rules` section when the file has none, and keeps the root index current. Then delete the prose it replaced, so the rule is not stated twice in the same file. If a prose section carried context beyond the rule itself, keep the context where it is and take only the instruction.

**Title** — a rule already in bullet form but with no title gets one, edited into the bullet as a second bold span: `- **R1** — **Keep it tight** — around 30 lines…`. This applies to the bullets you just renamed, which `rules add` never touched. A title is as few words as possible to tell that rule apart from its neighbours, three or four at most — the rule picker shows it alone, with the description only on hover.

**Leave** — the file has no standing rules. Say so and move on.

## Constraints

- Assist reads only the **first** `## Rules` heading in a file. Never create a second one; merge into the existing section instead.
- Only rename a heading when _every_ bullet under it is a rule and each already carries a `**code**`. If the section mixes rules with prose, treat it as a reword.
- Preserve existing codes on a rename. Never renumber — a code that has been cited must keep meaning the same rule.
- Never hand-write a new code. Codes are unique repo-wide, and `assist rules add` is what allocates them.
- Keep the author's wording wherever it already reads as a rule. You are reformatting rules, not rewriting them.
- Do not hard-wrap: one line per bullet.

## Step 4: Apply it

Make the changes straight away, one file at a time. Do not ask first and do not print a plan to approve.

Because nothing gates the write, let doubt decide the other way: when you cannot tell whether a line is a standing rule or just description, leave it alone and name it in the report. A rule missed is one command away from being added; a paragraph of documentation mangled into a bullet is not.

## Step 5: Record and verify

Once the files are fixed, record the scoped directories in the root `CLAUDE.md`:

```
assist rules index 2>&1
```

A rename does not update that index by itself, so run this even if you only renamed headings.

This is the one thing that reaches outside the target directory: the index line lives in the repo root's `CLAUDE.md` by definition, and is rebuilt from every `## Rules` section in the repo. Mention that you touched the root file when the target was not the root.

Then verify each scope reads back:

```
assist rules list <dir> 2>&1
```

Report what is now in scope where, and name anything you deliberately left behind and why.
