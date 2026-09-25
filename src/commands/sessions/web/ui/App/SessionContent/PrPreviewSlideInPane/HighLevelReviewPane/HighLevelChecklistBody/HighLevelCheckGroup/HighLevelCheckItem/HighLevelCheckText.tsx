import { Typography } from "@mui/material";
import type { HighLevelCheckResult } from "../../../../../../../../../../review/highLevel/types";

export function HighLevelCheckText({
	check,
	failed,
}: {
	check: HighLevelCheckResult;
	failed: boolean;
}) {
	return (
		<>
			<Typography
				variant="body2"
				sx={{ fontWeight: 600, color: failed ? "error.main" : undefined }}
			>
				{check.title}
			</Typography>
			<Typography
				variant="caption"
				sx={{
					display: "block",
					color: failed ? "error.main" : "text.secondary",
				}}
			>
				{failed ? `Fails: ${check.reason}` : check.reason}
			</Typography>
		</>
	);
}
