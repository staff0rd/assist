import { Box } from "@mui/material";
import type { HighLevelPreviewPayload } from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import type { useHighLevelChecklist } from "./HighLevelReviewPane/useHighLevelChecklist";
import { highLevelNarrow } from "./HighLevelSliceReview/highLevelNarrow";
import type { HighLevelReviewEntry } from "./HighLevelSliceReview/highLevelReviewEntries";
import { HighLevelReviewMain } from "./HighLevelSliceReview/HighLevelReviewMain";
import { HighLevelReviewRail } from "./HighLevelSliceReview/HighLevelReviewRail";
import type { useHighLevelReviewNav } from "./HighLevelSliceReview/useHighLevelReviewNav";

const frameSx = {
	flex: 1,
	minHeight: 0,
	containerType: "inline-size",
	containerName: "high-level-review",
	display: "grid",
	gridTemplateColumns: "248px minmax(0, 1fr)",
	gridTemplateRows: "minmax(0, 1fr)",
	[highLevelNarrow]: {
		gridTemplateColumns: "minmax(0, 1fr)",
		gridTemplateRows: "auto minmax(0, 1fr)",
	},
} as const;

export function HighLevelSliceReview({
	entries,
	...main
}: {
	payload: HighLevelPreviewPayload;
	entries: HighLevelReviewEntry[];
	nav: ReturnType<typeof useHighLevelReviewNav>;
	checklist: ReturnType<typeof useHighLevelChecklist>;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<Box sx={frameSx}>
			<HighLevelReviewRail
				entries={entries}
				current={main.nav.index}
				ticked={main.checklist.ticked}
				onPick={(index) => main.nav.pick(index)}
			/>
			<HighLevelReviewMain {...main} />
		</Box>
	);
}
