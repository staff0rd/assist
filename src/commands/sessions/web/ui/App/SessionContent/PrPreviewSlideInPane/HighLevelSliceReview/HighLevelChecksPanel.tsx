import { Box } from "@mui/material";
import type { HighLevelCheckResult } from "../../../../../../../review/highLevel/types";
import { HighLevelCheckGroup } from "../HighLevelReviewPane/HighLevelReviewBody/HighLevelChecklistBody/HighLevelCheckGroup";
import type { useHighLevelChecklist } from "../HighLevelReviewPane/useHighLevelChecklist";

export function HighLevelChecksPanel({
	checks,
	checklist,
}: {
	checks: HighLevelCheckResult[];
	checklist: ReturnType<typeof useHighLevelChecklist>;
}) {
	return (
		<Box role="tabpanel" sx={{ py: 1 }}>
			<HighLevelCheckGroup
				heading="Evaluated for you"
				checks={checks.filter((check) => check.kind === "deterministic")}
				checklist={checklist}
				details={{}}
			/>
		</Box>
	);
}
