import { Typography } from "@mui/material";
import type { PhaseUsage } from "../types";
import { formatActiveTime } from "./formatActiveTime";
import { formatTokens } from "./formatTokens";

const totalSx = { color: "text.secondary", fontSize: "0.75rem" } as const;

/** Item-level cost: the sum of every phase's tokens up/down and active time. */
export function ItemUsageTotal({ usage }: { usage: PhaseUsage[] }) {
	const tokensUp = usage.reduce((sum, u) => sum + u.tokensUp, 0);
	const tokensDown = usage.reduce((sum, u) => sum + u.tokensDown, 0);
	const activeMs = usage.reduce((sum, u) => sum + u.activeMs, 0);
	return (
		<Typography sx={totalSx}>
			{`↑ ${formatTokens(tokensUp)} ↓ ${formatTokens(
				tokensDown,
			)} · ⏱ ${formatActiveTime(activeMs)}`}
		</Typography>
	);
}
