import type { ConfigKeyQuestion } from "../../config/resolveConfigKeyAnswer";
import type { ProposedGlobs } from "./ProposedGlobs";
import type { HighLevelConfig } from "./resolveHighLevelConfig";

export function buildHighLevelQuestions(
	current: HighLevelConfig,
	proposed: ProposedGlobs,
): ConfigKeyQuestion[] {
	return [
		{
			key: "review.highLevel.criticalPaths",
			question:
				"Critical paths — comma-separated globs whose full diffs the review shows (blank to leave unset)",
			suggest: suggestGlobs(current.criticalPaths, proposed.criticalPaths),
		},
		{
			key: "review.highLevel.uiPaths",
			question:
				"UI paths — comma-separated globs that make a change a UI change, so a screenshot or video is required (blank to leave unset)",
			suggest: suggestGlobs(current.uiPaths, proposed.uiPaths),
		},
		{
			key: "review.highLevel.descriptionWordCap",
			question: "Description word cap (blank to leave unset)",
			suggest: String(current.descriptionWordCap),
		},
	];
}

function suggestGlobs(
	current: string[],
	proposed: string[],
): string | undefined {
	const globs = current.length > 0 ? current : proposed;
	return globs.length > 0 ? globs.join(",") : undefined;
}
