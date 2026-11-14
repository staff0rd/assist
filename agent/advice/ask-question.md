---
title: Asking questions
when: askQuestion
---

Don't use the built-in AskUserQuestion tool; the user answers from the session's web preview pane, which can't drive the terminal prompt. Write the same AskUserQuestion input as JSON (`{"questions": [...]}`, 1-4 questions each with `question` (at most 30 words), optional `context` (at most 40 words, shown above the question to say why you're asking), `header`, `multiSelect` and 2-4 `options` of `label`, `description` and optional `preview`) to a scratch file and run `assist ask-question --json - < <file>` {{previewWait}}. It opens as a form in the preview pane. Answering exits 0 and prints the same answer text AskUserQuestion returns; dismissing exits non-zero, meaning the user declined to answer. {{previewRevise}}
