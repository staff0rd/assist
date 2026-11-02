import type { HighLevelHunk } from "./listHighLevelHunks";

const RULES = [
	"Each slice is a single coherent change a reviewer can check in one sitting, smaller than a whole feature.",
	"A hunk may appear in more than one slice.",
	"Tests go in the same slice as the code they test, and get their own slice only when they stand alone.",
	"Generated files such as lockfiles get their own slice unless they belong with a specific change.",
	"List slices in reading order.",
];

export function formatSlicingRequest(hunks: HighLevelHunk[]): string {
	return [
		"Slicing required: review.highLevel.slices is on, so this PR must be split into slices before the review opens.",
		"",
		"Write a JSON array of slices to a scratch file, then re-run this command with the same arguments plus `--slices <file>`:",
		"",
		'  [{"title": "Short imperative title", "summary": "One or two sentences on what the slice changes.", "hunks": ["path/to/file.ts#0"]}]',
		"",
		'Refer to hunks by the `path#index` labels below. Unknown refs are dropped, and every hunk no slice claims goes into an "Everything else" slice.',
		"",
		"Slicing rules:",
		...RULES.map((rule) => `- ${rule}`),
		"",
		`Hunks (${hunks.length}):`,
		...hunks.flatMap((hunk) => ["", `### ${hunk.ref}`, hunk.text]),
	].join("\n");
}
