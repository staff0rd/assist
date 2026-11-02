import type { HighLevelTreeFile } from "../../../../../../../../../../review/highLevel/types";
import { HighLevelTreeIgnoredChip } from "../../HighLevelTreeIgnoredChip";
import { HighLevelTreeSplitChip } from "../../HighLevelTreeSplitChip";
import { HighLevelTreeTag } from "../../HighLevelTreeTag";

export function HighLevelTreeFileTags({
	file,
	ignoredBy,
}: {
	file: HighLevelTreeFile;
	ignoredBy: string | undefined;
}) {
	return (
		<>
			{ignoredBy !== undefined && (
				<HighLevelTreeIgnoredChip label="ignored" globs={[ignoredBy]} />
			)}
			{file.critical && (
				<HighLevelTreeTag
					label="critical"
					title="Matches review.highLevel.criticalPaths"
					tone="critical"
				/>
			)}
			{file.split && <HighLevelTreeSplitChip split={file.split} />}
		</>
	);
}
