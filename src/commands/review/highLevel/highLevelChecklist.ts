export type DeterministicCheckId =
	| "description-what-why"
	| "description-word-cap"
	| "description-links-issue"
	| "ui-evidence";

type ManualCheckId =
	| "structure-sensible"
	| "critical-diffs-correct"
	| "backend-pr-linked";

export type HighLevelCheckId = DeterministicCheckId | ManualCheckId;

export type HighLevelCheck =
	| {
			id: DeterministicCheckId;
			kind: "deterministic";
			title: string;
			backing: string;
	  }
	| { id: ManualCheckId; kind: "manual"; title: string; backing: string };

export const highLevelChecklist: HighLevelCheck[] = [
	{
		id: "description-what-why",
		kind: "deterministic",
		title: "Description has a What and a Why",
		backing: "The PR body's `## What` and `## Why` sections",
	},
	{
		id: "description-word-cap",
		kind: "deterministic",
		title: "Description is under the word cap",
		backing:
			"The PR body's word count against review.highLevel.descriptionWordCap",
	},
	{
		id: "description-links-issue",
		kind: "deterministic",
		title: "Description links the GitHub issue the PR resolves",
		backing: "GitHub issue references in the PR body",
	},
	{
		id: "ui-evidence",
		kind: "deterministic",
		title: "UI changes are evidenced by a screenshot or video",
		backing:
			"Images and videos in the PR body, when a changed file matches review.highLevel.uiPaths",
	},
	{
		id: "structure-sensible",
		kind: "manual",
		title: "The structure of the change is sensible",
		backing:
			"The changed-file tree with add/delete/modify counts and per-file GitHub diff links",
	},
	{
		id: "critical-diffs-correct",
		kind: "manual",
		title: "The critical-file diffs are correct",
		backing: "Full diffs of files matching review.highLevel.criticalPaths",
	},
	{
		id: "backend-pr-linked",
		kind: "manual",
		title: "The backend PR is linked, if the change needs backend work",
		backing: "The PR body",
	},
];
