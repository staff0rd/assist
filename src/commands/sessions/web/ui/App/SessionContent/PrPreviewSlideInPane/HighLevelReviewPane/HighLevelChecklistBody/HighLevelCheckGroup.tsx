import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { HighLevelCheckResult } from "../../../../../../../../review/highLevel/types";
import { HighLevelCheckItem } from "./HighLevelCheckGroup/HighLevelCheckItem";
import type { useHighLevelChecklist } from "../useHighLevelChecklist";

export function HighLevelCheckGroup({
	heading,
	checks,
	checklist,
	details,
}: {
	heading: string;
	checks: HighLevelCheckResult[];
	checklist: ReturnType<typeof useHighLevelChecklist>;
	details: Record<string, ReactNode>;
}) {
	if (checks.length === 0) return null;
	return (
		<Box>
			<Typography
				variant="overline"
				sx={{ px: 2, color: "text.secondary", letterSpacing: 1 }}
			>
				{heading}
			</Typography>
			{checks.map((check) => (
				<HighLevelCheckItem
					key={check.id}
					check={check}
					ticked={checklist.ticked(check.id)}
					comment={checklist.comment(check.id)}
					detail={details[check.id]}
					onTick={(ticked) => checklist.onTick(check.id, ticked)}
					onComment={(comment) => checklist.onComment(check.id, comment)}
				/>
			))}
		</Box>
	);
}
