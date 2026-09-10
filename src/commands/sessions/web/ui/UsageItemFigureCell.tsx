import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";

const cellSx = {
	whiteSpace: "nowrap",
	fontVariantNumeric: "tabular-nums",
} as const;

const perPhaseSx = {
	display: "block",
	fontSize: "0.75rem",
	color: "text.disabled",
	whiteSpace: "nowrap",
} as const;

export function UsageItemFigureCell({
	total,
	perPhase,
}: {
	total: string;
	perPhase: string;
}) {
	return (
		<TableCell align="right" sx={cellSx}>
			{total}
			<Typography component="span" sx={perPhaseSx}>
				{perPhase}
			</Typography>
		</TableCell>
	);
}
