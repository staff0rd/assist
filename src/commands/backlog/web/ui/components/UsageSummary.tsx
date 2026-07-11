import { Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { PhaseUsageTotal } from "../types";
import { formatActiveTime } from "./formatActiveTime";
import { formatTokens } from "../../../../../shared/formatTokens";

export function UsageSummary({
	total,
	sx,
}: {
	total: PhaseUsageTotal;
	sx?: SxProps<Theme>;
}) {
	const peak =
		total.peakContextPct > 0 ? ` · ▓ ${Math.round(total.peakContextPct)}%` : "";
	return (
		<Typography sx={sx}>
			{`↑ ${formatTokens(total.tokensUp)} ↓ ${formatTokens(
				total.tokensDown,
			)} · ⏱ ${formatActiveTime(total.activeMs)}${peak}`}
		</Typography>
	);
}
