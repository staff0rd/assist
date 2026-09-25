import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { DiffTotals } from "../diffFileTotals";

const summarySx = {
	flex: "0 0 auto",
	fontVariantNumeric: "tabular-nums",
} as const;

export function DiffCountsSummary({
	totals,
	compact,
}: {
	totals: DiffTotals;
	compact: boolean;
}) {
	if (totals.files === 0) return null;

	return (
		<Typography variant="caption" color="text.disabled" noWrap sx={summarySx}>
			{totals.files} {totals.files === 1 ? "file" : "files"}
			{!compact && (
				<>
					<Box component="span" sx={{ ml: 1, color: "success.main" }}>
						+{totals.added}
					</Box>
					<Box component="span" sx={{ ml: 0.75, color: "error.main" }}>
						−{totals.removed}
					</Box>
				</>
			)}
		</Typography>
	);
}
