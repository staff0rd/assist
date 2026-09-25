import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import { statusColors } from "./statusColors";

const spin = keyframes`
	to { transform: rotate(360deg); }
`;

const CENTRE = 8;
const DOT_RADIUS = 3;
const RING_RADIUS = 6.25;
const RING_WIDTH = 1.5;

const dotSx = {
	gridColumn: 1,
	gridRow: 1,
	justifySelf: "center",
	alignSelf: "center",
	display: "block",
	color: statusColors.running,
	"& .verify-ring": {
		fill: "none",
		stroke: "currentColor",
		strokeWidth: RING_WIDTH,
		strokeDasharray: "70 30",
		opacity: 0.45,
		transformBox: "fill-box",
		transformOrigin: "center",
		animation: `${spin} 1.1s linear infinite`,
		"@media (prefers-reduced-motion: reduce)": {
			animation: "none",
			strokeDasharray: "none",
		},
	},
} as const;

export function SessionRunningDot({
	ring = false,
	title = "running",
}: {
	ring?: boolean;
	title?: string;
}) {
	return (
		<Box component="svg" viewBox="0 0 16 16" width={16} height={16} sx={dotSx}>
			<title>{title}</title>
			<circle
				cx={CENTRE}
				cy={CENTRE}
				r={DOT_RADIUS}
				fill="currentColor"
				shapeRendering="geometricPrecision"
			/>
			{ring && (
				<circle
					className="verify-ring"
					cx={CENTRE}
					cy={CENTRE}
					r={RING_RADIUS}
					pathLength={100}
				/>
			)}
		</Box>
	);
}
