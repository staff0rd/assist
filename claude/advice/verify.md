---
title: Verifying a change
when: verify
---

After any code change, run `assist verify` — it runs this repo's {{verifyCommands}} in parallel and prints only what failed. Run it bare, never piped through `head`, `tail`, `grep`, `rg` or `wc`.
