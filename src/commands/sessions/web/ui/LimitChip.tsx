import Box from "@mui/material/Box";
import {
	formatRateLimitTimeLeft,
	rateLimitLevel,
} from "../../../../shared/rateLimitLevel";
import { limitLevelColor } from "./limitLevelColor";

type Window = { used_percentage?: number; resets_at?: number };

export function LimitChip({
	window,
	windowSeconds,
	fallbackLabel,
	now,
}: {
	window: Window | undefined;
	windowSeconds: number;
	fallbackLabel: string;
	now: number;
}) {
	const pct = window?.used_percentage;
	if (pct == null) return null;
	const level = rateLimitLevel(pct, window?.resets_at, windowSeconds, now);
	const timeLabel =
		window?.resets_at != null
			? formatRateLimitTimeLeft(window.resets_at, now)
			: fallbackLabel;
	return (
		<Box component="span">
			<Box component="span" sx={{ color: limitLevelColor(level) }}>
				{Math.round(pct)}%
			</Box>{" "}
			<Box component="span" sx={{ color: "text.secondary" }}>
				({timeLabel})
			</Box>
		</Box>
	);
}
