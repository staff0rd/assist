import type { HighLevelForeignHunk } from "../../../../../../review/highLevel/types";
import type { Gap } from "../gapAt";

export function elsewhereInGap(
	elsewhere: HighLevelForeignHunk[],
	{ start, end }: Gap,
): string | undefined {
	const notes = elsewhere
		.filter(
			(hunk) => hunk.oldStart >= start && hunk.oldStart < (end ?? Infinity),
		)
		.map((hunk) => `the hunk at ${hunk.header} is in slice ${hunk.slice}`);
	return notes.length > 0 ? notes.join(" · ") : undefined;
}
