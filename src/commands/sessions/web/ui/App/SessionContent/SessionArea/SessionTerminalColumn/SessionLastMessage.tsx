import Box from "@mui/material/Box";
import { useEffect, useRef, useState } from "react";
import { lastMessageSx } from "./SessionLastMessage/lastMessageSx";
import { useDismissablePin } from "./SessionLastMessage/useDismissablePin";
import { useHistoryStep } from "./SessionLastMessage/useHistoryStep";

const noHistory: string[] = [];

export function SessionLastMessage({
	message,
	history = noHistory,
	onFetchHistory,
}: {
	message?: string;
	history?: string[];
	onFetchHistory?: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { pinned, pin } = useDismissablePin(ref);
	const { shown, onWheel } = useHistoryStep(message ?? "", history, !pinned);

	useEffect(() => {
		if (message) onFetchHistory?.();
	}, [message, onFetchHistory]);

	const oneLine = shown.replace(/\s+/g, " ").trim();
	if (!message?.trim()) return null;

	const expanded = hovered || pinned;

	return (
		<Box
			ref={ref}
			sx={lastMessageSx(pinned, expanded)}
			data-testid="session-last-message"
			data-expanded={expanded ? "true" : "false"}
			data-pinned={pinned ? "true" : "false"}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={pin}
			onWheel={onWheel}
		>
			{expanded ? shown.trim() : oneLine}
		</Box>
	);
}
