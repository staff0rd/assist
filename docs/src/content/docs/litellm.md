---
id: litellm
title: LiteLLM
group: Integrations
order: 1
covers:
  - config:litellm.baseUrl
  - config:litellm.apiKey
  - config:harness.codexModel
---

A [LiteLLM](https://docs.litellm.ai/) proxy lets assist run Codex on any model the proxy serves, instead of the account you signed in to Codex with.

## Connecting a proxy

Set the proxy's URL and API key:

```bash
assist config set litellm.baseUrl https://litellm.example.com
assist config set litellm.apiKey sk-...
```

Then [`assist litellm list-models`](../cli-litellm/) lists the models you can pick from.

## Running Codex through the proxy

Set `harness.codexModel` to a model the proxy serves, and every Codex session runs on it:

```bash
assist config set harness.codexModel gpt-5.1-codex
```

Unset it to go back to Codex's own provider, or set it to `codex-default` in a repo to use Codex's own provider there even when a model is set for you elsewhere. The Codex reviewer in a [pull request review](../sessions-pr-review/#choosing-the-codex-model) has its own key, `review.codexModel`.
