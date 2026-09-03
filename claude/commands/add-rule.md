---
description: Capture a new CLAUDE.md rule from a review comment
allowed_args: "[quoted text, file and note from the comment pane]"
---

You are turning a review comment into a written rule in a `CLAUDE.md` file, so the same mistake is caught next time. `$ARGUMENTS` carries what the comment pane sent: an optional `File:` line, the quoted text in a fenced block, and the reviewer's note.

## Step 1: Read what you were given

Pull three things out of `$ARGUMENTS`:

- **File** — the path the selection came from, if a `File:` line is present. The document preview pane has no path, so it may be missing.
- **Quote** — the selected text, the concrete example of the rule being broken.
- **Note** — the reviewer's words, the substance of the rule.

If `$ARGUMENTS` is empty, ask the user what rule they want to add and skip to Step 3.

## Step 2: Word the rule

Write the rule as one short imperative sentence that generalises the note beyond this one instance — what to do (or not do), not what went wrong here. Keep it to a single line: it becomes a `- **<code>** — **<title>** — <text>` bullet.

Then write its **title**: as few words as possible to tell this rule apart from the others, three or four at most. The rule picker shows the title alone, so it has to identify the rule on its own — "Keep it tight", "No implicit documentation". Not a restatement of the sentence, and not so generic it could name any rule in the file.

Ask the user a clarifying question only when the note is genuinely too vague to word a rule from. One question, then write it.

## Step 3: Work out the scope

The scope is the directory whose `CLAUDE.md` gets the rule. Infer it — do not ask by default:

- With a file path, the default is the nearest `CLAUDE.md` walking up from that file's directory to the repo root. `assist rules list <path>` shows what is already in scope there, which tells you where sibling rules live.
- If the note is clearly about a kind of document that lives in one directory (and the file sits in it), that directory's `CLAUDE.md` is the scope — pass `--scope <dir>/CLAUDE.md` to create it there when it does not exist yet.
- If the rule plainly applies repo-wide, use the root `CLAUDE.md`.
- Without a file path, use the repo root unless the note names a directory.

Ask the user only when two scopes are genuinely defensible and the choice changes where the rule applies. Otherwise take the nearest `CLAUDE.md` and say which one you chose.

## Step 4: Write it

```
assist rules add '<rule text>' --title '<title>' --scope <path> 2>&1
```

`--scope` takes a file, a directory, or a `CLAUDE.md` path directly. A file or directory resolves to the nearest existing `CLAUDE.md` at or above it; a `CLAUDE.md` path is written to as given, created if absent. The command allocates the next repo-wide code, creates the `## Rules` section when the file has none, and records the directories that carry their own `## Rules` in the root `CLAUDE.md`.

Use single quotes around the rule text to avoid shell escaping issues.

Show the command output — it names the allocated code and the file — then tell the user in one line which rule was added and where.

## Step 5: Fix what broke it

The rule exists because something broke it, so the quoted text is now a live violation. Rectify it in the same pass, without being asked: edit the quoted text in the file the `File:` line named, so it follows the rule you just wrote. Where there was no `File:` line, fix the draft or the text the quote came from.

Fix the instance you were given. Do not sweep the rest of the repo for other violations of the new rule unless the user asks for that.
