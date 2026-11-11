---
title: Fixing command and skill misbehaviour
when: always
---

When fixing a command, skill or agent behaviour that ignores existing guidance, don't add or reword a sentence of prompt text and call it fixed. First find why the existing guidance was ignored (a conflicting instruction that outranks it, such as a CLAUDE.md section, or nothing enforcing it) and remove the cause. Prefer enforcing the behaviour in code (the command refuses or corrects the input, with tests) over more prompt text. Before reporting it fixed, replay the original failing scenario and show it no longer reproduces.
