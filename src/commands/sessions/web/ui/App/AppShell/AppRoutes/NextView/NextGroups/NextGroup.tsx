import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { NextChip } from "../nextChips";

export function NextGroup({
	chip,
	title,
	count,
	error,
	rows,
}: {
	chip: NextChip;
	title: string;
	count: number;
	error: string | null;
	rows: ReactNode[];
}) {
	if (rows.length === 0 && !error) return null;
	return (
		<Stack spacing={1} component="section">
			<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
				<Chip
					label={chip.label}
					size="small"
					color={chip.color}
					variant="outlined"
				/>
				<Typography variant="subtitle2" component="h3">
					{title}
				</Typography>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{count}
				</Typography>
			</Stack>
			{error && <Alert severity="error">{error}</Alert>}
			{rows.length > 0 && (
				<Paper variant="outlined" sx={{ overflow: "hidden" }}>
					{rows}
				</Paper>
			)}
		</Stack>
	);
}
