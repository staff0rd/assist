---
id: code-quality
title: Refactoring and code quality
group: Repo tooling
order: 4
covers:
  - claude:refactor
  - claude:restructure
  - claude:test-cover
  - claude:test-review
  - config:restructure.ignore
  - config:restructure.pin
  - config:restructure.maxDepth
  - config:restructure.maxPathLength
  - config:complexity.ignore
---

These commands have an agent tidy a TypeScript codebase: split long files, lay folders out by their imports and add tests.

## Splitting long files

Run `/refactor` to have the agent split every file over 100 lines until none are left. Pass a glob to limit it to some files, or `--modified` for only the files you've changed.

When a file has no sensible split, exempt it with [`assist refactor ignore`](../cli-refactor/).

## Restructuring folders

:badge[experimental] Restructuring is still being worked out, and how it places files may change or be removed.

Run `/restructure [root]` to lay out the files under `root` by their imports: a file used by one other file moves into a folder beside it, and a file shared by several sits in the closest folder they have in common. The agent reviews the plan, applies it, rewriting imports, then fixes anything [verify](../verify/) finds broken.

Shape the plan with these keys:

| Key                         | Effect                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `restructure.ignore`        | Globs, relative to the working directory, of files never to move. Files they import are placed beside them                |
| `restructure.pin`           | File names, without extension, to lift out of deep import chains into the folder of the nearest root or pinned file above |
| `restructure.maxDepth`      | The deepest folder level a file may be placed at. Defaults to 10                                                          |
| `restructure.maxPathLength` | The longest path a file may be placed at. Defaults to 200, which leaves room for a Windows checkout under `MAX_PATH`      |

```bash
assist config set restructure.ignore "src/generated/**"
assist config set restructure.pin SessionCard
```

When the plan goes deeper or longer than the limits, pin files to flatten it.

## Approving a comment

Agents can't add code comments by editing a file. When an agent believes one comment genuinely belongs, it asks for it: a single line of up to 50 characters, at a given line. Approve it [with a pin](../hooks-and-permissions/#approving-with-a-pin); refused, the agent has to make the code clearer instead.

## Tests

- `/test-cover [count]` has the agent pick the most valuable untested files, one by default, and write tests for them.
- `/test-review [path]` has the agent review existing tests for weak assertions, coverage gaps and the repo's conventions, and recommend fixes.

## Maintainability

[`assist complexity maintainability`](../cli-refactor/#complexity) scores each file's maintainability. Test files are left out by default; set `complexity.ignore` to change which files are:

```bash
assist config set complexity.ignore "**/*test.ts*,src/generated/**"
```

To give one file its own minimum score in place of `--threshold`, add a `// assist-maintainability-override: 40` comment in its first ten lines, with a score from 0 to 100. Agents can't add, change or remove it, so lowering a file's bar stays your decision.
