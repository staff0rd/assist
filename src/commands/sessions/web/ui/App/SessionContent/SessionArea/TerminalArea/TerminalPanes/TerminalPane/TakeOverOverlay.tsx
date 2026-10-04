import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function TakeOverOverlay({ activeNode }: { activeNode?: string }) {
	return (
		<Box
			sx={{
				position: "absolute",
				inset: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				bgcolor: "background.default",
				"&:hover .take-over-label": { color: "text.primary" },
			}}
		>
			<Typography
				className="take-over-label"
				variant="body2"
				color="text.secondary"
			>
				Active on {activeNode ?? "another viewer"} — click to take over
			</Typography>
		</Box>
	);
}
