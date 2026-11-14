import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SummaryRow } from "./SummaryRow";

export function RuleChangeRows({ rows }: { rows: SummaryRow[] }) {
	return rows.map(({ label, before, after }) => (
		<Box key={label}>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
			{before !== undefined && (
				<Typography
					variant="body2"
					component="del"
					color="text.secondary"
					sx={{ display: "block" }}
				>
					{before || "(none)"}
				</Typography>
			)}
			<Typography variant="body2" sx={{ textWrap: "pretty" }}>
				{after || "(none)"}
			</Typography>
		</Box>
	));
}
