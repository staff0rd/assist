import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { type RefObject, useRef } from "react";
import type { ResizeMode } from "../ResizeFn";
import { usePhoneFontSize } from "./PhoneTerminal/usePhoneFontSize";
import { usePhoneScroll } from "./PhoneTerminal/usePhoneScroll";
import { usePhoneTakeOver } from "./PhoneTerminal/usePhoneTakeOver";
import { usePhoneXterm } from "./PhoneTerminal/usePhoneXterm";

const scrollSx = {
	flex: 1,
	minHeight: 0,
	overflow: "auto",
	overscrollBehavior: "contain",
	WebkitOverflowScrolling: "touch",
	bgcolor: (t: Theme) => t.tokens.terminal.background,
	"& .xterm": { width: "max-content" },
} as const;

type Props = {
	sessionId: string;
	cols?: number;
	rows?: number;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
	sendSize: (cols: number, rows: number, mode?: ResizeMode) => void;
	reclaimRef: RefObject<(() => void) | null>;
};

export function PhoneTerminal({
	sessionId,
	cols = 120,
	rows = 30,
	onOutput,
	sendSize,
	reclaimRef,
}: Props) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const hostRef = useRef<HTMLDivElement | null>(null);
	const { ratio, fontSize } = usePhoneFontSize(scrollRef, cols);
	const { termRef, follow, trackStick } = usePhoneScroll(scrollRef);
	reclaimRef.current = usePhoneTakeOver(scrollRef, ratio, sendSize);

	usePhoneXterm(
		hostRef,
		termRef,
		sessionId,
		{ cols, rows },
		fontSize,
		onOutput,
		follow,
	);

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
