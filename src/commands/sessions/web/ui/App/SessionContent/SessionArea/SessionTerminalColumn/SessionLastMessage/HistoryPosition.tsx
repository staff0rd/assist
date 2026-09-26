import Box from "@mui/material/Box";
import { positionSx } from "./positionSx";

export function HistoryPosition({ position }: { position?: string }) {
	if (!position) return null;
	return (
		<Box
			component="span"
			sx={positionSx}
			data-testid="session-last-message-position"
		>
			{position}
		</Box>
	);
}
