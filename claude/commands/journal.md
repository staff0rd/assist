---
description: Append a journal entry summarising recent work, decisions, and notable observations
allowed_args: "[optional focus or note]"
---

Append a structured journal entry to today's daily file. This should be fast — do not read existing journal files or attempt to deduplicate.

## Step 1: Determine the date and file

**IMPORTANT:** Do not rely on your own sense of the current date — it may be stale in long-running sessions. Always run `date +%Y-%m-%d` and `date +%H:%M` via Bash to get the actual current date and time.

The journal lives in `~/.claude/journal/`, one file per day, named `YYYY-MM-DD.md`.

If today's file doesn't exist, create it with a heading:

```markdown
# YYYY-MM-DD
```

## Step 2: Resolve project context

Determine the current project by matching the working directory against `~/.claude/skills/projects.json`. If not inside a registered project, use "general" as the project name.

## Step 3: Write the entry

Append an entry to the daily file. Each entry should follow this structure:

```markdown
## HH:MM — {project name} #{project name}

{Summary of what was done — keep it concise but capture the key points}

**Decisions:** {any notable decisions made and why, or "None"}

**Topics:** {flag anything blog-worthy, reusable, or worth revisiting — or "None"}
```

Tag the project name in the heading (e.g., `#project1`, `#general`). When flagging topics, prefix with `#blog-worthy`, `#reusable`, or `#demo-worthy`:

Guidelines:

- Summarise what was accomplished, not every step taken
- Capture the "why" behind decisions — this is what you'll forget
- Flag blog-worthy topics with a brief note on why it's interesting
- Flag reusable patterns, utilities, or approaches worth extracting
- Flag demo-worthy work — things that would make a good presentation, show-and-tell, or live walkthrough
- If the user provided `$ARGUMENTS`, use it to focus or annotate the entry
- Keep entries concise — a few lines per section, not paragraphs

## Step 4: Write detail files (when topics are flagged)

When a topic is flagged as blog-worthy or reusable, create a supporting detail file that captures the context needed to act on it later. Without this, the journal flags opportunities but loses the detail needed to follow through.

Detail files live in `~/.claude/journal/details/` and are named `YYYY-MM-DD-{slug}.md`.

Link them from the journal entry:

```markdown
**Topics:**

- #blog-worthy Teaching Claude to reflect — [detail](details/2026-02-13-reflect-workflow.md)
- #reusable The skill/hook pattern — [detail](details/2026-02-13-starter-kit.md)
```

Each detail file should include whichever of the following are relevant:

- **Context** — what problem was being solved and why
- **Approach** — what was tried, including dead ends and alternatives considered
- **Key code** — relevant snippets, patterns, or configurations that were created
- **Outcome** — what worked, what didn't, and why
- **Blog angle** — if blog-worthy, what makes it interesting to write about
- **Extraction notes** — if reusable, what could be extracted and how it might be generalised

These files are meant to preserve enough context that someone (including a future Claude session) could flesh out a blog post or extract reusable code without the original conversation.
