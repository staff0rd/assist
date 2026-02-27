---
description: Commit only relevant files from the session
---

Review the git status and create a commit with only the files that are relevant to the current session. Write a clear, concise commit message that describes what changed and why. Do not reference Claude or any AI assistance in the commit message.

First run `assist commit status` to see the current state of the working tree.

Then either:
- `assist commit "your message"` to commit already-staged changes, or
- `assist commit "your message" <file1> <file2> ...` to stage files and commit

Where:
- The first argument is the commit message
- Any subsequent arguments are paths to git add before committing
- The commit message is 40 characters or less
- The commit message does not reference Claude
