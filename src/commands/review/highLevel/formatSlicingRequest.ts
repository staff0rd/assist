import type { HighLevelHunk } from "./listHighLevelHunks";

const RULES = [
	"Each slice is one behaviour end to end: the code, wiring, config, tests and docs that deliver it, so a reviewer can judge whether that behaviour is right.",
	"Never split one behaviour by layer or file type: its command, workflow, generated output, tests and docs stay in one slice.",
	"Split only where the PR does independent things a reviewer could accept or reject separately. Most PRs need one to three slices.",
	"A refactor or move with no behaviour change gets its own slice.",
	"A hunk may appear in more than one slice.",
	"Generated files such as lockfiles get their own slice unless they belong with a specific change.",
	"List slices in reading order.",
];

const MANUAL_TESTING_RULES = [
	"Write PR-wide steps for only what needs a human: looking at a UI, clicking through a page, judging how something reads or looks, or acting in a system an agent cannot drive.",
	"Leave out anything an agent could run and check itself: CLI commands with checkable output, test runs, builds, lint, API or HTTP calls, reading files.",
	"When nothing in the PR needs a human, write `steps: []` and `setup: []`.",
	"`setup` lists what the reviewer must do first: branches to check out, servers or daemons to restart, config to set, data to seed. Keep each entry short.",
	"Each step's `action` says exactly what to open and do: the URL or page and what to click or enter.",
	"Each step's `expect` says what the reviewer should see when the change works.",
	"Name repo files by their path from the repo root, and give URLs in full.",
];

const EXAMPLE = {
	slices: [
		{
			title: "Short imperative title",
			summary: "One or two sentences on what the slice changes.",
			hunks: ["path/to/file.ts#0"],
		},
	],
	manualTesting: {
		setup: ["Restart the web server"],
		steps: [
			{
				action: "Open http://localhost:3000/settings",
				expect: "The new toggle shows under Display",
			},
		],
	},
};

export function formatSlicingRequest(hunks: HighLevelHunk[]): string {
	return [
		"Slicing required: this PR must be split into slices before the review opens.",
		"",
		"Write the slices and the manual testing steps as JSON to a scratch file, then re-run this command with the same arguments plus `--slices <file>`:",
		"",
		JSON.stringify(EXAMPLE, null, 2),
		"",
		'Refer to hunks by the `path#index` labels below. Unknown refs are dropped, and every hunk no slice claims goes into an "Everything else" slice.',
		"",
		"Slicing rules:",
		...RULES.map((rule) => `- ${rule}`),
		"",
		"Manual testing rules:",
		...MANUAL_TESTING_RULES.map((rule) => `- ${rule}`),
		"",
		`Hunks (${hunks.length}):`,
		...hunks.flatMap((hunk) => ["", `### ${hunk.ref}`, hunk.text]),
	].join("\n");
}
