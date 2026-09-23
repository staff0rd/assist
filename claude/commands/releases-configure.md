---
description: Derive this repo's release promotion topology from its workflows and write it to releases.streams
---

The user wants `releases.streams` set for **this repo** — the promotion graph the [Releases page](#releases) draws. You derive it from the repo's own GitHub Actions workflows; the user accepts or edits it; `assist` validates and writes it.

The repo is the one you are in. Resolve it with `gh repo view --json nameWithOwner --jq .nameWithOwner` — never ask the user for it.

## Step 1: Read what is already declared

```
assist releases list
```

A stream already declared for this repo is the starting point — propose a change to it only where you can say why.

## Step 2: Read the workflows

Read them from the checkout you are in (`.github/workflows/`). Where a workflow lives in another repo, read it with `gh api repos/<owner>/<name>/contents/<path> --jq .content | base64 -d`.

A job with `uses: <owner>/<name>/.github/workflows/<file>@<ref>` calls a reusable workflow. Read that file too, from the repo and ref it names, and keep following `uses:` to whatever depth it nests — a deploy three levels down is still a node in the graph. Do not stop at the first level and do not guess what a reusable workflow does from its name.

## Step 3: Derive the graph

- **Streams** — one per release pipeline. A repo releasing two apps has two streams, whether they share a workflow or not. Name each after the thing released, not after the workflow file. `workflow` is the file name of the top-level workflow the promotion runs under, not the reusable ones it calls.
- **Nodes** — one per step worth drawing:
  - a job that deploys to a GitHub environment: `{ id: <short-id>, environment: <name> }`
  - a job that builds or packages and deploys nothing: `{ id: <short-id>, kind: build }`
  - a job or environment approval that only gates promotion: `{ id: <short-id>, kind: gate }`
  - `label` overrides the text drawn on the node; set it only where `id` reads badly.
- **Environment names** must be the names GitHub knows, since live state is read from the repo's deployments against them. Where a reusable workflow takes the name as an input, follow the input back to its value at the call site rather than recording the input's name. Check every one against `gh api repos/<owner>/<name>/environments --jq '.environments[].name'`.
- **Edges** — `[from, to]` for each `needs:` relation between the nodes you kept, flattened across reusable-workflow boundaries: where a job needs a `uses:` job, the edge runs to or from the inner job that actually neighbours it. Fan-in (several nodes into one gate) and fan-out (one node into several) are both expected and must both survive the flattening.

## Step 4: Put the graph to the user

Show the nodes and edges you intend to write, and say which workflow file each node came from — including the reusable ones, so the user can see the chain you followed. Ask them to accept or edit, and ask which config file it goes to:

- `project` — the repo's own `assist.yml`, checked in, so the team sees the same graph
- `repo` — this repo's block in `~/.assist.yml`, personal to this machine

Ask rather than guess: which jobs deserve a node at all, how jobs split into streams, what to call a stream, and any environment name that is computed rather than written literally.

## Step 5: Write the accepted graph

Write the accepted streams to a JSON file and pass it in. `repo` defaults to the repo you are in, so leave it out.

```
assist releases configure --scope project --streams /tmp/streams.json
```

```json
[
	{
		"name": "Web App",
		"workflow": "release.yml",
		"nodes": [
			{ "id": "build", "kind": "build" },
			{ "id": "dev", "environment": "dev" },
			{ "id": "promote", "kind": "gate" },
			{ "id": "eu-prod", "environment": "EU Production", "label": "eu-prod" }
		],
		"edges": [
			["build", "dev"],
			["dev", "promote"],
			["promote", "eu-prod"]
		]
	}
]
```

The array is validated against the config schema as a whole, so a bad node or a dangling edge id leaves the config file untouched and the errors are printed. Streams declared for other repos are kept; the ones for this repo are replaced.

Report what was written and where, quoting the command's own output.
