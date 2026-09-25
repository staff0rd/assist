import Typography from "@mui/material/Typography";

export function EmptyConfigValue({ text }: { text: string }) {
	return (
		<Typography variant="body2" color="text.secondary">
			{text}
		</Typography>
	);
}
