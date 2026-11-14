import Box from "@mui/material/Box";
import { SDK_TAIL_SEPARATOR, SdkTailDetail } from "./SdkTailDetail";
import { SdkTailDots } from "./SdkTailDots";

const rowSx = {
	display: "flex",
	alignItems: "center",
	gap: 1.25,
	py: 0.75,
	pl: 1,
	fontSize: 13,
	color: "text.secondary",
} as const;

export function SdkTailRow({
	text,
	suffix,
	process,
}: {
	text: string;
	suffix?: string;
	process?: { command: string; rate?: string; idle?: string };
}) {
	const split = text.indexOf(SDK_TAIL_SEPARATOR);
	const lead = split === -1 ? text : text.slice(0, split);
	const detail =
		split === -1 ? "" : text.slice(split + SDK_TAIL_SEPARATOR.length);
	return (
		<Box sx={rowSx} role="status" aria-live="polite">
			<SdkTailDots />
			<span>
				{lead}
				{detail && <SdkTailDetail text={detail} />}
				{suffix && `${SDK_TAIL_SEPARATOR}${suffix}`}
				{process && (
					<SdkTailDetail
						text={process.command}
						rate={process.rate}
						idle={process.idle}
					/>
				)}
			</span>
		</Box>
	);
}
