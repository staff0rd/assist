import Typography from "@mui/material/Typography";

export function SessionErrorText({ error }: { error?: string }) {
	if (!error) return null;
	return (
		<Typography
			variant="caption"
			color="error.main"
			sx={{ display: "block", mt: 0.5 }}
		>
			{error}
		</Typography>
	);
}
