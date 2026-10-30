import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export function PullIndicator({
	pull,
	refreshing,
}: {
	pull: number;
	refreshing: boolean;
}) {
	if (pull <= 0 && !refreshing) return null;
	return (
		<Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
			<CircularProgress
				size={20}
				variant={refreshing ? "indeterminate" : "determinate"}
				value={Math.min(100, pull)}
			/>
		</Box>
	);
}
