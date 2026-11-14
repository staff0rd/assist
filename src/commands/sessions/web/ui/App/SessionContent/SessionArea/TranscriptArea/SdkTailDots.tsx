import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";

const blink = keyframes`
	0%, 80%, 100% { opacity: 0.25; }
	40% { opacity: 1; }
`;

const dotSx = (delay: string) =>
	({
		width: 5,
		height: 5,
		borderRadius: "50%",
		bgcolor: "success.main",
		animation: `${blink} 1.2s infinite ease-in-out`,
		animationDelay: delay,
		"@media (prefers-reduced-motion: reduce)": { animation: "none" },
	}) as const;

export function SdkTailDots() {
	return (
		<Box component="span" sx={{ display: "inline-flex", gap: "3px" }}>
			<Box component="span" sx={dotSx("0s")} />
			<Box component="span" sx={dotSx("0.15s")} />
			<Box component="span" sx={dotSx("0.3s")} />
		</Box>
	);
}
