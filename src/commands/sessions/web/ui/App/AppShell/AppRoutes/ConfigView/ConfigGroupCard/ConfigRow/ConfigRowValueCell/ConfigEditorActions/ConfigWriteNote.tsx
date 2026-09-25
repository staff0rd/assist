import Typography from "@mui/material/Typography";

export function ConfigWriteNote({ note }: { note: string | undefined }) {
	if (!note) return null;
	return (
		<Typography
			variant="caption"
			color="warning.main"
			data-testid="config-item-write-note"
		>
			{note}
		</Typography>
	);
}
