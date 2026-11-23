import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

export function RunningActions({
	busy,
	onStop,
	onOpen,
}: {
	busy: boolean;
	onStop: () => void;
	onOpen: () => void;
}) {
	return (
		<Box sx={{ display: "flex", gap: 1 }}>
			<Button
				variant="outlined"
				color="error"
				size="small"
				disabled={busy}
				onClick={onStop}
			>
				Stop
			</Button>
			<Button variant="outlined" size="small" onClick={onOpen}>
				Open session
			</Button>
		</Box>
	);
}
