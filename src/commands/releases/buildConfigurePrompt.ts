const SCHEMA_EXAMPLE = `releases:
  streams:
    - name: Web App
      repo: owner/name
      workflow: release.yml
      nodes:
        - { id: build, kind: build }
        - { id: dev, environment: dev }
        - { id: promote, kind: gate }
        - { id: uk-prod, environment: UK Production, label: uk-prod }
      edges:
        - [build, dev]
        - [dev, promote]
        - [promote, uk-prod]`;

export function buildConfigurePrompt(repo: string): string {
	return `Derive the release promotion topology of ${repo} and write it into assist's config under \`releases.streams\`.

## Read the workflows from GitHub

Do not assume ${repo} is checked out here.

- \`gh api repos/${repo}/contents/.github/workflows --jq '.[].name'\` lists the workflow files.
- \`gh api repos/${repo}/contents/.github/workflows/<file> --jq .content | base64 -d\` reads one.
- A job with \`uses: <owner>/<name>/.github/workflows/<file>@<ref>\` calls a reusable workflow. Read that file too, from the repo and ref it names, and keep following \`uses:\` to any depth — a deploy three levels down is still a node in the graph.

## Derive

- **Streams** — one per release pipeline. A repo releasing two apps has two streams, whether they share a workflow or not. Name each after the thing released, not after the workflow file. \`workflow\` is the file name of the workflow the promotion runs under, the top-level one, not the reusable ones it calls.
- **Nodes** — one per step worth drawing:
  - a job that deploys to a GitHub environment: \`{ id: <short-id>, environment: <name> }\`
  - a job that builds or packages and deploys nothing: \`{ id: <short-id>, kind: build }\`
  - a job or environment approval that only gates promotion: \`{ id: <short-id>, kind: gate }\`
  - \`label\` overrides the text drawn on the node; set it only where \`id\` reads badly.
- **Environment names** must be the names GitHub knows, spelled as the repo's environments spell them — live state is read from the repo's deployments against them. Where a reusable workflow takes the name as an input, follow the input back to its value at the call site rather than recording the input's name. \`gh api repos/${repo}/environments --jq '.environments[].name'\` is the check.
- **Edges** — \`[from, to]\` for each \`needs:\` relation between the nodes you kept, flattened across reusable-workflow boundaries: where a job needs a \`uses:\` job, the edge runs to or from the inner job that actually neighbours it. Fan-in (several nodes into one gate) and fan-out (one node into several) are both expected and must both survive the flattening.

## Confirm before writing

Ask rather than guess: which jobs deserve a node, how jobs split into streams, what to call a stream, and any environment name that is computed rather than written literally. Show the graph you intend to write — nodes and edges — and let me correct it before anything is written.

## Write

Put the block in the assist config of the repo you are running in (\`.claude/assist.yml\` or \`assist.yml\`), or in \`~/.assist.yml\` for one that should follow me everywhere. Ask which if there is any doubt. Keep streams already declared for other repos, and replace the ones whose \`repo\` is \`${repo}\`.

${SCHEMA_EXAMPLE}

Then run \`assist releases list\` to confirm assist reads the block back as you meant it, and exit. Do not run \`assist releases configure\`.`;
}
