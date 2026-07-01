---
description: Format and summarise meeting transcripts end to end
---

Drain the transcript pick-up directory: for every raw `.vtt`, convert it to a dated markdown transcript and write a summary alongside it. Loop until nothing is left.

Repeat the steps below until `assist transcript list` prints nothing.

## Step 1: List

```bash
assist transcript list
```

Each line is the bare filename of a raw `.vtt` waiting to be processed.

- **No output** — every transcript is done. Stop.
- **One or more lines** — take the first filename and process it with the remaining steps, then return here.

## Step 2: Determine the client and date

Work out the **client** and meeting **date** (`YYYY-MM-DD`) for the file:

- Prefer a client name and `YYYY-MM-DD` date already present in the filename.
- If the filename isn't clear, read the raw `.vtt` to infer them from the meeting content. The file lives at `<vttDir>/<filename>`, where `vttDir` is the `transcript.vttDir` value in `.claude/assist.yml` (or `assist.yml`).
- Only if you still cannot confidently determine the client or date, ask the user for the missing value(s). Do **not** ask when you can infer them.

## Step 3: Move

Convert the raw `.vtt` to a dated markdown transcript and archive the original:

```bash
assist transcript move "<filename>" --date <YYYY-MM-DD> --client "<client>"
```

`move` prints two labelled paths:

- **`Formatted transcript:`** — the formatted transcript it just wrote
- **`Summary target:`** — the summary target path to create in the next step

## Step 4: Write the summary

Read the formatted transcript (the `Formatted transcript:` path) and write a concise summary to the summary target path (the `Summary target:` path). The summary must start with a link back to the transcript:

```
[Full Transcript](<relative path from the summary file's directory to the formatted transcript>)
```

Then return to Step 1.
