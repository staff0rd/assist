import { Box } from "@mui/material";
import type { ReactNode } from "react";
import type { HighLevelCheckResult } from "../../../../../../../review/highLevel/types";
import { HighLevelCheckItem } from "../HighLevelReviewPane/HighLevelReviewBody/HighLevelChecklistBody/HighLevelCheckGroup/HighLevelCheckItem";
import type { useHighLevelChecklist } from "../HighLevelReviewPane/useHighLevelChecklist";

export function HighLevelJudgedArea({
	check,
	itemKey,
	checklist,
	children,
}: {
	check: HighLevelCheckResult;
	itemKey: string;
	checklist: ReturnType<typeof useHighLevelChecklist>;
	children: ReactNode;
}) {
	return (
		<Box role="tabpanel" sx={{ py: 0.5, minWidth: 0 }}>
			<HighLevelCheckItem
				check={check}
				ticked={checklist.ticked(itemKey)}
				comment={checklist.comment(itemKey)}
				onTick={(ticked) => checklist.onTick(itemKey, ticked)}
				onComment={(comment) => checklist.onComment(itemKey, comment)}
				detail={<Box sx={{ mt: 1, minWidth: 0 }}>{children}</Box>}
			/>
		</Box>
	);
}
