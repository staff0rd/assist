import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import type { ConfigEntry } from "../../../../../../../../../config/readConfigEntries";

type Props = {
	entry: ConfigEntry;
	readOnly: boolean;
};

export function ConfigKeyCell({ entry, readOnly }: Props) {
	return (
		<TableCell sx={{ verticalAlign: "top", width: "35%" }}>
			<Typography variant="body2" sx={{ fontFamily: "monospace" }}>
				{entry.key}
			</Typography>
			{entry.note && (
				<Typography
					variant="caption"
					sx={{ display: "block", mt: 0.25, color: "text.secondary" }}
				>
					{entry.note}
				</Typography>
			)}
			{readOnly && entry.setter && (
				<Typography
					variant="caption"
					sx={{
						display: "block",
						mt: 0.25,
						color: "text.secondary",
						fontFamily: "monospace",
					}}
				>
					{entry.setter}
				</Typography>
			)}
		</TableCell>
	);
}
