import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";

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

const SEPARATOR = " · ";

export function SdkTailRow({
	text,
	suffix,
}: {
	text: string;
	suffix?: string;
}) {
	const split = text.indexOf(SEPARATOR);
	const lead = split === -1 ? text : text.slice(0, split);
	const detail = split === -1 ? "" : text.slice(split + SEPARATOR.length);
	return (
		<Box sx={rowSx} role="status" aria-live="polite">
			<Box component="span" sx={{ display: "inline-flex", gap: "3px" }}>
				<Box component="span" sx={dotSx("0s")} />
				<Box component="span" sx={dotSx("0.15s")} />
				<Box component="span" sx={dotSx("0.3s")} />
			</Box>
			<span>
				{lead}
				{detail && (
					<>
						{SEPARATOR}
						<Box component="span" sx={{ fontFamily: "fontFamilyMono" }}>
							{detail}
						</Box>
					</>
				)}
				{suffix && `${SEPARATOR}${suffix}`}
			</span>
		</Box>
	);
}
