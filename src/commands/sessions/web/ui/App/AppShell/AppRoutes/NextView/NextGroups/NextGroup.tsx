import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { NextChipLabel } from "../NextChipLabel";
import type { NextChip } from "../nextChips";
import { sessionTextSize } from "../../../../sessionTextSize";

const groupTitleSx = {
	fontSize: sessionTextSize(14),
	fontWeight: 600,
} as const;

const countSx = (t: Theme) => ({
	color: "text.disabled",
	fontFamily: t.typography.fontFamilyMono,
	fontSize: sessionTextSize(12),
});

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
				<NextChipLabel chip={chip} />
				<Typography variant="subtitle2" component="h3" sx={groupTitleSx}>
					{title}
				</Typography>
				<Typography variant="body2" sx={countSx}>
					{count}
				</Typography>
			</Stack>
			{error && (
				<Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
					{error}
				</Alert>
			)}
			{rows.length > 0 && (
				<Paper variant="outlined" sx={{ overflow: "hidden" }}>
					{rows}
				</Paper>
			)}
		</Stack>
	);
}
