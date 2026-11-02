export type DeterministicCheckId =
	| "description-what-why"
	| "description-word-cap"
	| "description-links-issue"
	| "ui-evidence"
	| "no-merge-conflicts";

type ManualCheckId =
	| "structure-sensible"
	| "critical-diffs-correct"
	| "tests-worth-having"
	| "manual-testing"
	| "backend-pr-linked";

export type HighLevelCheckId = DeterministicCheckId | ManualCheckId;

export type HighLevelCheck =
	| {
			id: DeterministicCheckId;
			kind: "deterministic";
			title: string;
			backing: string;
	  }
	| {
			id: ManualCheckId;
			kind: "manual";
			title: string;
			short: string;
			backing: string;
	  };

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
		title: "PR links the GitHub issue it resolves",
		backing:
			"A Development-linked issue or a GitHub issue reference in the PR body",
	},
	{
		id: "ui-evidence",
		kind: "deterministic",
		title: "UI changes are evidenced by a screenshot or video",
		backing:
			"Images and videos in the PR body, when a changed file matches review.highLevel.uiPaths",
	},
	{
		id: "no-merge-conflicts",
		kind: "deterministic",
		title: "No merge conflicts",
		backing: "GitHub's mergeable state for the PR against its base branch",
	},
	{
		id: "structure-sensible",
		kind: "manual",
		title: "The structure of the change is sensible",
		short: "Structure",
		backing:
			"The changed-file tree with add/delete/modify counts and per-file GitHub diff links",
	},
	{
		id: "critical-diffs-correct",
		kind: "manual",
		title: "The critical-file diffs are correct",
		short: "Critical diffs",
		backing: "Full diffs of files matching review.highLevel.criticalPaths",
	},
	{
		id: "tests-worth-having",
		kind: "manual",
		title: "The tests are worth having",
		short: "Tests",
		backing:
			"The describe/it hierarchy of changed tests in files matching review.highLevel.testPaths",
	},
	{
		id: "manual-testing",
		kind: "manual",
		title: "The change can be exercised by hand",
		short: "Manual testing",
		backing:
			"Setup and numbered action → expected steps written by the slicing agent",
	},
	{
		id: "backend-pr-linked",
		kind: "manual",
		title: "The backend PR is linked, if the change needs backend work",
		short: "Backend PR",
		backing: "The PR body",
	},
];
