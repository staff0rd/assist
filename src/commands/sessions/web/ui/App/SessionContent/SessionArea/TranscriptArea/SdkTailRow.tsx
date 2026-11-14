import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { SDK_TAIL_SEPARATOR, SdkTailDetail } from "./SdkTailDetail";

const blink = keyframes`
	0%, 80%, 100% { opacity: 0.25; }
	40% { opacity: 1; }
`;

const rowSx = {
	display: "flex",
	alignItems: "center",
	gap: 1.25,
	py: 0.75,
	pl: 1,
	fontSize: 13,
	color: "text.secondary",
} as const;

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

export function SdkTailRow({
	text,
	suffix,
	process,
}: {
	text: string;
	suffix?: string;
	process?: { command: string; rate?: string };
}) {
	const split = text.indexOf(SDK_TAIL_SEPARATOR);
	const lead = split === -1 ? text : text.slice(0, split);
	const detail =
		split === -1 ? "" : text.slice(split + SDK_TAIL_SEPARATOR.length);
	return (
		<Box sx={rowSx} role="status" aria-live="polite">
			<Box component="span" sx={{ display: "inline-flex", gap: "3px" }}>
				<Box component="span" sx={dotSx("0s")} />
				<Box component="span" sx={dotSx("0.15s")} />
				<Box component="span" sx={dotSx("0.3s")} />
			</Box>
			<span>
				{lead}
				{detail && <SdkTailDetail text={detail} />}
				{suffix && `${SDK_TAIL_SEPARATOR}${suffix}`}
				{process && (
					<SdkTailDetail text={process.command} rate={process.rate} />
				)}
			</span>
		</Box>
	);
}
