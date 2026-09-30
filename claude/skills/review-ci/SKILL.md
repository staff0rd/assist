---
name: review-ci
description: Install a GitHub workflow that reviews new PRs with Claude and Codex through LiteLLM, without depending on assist
---

Install the review-ci workflow into the current repo. This skill's directory (`~/.claude/skills/review-ci/`) holds the bundled scripts in `scripts/` and the workflow template `review-ci.yml`. The installed workflow and scripts must never install or invoke assist.

## 1. Check the repo

Run `gh repo view --json nameWithOwner -q .nameWithOwner` from the repo root. If it fails, stop and tell the user this must be run inside a GitHub repo that `gh` is authenticated for.

## 2. Copy the files

Copy each source to its target, relative to the repo root:

| Source (in this skill's directory) | Target                            |
| ---------------------------------- | --------------------------------- |
| `scripts/init.mjs`                 | `.github/review-ci/init.mjs`      |
| `scripts/check.mjs`                | `.github/review-ci/check.mjs`     |
| `review-ci.yml`                    | `.github/workflows/review-ci.yml` |

For each pair:

- Target missing: create its directory and copy the source.
- Target identical to the source (`cmp -s`): leave it and say it is up to date.
- Target differs: show `diff -u <target> <source>`, then ask the user with AskUserQuestion whether to overwrite that file. Copy only on yes; otherwise leave it and say it was skipped.

Never overwrite a differing target without the user's confirmation.

## 3. Run init

`init.mjs` asks for the provider, base URL, Claude model, Codex model and API key, checks both models can be reached, then sets the repo variables `ASSIST_REVIEW_PROVIDER`, `ASSIST_REVIEW_BASE_URL`, `ASSIST_REVIEW_CLAUDE_MODEL`, `ASSIST_REVIEW_CODEX_MODEL` and the secret `ASSIST_REVIEW_API_KEY` with `gh`. It needs a terminal for its prompts, and the API key must never pass through this conversation.

1. Ask the user for the base URL (e.g. `https://litellm.example.com`), the Claude model and the Codex model, as the provider's model names. The provider is `litellm`. Do not ask for the API key.
2. Tell the user to run this in their own terminal from the repo root, where it prompts for the API key with masked input:

   ```
   node .github/review-ci/init.mjs --provider litellm --base-url <url> --claude-model <model> --codex-model <model>
   ```

3. Once they report it finished, confirm with `gh variable list` and `gh secret list` that the four variables and the secret are set. If init reported an unreachable model, relay its error and let the user re-run it.

## 4. Report

List the files written or skipped, and remind the user to commit `.github/review-ci/` and `.github/workflows/review-ci.yml`. The workflow runs on `pull_request: opened` and fails at its check step, naming the problem, when a variable or the secret is unset or a model cannot be reached.
