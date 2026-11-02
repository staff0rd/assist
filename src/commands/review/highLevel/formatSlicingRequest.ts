import type { HighLevelHunk } from "./listHighLevelHunks";

const RULES = [
	"Each slice is a single coherent change a reviewer can check in one sitting, smaller than a whole feature.",
	"A hunk may appear in more than one slice.",
	"Tests go in the same slice as the code they test, and get their own slice only when they stand alone.",
	"Generated files such as lockfiles get their own slice unless they belong with a specific change.",
	"List slices in reading order.",
];

const MANUAL_TESTING_RULES = [
	"Write PR-wide steps that let a reviewer exercise the change by hand without reading the diff, derived from the hunks.",
	"`setup` lists what to do first: branches to check out, servers or daemons to restart, config to set, data to seed. Keep each entry short.",
	"Each step's `action` says exactly what to run or open: the command, the URL or the page and what to click.",
	"Each step's `expect` says what the reviewer should see when the change works.",
	"Name repo files by their path from the repo root, and give URLs in full.",
	"When the change has no observable behaviour (refactors, docs, types), write one step saying which existing command or test shows nothing changed.",
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
		"Slicing required: review.highLevel.slices is on, so this PR must be split into slices before the review opens.",
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
