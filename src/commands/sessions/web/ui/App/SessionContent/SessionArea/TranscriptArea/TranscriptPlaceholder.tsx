import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

const centeredSx = {
	position: "absolute",
	inset: 0,
	display: "flex",
	flexDirection: "column",
	gap: 1.5,
	alignItems: "center",
	justifyContent: "center",
} as const;

export function TranscriptPlaceholder({ loading }: { loading: boolean }) {
	return (
		<Box sx={centeredSx}>
			{loading ? (
				<>
					<CircularProgress size={20} />
					<Typography variant="caption" color="text.disabled">
						Loading transcript…
					</Typography>
				</>
			) : (
				<Typography variant="body2" color="text.disabled">
					No transcript available
				</Typography>
			)}
		</Box>
	);
}
