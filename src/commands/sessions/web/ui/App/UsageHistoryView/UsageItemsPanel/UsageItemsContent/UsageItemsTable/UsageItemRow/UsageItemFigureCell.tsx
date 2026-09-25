import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";

const cellSx = {
	whiteSpace: "nowrap",
	fontVariantNumeric: "tabular-nums",
} as const;

const noteSx = {
	display: "block",
	fontSize: "0.75rem",
	color: "text.disabled",
	whiteSpace: "nowrap",
} as const;

const partialSx = { ...noteSx, fontStyle: "italic" } as const;

export function UsageItemFigureCell({
	total,
	perPhase,
	partial,
}: {
	total: string;
	perPhase?: string;
	partial?: boolean;
}) {
	return (
		<TableCell align="right" sx={cellSx}>
			{total}
			{perPhase ? (
				<Typography component="span" sx={partial ? partialSx : noteSx}>
					{perPhase}
				</Typography>
			) : null}
		</TableCell>
	);
}
