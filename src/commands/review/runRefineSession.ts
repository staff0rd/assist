import { spawnClaude } from "../../shared/spawnClaude";

function buildRefinePrompt(synthesisPath: string): string {
	return `You are refining a code review synthesis with the user.

Read ${synthesisPath} and walk the user through each finding one at a time. Before asking the user what to do with a finding, do some investigation so you can give an informed opinion:
- Read the referenced file/lines (use the Location field) to confirm the issue is real and current.
- Check nearby code, callers, or related files when the impact depends on context.
- Form a view on whether the finding is applicable, whether the stated severity is right, and whether the recommendation actually fixes the problem.

Then present your assessment briefly (one or two sentences) and ask the user whether to keep it as-is, edit it (e.g. adjust severity, sharpen the recommendation), or drop it. After all existing findings are reviewed, ask whether to add any new findings.

Edit ${synthesisPath} in place so the resulting file is the user's final list:
- To drop a finding, remove its entire \`### Finding:\` block.
- To edit a finding, modify only the fields the user wants changed.
- To add a new finding, append a block in the exact format below under the \`## Findings\` heading.

Each finding block must use this exact format so it parses correctly:

### Finding: <short title>
- Severity: blocker | major | minor | nit
- Source: confirmed | disputed | claude-only | codex-only | already-raised
- Location: \`path/to/file.ext:LINE\` or \`n/a\` when not tied to a specific line
- Impact: one sentence on what could go wrong
- Recommendation: one or two sentences with a concrete change

User-supplied findings should use Source: \`confirmed\`. Use Location \`n/a\` only when the finding is not tied to a specific line.

Do not post anything to a PR; only edit ${synthesisPath}. When the user is done, exit.`;
}

export async function runRefineSession(synthesisPath: string): Promise<void> {
	const { done } = spawnClaude(buildRefinePrompt(synthesisPath), {
		allowEdits: true,
	});
	await done;
}
