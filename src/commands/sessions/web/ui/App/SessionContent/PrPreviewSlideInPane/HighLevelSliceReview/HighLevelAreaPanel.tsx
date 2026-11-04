import { Box } from "@mui/material";
import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import type { useHighLevelChecklist } from "../HighLevelReviewPane/useHighLevelChecklist";
import { type HighLevelArea, highLevelAreaCheck } from "./highLevelAreaCheck";
import { HighLevelAreaContent } from "./HighLevelAreaContent";
import { HighLevelChecksPanel } from "./HighLevelChecksPanel";
import { highLevelAreaKey } from "./highLevelEntryTicks";
import { HighLevelJudgedArea } from "./HighLevelJudgedArea";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";

export function HighLevelAreaPanel({
	entry,
	area,
	payload,
	checklist,
	comments,
}: {
	entry: HighLevelReviewEntry;
	area: HighLevelArea;
	payload: HighLevelPreviewPayload;
	checklist: ReturnType<typeof useHighLevelChecklist>;
	comments?: HighLevelDiffComments | undefined;
}) {
	if (area === "checks")
		return (
			<HighLevelChecksPanel checks={payload.checks} checklist={checklist} />
		);
	const content = (
		<HighLevelAreaContent
			area={area}
			view={entry.view}
			payload={payload}
			comments={comments}
		/>
	);
	const check = payload.checks.find(
		(candidate) => candidate.id === highLevelAreaCheck(area),
	);
	const key = highLevelAreaKey(entry, area);
	return check && key ? (
		<HighLevelJudgedArea check={check} itemKey={key} checklist={checklist}>
			{content}
		</HighLevelJudgedArea>
	) : (
		<Box role="tabpanel" sx={{ px: 2, py: 1.5, minWidth: 0 }}>
			{content}
		</Box>
	);
}
