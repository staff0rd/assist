---
description: File a bug with reproduction steps, expected and actual behavior
allowed_args: "[short description of the bug]"
---

You are helping the user file a bug report as a backlog item. Your goal is to extract the minimum information needed: what happens, what should happen, and how to reproduce it.

## Step 1: Understand the bug

If the user provided a description via $ARGUMENTS, use that as a starting point. Otherwise, ask what's going wrong.

## Step 2: Gather details

Ask short, targeted questions one at a time to fill in any gaps. You need three things:

1. **Reproduction steps** — what does the user do to trigger the bug?
2. **Expected behavior** — what should happen?
3. **Actual behavior** — what happens instead?

Skip questions the user has already answered. Stop asking as soon as you have enough to write a clear bug report — don't over-interrogate.

## Step 3: Propose the item

Show the user the bug report:

**Name:** (concise title)
**Type:** bug
**Description:**
**Repro:** (numbered steps)
**Expected:** ...
**Actual:** ...

**Acceptance Criteria:**
- (conditions that confirm the bug is fixed)

Do NOT generate a plan — the implementer will determine how to fix it.

## Step 4: Iterate

Ask the user if they want to change anything. Iterate until they confirm.

## Step 5: Save

Once confirmed, pipe the JSON to the CLI. The JSON must match this shape:

```json
{
  "name": "...",
  "type": "bug",
  "description": "**Repro:**\n1. ...\n\n**Expected:** ...\n\n**Actual:** ...",
  "acceptanceCriteria": ["...", "..."]
}
```

Run:
```
echo '<the confirmed json>' | assist backlog add --json 2>&1
```

Then show the user the item was created and suggest they can run `assist backlog run <id>` to start implementation.
