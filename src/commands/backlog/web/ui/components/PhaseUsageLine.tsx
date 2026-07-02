import { Typography } from "@mui/material";
import type { PhaseUsage } from "../types";
import { formatActiveTime } from "./formatActiveTime";
import { formatTokens } from "./formatTokens";

const usageSx = {
	color: "text.secondary",
	fontSize: "0.75rem",
	mb: 1,
	display: "block",
} as const;

/** Compact per-phase cost line: tokens up/down and active (non-waiting) time. */
export function PhaseUsageLine({ usage }: { usage: PhaseUsage }) {
	return (
		<Typography sx={usageSx}>
			{`↑ ${formatTokens(usage.tokensUp)} ↓ ${formatTokens(
				usage.tokensDown,
			)} · ⏱ ${formatActiveTime(usage.activeMs)}`}
		</Typography>
	);
}
