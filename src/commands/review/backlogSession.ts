import { reviewBacklogFeature } from "../../shared/harnessAdapters/reviewFeatures";
import type { ReviewSession } from "./ReviewSession";

export function buildBacklogArgs(synthesisPath: string): string {
	return `add each finding in ${synthesisPath} as a phase

Read ${synthesisPath}. It contains a list of findings under the \`## Findings\` heading, each in a \`### Finding:\` block with Severity, Source, Location, Impact, and Recommendation fields.

File ONE bug backlog item covering the review findings:
- Include EVERY finding in the file as a phase on that single item — including findings whose Source is \`already-raised\`.
- Each phase should be named after its finding's title and its tasks should capture the finding's Location, Impact, and Recommendation.
- File the item with \`assist backlog propose\`, then apply the whole plan with a single \`assist backlog update-plan <id> --json -\` call whose payload lists every finding as a phase. Do not run \`assist backlog add-phase\` per finding — the plan lands in one preview, or not at all.

Important constraints:
- Do not edit ${synthesisPath} — leave it untouched.
- Do not post anything to a PR.
- Do not stage, commit, or push any changes.`;
}

export const backlogSession: ReviewSession = {
	feature: reviewBacklogFeature,
	launch: (adapter, synthesisPath) =>
		adapter.launchSkill("bug", buildBacklogArgs(synthesisPath), {
			cwd: process.cwd(),
			allowEdits: true,
		}),
};
