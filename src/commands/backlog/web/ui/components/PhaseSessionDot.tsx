import { Box } from "@mui/material";

const dotSx = {
	width: 6,
	height: 6,
	borderRadius: "50%",
	bgcolor: "currentColor",
	flexShrink: 0,
};

export function PhaseSessionDot() {
	return <Box component="span" sx={dotSx} />;
}
