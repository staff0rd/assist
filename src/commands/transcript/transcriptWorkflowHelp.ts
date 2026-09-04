export function transcriptWorkflowHelp(): string {
	return [
		"",
		"Collapsing several conversations into one transcript — read, select, merge:",
		"",
		"  1. Read   assist transcript clean ./a.vtt --format md --timestamps",
		"            Each speaker turn is prefixed [hh:mm:ss], so the passages worth keeping",
		"            can be cited as ranges. Repeat per source.",
		"",
		"  2. Select Write the ranges to keep, and a reason per dropped passage:",
		'              { "keep": [{ "file": "a.vtt", "from": "00:14:22", "to": "00:19:40" }],',
		'                "removed": ["private", "off-topic"] }',
		"            from/to are matched against the source times printed in step 1.",
		"",
		"  3. Merge  assist transcript merge ./a.vtt ./b.vtt --select ./selection.json --out ./merged.vtt",
		"            Cue times are rebased onto one continuous timeline; the sources, the",
		"            removal count and each passage's original start survive as NOTE blocks.",
	].join("\n");
}
