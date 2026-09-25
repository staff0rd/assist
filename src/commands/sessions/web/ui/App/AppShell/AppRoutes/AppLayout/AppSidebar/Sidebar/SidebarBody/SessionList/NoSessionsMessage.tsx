import Typography from "@mui/material/Typography";

const messageSx = {
	display: "block",
	textAlign: "center",
	p: 2,
} as const;

export function NoSessionsMessage() {
	return (
		<Typography variant="caption" color="text.disabled" sx={messageSx}>
			No sessions yet
		</Typography>
	);
}
