import { keyframes } from "@emotion/react";
import { Box } from "@mui/material";

const pulse = keyframes`
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.35; transform: scale(0.7); }
`;

const dotSx = {
	width: 6,
	height: 6,
	borderRadius: "50%",
	bgcolor: "currentColor",
	flexShrink: 0,
};

const pulsingDotSx = {
	...dotSx,
	animation: `${pulse} 1.6s ease-in-out infinite`,
};

export function PhaseSessionDot({ pulsing }: { pulsing: boolean }) {
	return <Box component="span" sx={pulsing ? pulsingDotSx : dotSx} />;
}
