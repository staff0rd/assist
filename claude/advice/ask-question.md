---
title: Asking questions
when: askQuestion
---

In an assist session (`ASSIST_SESSION=1`), don't use the built-in AskUserQuestion tool; the user answers from the session's web preview pane, which can't drive the terminal prompt. Write the same AskUserQuestion input as JSON (`{"questions": [...]}`, 1-4 questions each with `question`, `header`, `multiSelect` and 2-4 `options` of `label`, `description` and optional `preview`) to a scratch file and run `assist ask-question --json - < <file>` as a background task, doing no other work until it returns. It opens as a form in the preview pane and blocks until answered. Answering exits 0 and prints the same answer text AskUserQuestion returns; dismissing exits non-zero, meaning the user declined to answer. To revise a still-pending question, re-run it directly; the earlier task then exits 0 as superseded — ignore its result. Outside an assist session it exits non-zero, so use AskUserQuestion.
