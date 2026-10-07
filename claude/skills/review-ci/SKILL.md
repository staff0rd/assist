---
name: review-ci
description: Install a GitHub workflow that reviews new PRs with Claude and Codex through LiteLLM or Azure AI Foundry, without depending on assist
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
| `scripts/review.mjs`               | `.github/review-ci/review.mjs`    |
| `review-ci.yml`                    | `.github/workflows/review-ci.yml` |

For each pair:

- Target missing: create its directory and copy the source.
- Target identical to the source (`cmp -s`): leave it and say it is up to date.
- Target differs: show `diff -u <target> <source>`, then ask the user with AskUserQuestion whether to overwrite that file. Copy only on yes; otherwise leave it and say it was skipped.

Never overwrite a differing target without the user's confirmation.

## 3. Run init

`init.mjs` asks for the config, checks every model can be reached, then sets the repo variables (and the secret, when an API key is used) with `gh`. It needs a terminal for its prompts, and the API key must never pass through this conversation.

The review has three slots: two reviewers and the synthesis. Each slot is `claude:<model>` (run by Claude Code) or `codex:<model>` (run by Codex), so a provider with only GPT deployments can run every slot on Codex.

1. Ask the user for:
   - the provider: `litellm` or `foundry`.
   - the base URL:
     - `litellm`: the proxy root (e.g. `https://litellm.example.com`); Claude uses it directly and Codex uses `<url>/v1`.
     - `foundry`: the Azure AI Foundry resource root, `https://<resource>.services.ai.azure.com`, with no path; Claude uses `<url>/anthropic` and Codex uses `<url>/openai/v1`. The models are the resource's deployment names.
   - each slot as `claude:<model>` or `codex:<model>`: reviewer 1, reviewer 2 and the synthesis.
   - for `foundry`, the auth: an API key, or Entra. Entra is required when the resource has local auth disabled (`az cognitiveservices account show ... --query properties.disableLocalAuth`). For Entra, ask for the client ID and tenant ID of the identity with `Cognitive Services OpenAI User` on the resource, and optionally a GitHub environment to scope its federated credential to.

   Do not ask for the API key.

2. Tell the user to run this in their own terminal from the repo root. Add `--azure-client-id <id> --azure-tenant-id <id> [--environment <name>]` for Entra. Without them, it prompts for the API key with masked input.

   ```
   node .github/review-ci/init.mjs --provider <provider> --base-url <url> --reviewer-1 <harness:model> --reviewer-2 <harness:model> --synthesis <harness:model>
   ```

   With Entra, init checks the models with the user's own `az login` token. Add `--skip-check` if the user's identity cannot reach the models but the CI identity can; the workflow's check step still verifies them.

3. For Entra, the identity needs a federated credential with issuer `https://token.actions.githubusercontent.com`, audience `api://AzureADTokenExchange`, and subject `repo:<owner>/<repo>:environment:<environment>` when an environment was given, otherwise `repo:<owner>/<repo>:pull_request`. Show the user the command, and do not run it yourself:

   ```
   az identity federated-credential create --name review-ci-<repo> --identity-name <identity> --resource-group <rg> --issuer https://token.actions.githubusercontent.com --subject <subject> --audiences api://AzureADTokenExchange
   ```

   (`az ad app federated-credential create` for an app registration.) When an environment was given, it must exist in the repo (`gh api -X PUT repos/<owner>/<repo>/environments/<environment>`).

4. Once they report it finished, confirm with `gh variable list` (and `gh secret list` for an API key) that the variables are set. If init reported an unreachable model, relay its error and let the user re-run it.

## 4. Report

List the files written or skipped, and remind the user to commit `.github/review-ci/` and `.github/workflows/review-ci.yml`. The workflow runs on `pull_request: opened`, skipping PRs opened by bots and GitHub Apps (Snyk, Dependabot and the like), and fails at its check step, naming the problem, when a variable or the secret is unset, the Entra token cannot be obtained, or a model cannot be reached. Its review step then posts the findings as a `COMMENT` review on the PR.
