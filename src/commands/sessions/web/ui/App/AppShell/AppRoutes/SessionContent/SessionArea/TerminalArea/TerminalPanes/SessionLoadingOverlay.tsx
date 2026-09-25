import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export function SessionLoadingOverlay() {
	return (
		<Box
			sx={{
				position: "absolute",
				inset: 0,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 2,
				bgcolor: "background.default",
			}}
		>
			<CircularProgress size={28} />
			<Typography variant="body2" color="text.disabled">
				Starting session…
			</Typography>
		</Box>
	);
}
