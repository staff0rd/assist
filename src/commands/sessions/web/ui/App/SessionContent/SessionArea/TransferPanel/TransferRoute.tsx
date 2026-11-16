import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";

const travel = keyframes`
	from { transform: translateX(-100%); }
	to { transform: translateX(340%); }
`;

const routeSx = {
	display: "flex",
	alignItems: "center",
	gap: 1.25,
	fontFamily: "fontFamilyMono",
	fontSize: "0.8125rem",
} as const;

const nodeSx = {
	border: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
	px: 1.25,
	py: 0.5,
	borderRadius: 1,
} as const;

const targetSx = {
	...nodeSx,
	borderColor: "primary.main",
	color: "primary.main",
};

const trackSx = {
	width: 72,
	height: 2,
	bgcolor: "divider",
	position: "relative",
	overflow: "hidden",
	borderRadius: 1,
	"&::after": {
		content: '""',
		position: "absolute",
		inset: 0,
		width: "30%",
		bgcolor: "primary.main",
		animation: `${travel} 1.2s ease-in-out infinite`,
		"@media (prefers-reduced-motion: reduce)": { animation: "none" },
	},
} as const;

export function TransferRoute({
	source,
	target,
}: {
	source: string;
	target: string;
}) {
	return (
		<Box sx={routeSx}>
			<Box component="span" sx={nodeSx} data-testid="transfer-source">
				{source}
			</Box>
			<Box component="span" sx={trackSx} />
			<Box component="span" sx={targetSx} data-testid="transfer-target">
				{target}
			</Box>
		</Box>
	);
}
