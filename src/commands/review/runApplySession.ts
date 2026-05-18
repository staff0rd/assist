import { spawnClaude } from "../../shared/spawnClaude";

function buildApplyPrompt(synthesisPath: string): string {
	return `You are helping the user apply fixes for a code review with each finding decided one at a time.

Read ${synthesisPath}. It contains a list of findings under the \`## Findings\` heading. Each finding is a block in this exact format:

### Finding: <short title>
- Severity: blocker | major | minor | nit
- Source: confirmed | disputed | claude-only | codex-only | already-raised
- Location: \`path/to/file.ext:LINE\` or \`n/a\` when not tied to a specific line
- Impact: one sentence on what could go wrong
- Recommendation: one or two sentences with a concrete change

For every finding whose Source is NOT \`already-raised\`, walk through it with the user one at a time:
1. Read the referenced file/lines (use the Location field) and any nearby code needed to understand the impact.
2. Present a short assessment (one or two sentences) of whether the finding is real and what the right fix is.
3. Ask the user: apply or skip?
   - On 'apply': edit the relevant file(s) in place to fix the issue, then remove that finding's entire \`### Finding:\` block from ${synthesisPath} (including any blank line that separated it from the next block).
   - On 'skip': leave the finding block in ${synthesisPath} unchanged and move on.

Skip findings whose Source is \`already-raised\` entirely — do not present them and do not remove them from ${synthesisPath}.

Important constraints:
- Do not stage, commit, or push any changes. Leave all code edits unstaged in the working tree.
- Do not post anything to a PR.
- Only modify ${synthesisPath} by removing the blocks for findings the user chose to apply. Do not edit the wording of any remaining finding block.
- When every non-already-raised finding has been decided, briefly summarise what was applied vs skipped and exit.`;
}

export async function runApplySession(synthesisPath: string): Promise<void> {
	const { done } = spawnClaude(buildApplyPrompt(synthesisPath), {
		allowEdits: true,
	});
	await done;
}
