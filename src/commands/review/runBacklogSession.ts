import { spawnClaude } from "../../shared/spawnClaude";

export function buildBacklogPrompt(synthesisPath: string): string {
	return `/bug add each finding in ${synthesisPath} as a phase

Read ${synthesisPath}. It contains a list of findings under the \`## Findings\` heading, each in a \`### Finding:\` block with Severity, Source, Location, Impact, and Recommendation fields.

File ONE bug backlog item covering the review findings:
- Include EVERY finding in the file as a phase on that single item — including findings whose Source is \`already-raised\`.
- Each phase should be named after its finding's title and its tasks should capture the finding's Location, Impact, and Recommendation.
- Use \`assist backlog add\` to create the item, then \`assist backlog add-phase\` for each finding.

Important constraints:
- Do not edit ${synthesisPath} — leave it untouched.
- Do not post anything to a PR.
- Do not stage, commit, or push any changes.`;
}

export async function runBacklogSession(synthesisPath: string): Promise<void> {
	const { done } = spawnClaude(buildBacklogPrompt(synthesisPath), {
		allowEdits: true,
	});
	await done;
}
