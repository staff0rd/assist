import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import type { Theme } from "@mui/material/styles";

const barSx = {
	flex: "none",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 1,
	py: 0.5,
	fontSize: 13,
	color: "warning.main",
	bgcolor: (t: Theme) => t.tokens.color.wash.warning,
	borderBottom: 1,
	borderColor: "divider",
} as const;

export function PhoneReconnectingBar() {
	return (
		<Box sx={barSx} role="status" data-testid="phone-reconnecting">
			<CircularProgress size={12} color="inherit" />
			Reconnecting…
		</Box>
	);
}
