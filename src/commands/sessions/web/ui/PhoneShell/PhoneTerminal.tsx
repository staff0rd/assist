import Box from "@mui/material/Box";
import { type Theme, useTheme } from "@mui/material/styles";
import { useMemo, useRef } from "react";
import { useElementWidth } from "../App/useElementWidth";
import { fitFontSize } from "./PhoneTerminal/fitFontSize";
import { measureCharWidthRatio } from "./PhoneTerminal/measureCharWidthRatio";
import { useFollowOutput } from "./PhoneTerminal/useFollowOutput";
import { usePhoneXterm } from "./PhoneTerminal/usePhoneXterm";
import { usePinchZoom } from "./PhoneTerminal/usePinchZoom";

const scrollSx = {
	flex: 1,
	minHeight: 0,
	overflow: "auto",
	overscrollBehavior: "contain",
	WebkitOverflowScrolling: "touch",
	bgcolor: (t: Theme) => t.tokens.terminal.background,
	px: 0.5,
	"& .xterm": { width: "max-content" },
} as const;

type Props = {
	sessionId: string;
	cols?: number;
	rows?: number;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
};

export function PhoneTerminal({
	sessionId,
	cols = 120,
	rows = 30,
	onOutput,
}: Props) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const hostRef = useRef<HTMLDivElement | null>(null);
	const { tokens } = useTheme();
	const ratio = useMemo(
		() => measureCharWidthRatio(tokens.font.terminal),
		[tokens.font.terminal],
	);
	const width = useElementWidth(scrollRef) ?? window.innerWidth;
	const zoom = usePinchZoom(scrollRef);
	const fontSize = fitFontSize(width, cols, ratio, zoom);
	const { follow, trackStick } = useFollowOutput(scrollRef);

	usePhoneXterm(hostRef, sessionId, { cols, rows }, fontSize, onOutput, follow);

	return (
		<Box
			ref={scrollRef}
			sx={scrollSx}
			onScroll={trackStick}
			data-testid="phone-terminal"
		>
			<Box ref={hostRef} />
		</Box>
	);
}
