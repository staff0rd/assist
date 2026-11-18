import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export function ReopeningPlaceholder({ prNumber }: { prNumber: number }) {
	return (
		<Box
			role="status"
			sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2 }}
		>
			<CircularProgress size={20} />
			<Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
				<Typography variant="body2">
					Reopening high-level review for #{prNumber}…
				</Typography>
				<Typography variant="caption" color="text.secondary">
					Gathering the PR and saved slices
				</Typography>
			</Box>
		</Box>
	);
}
