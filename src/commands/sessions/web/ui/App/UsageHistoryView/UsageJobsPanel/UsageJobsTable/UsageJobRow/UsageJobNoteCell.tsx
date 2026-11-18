import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import { sessionTextSize } from "../../../../sessionTextSize";

const noteSx = {
	display: "block",
	fontSize: sessionTextSize("0.75rem"),
	color: "text.secondary",
} as const;

export function UsageJobNoteCell({
	value,
	note,
	nowrap,
}: {
	value: string;
	note: string | null;
	nowrap?: boolean;
}) {
	return (
		<TableCell sx={nowrap ? { whiteSpace: "nowrap" } : undefined}>
			{value}
			{note ? (
				<Typography component="span" sx={noteSx}>
					{note}
				</Typography>
			) : null}
		</TableCell>
	);
}
