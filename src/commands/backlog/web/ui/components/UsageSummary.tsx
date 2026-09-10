import { Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { PhaseUsageTotal } from "../types";
import { formatUsageSummary } from "./formatUsageSummary";

export function UsageSummary({
	total,
	sx,
}: {
	total: PhaseUsageTotal;
	sx?: SxProps<Theme>;
}) {
	return <Typography sx={sx}>{formatUsageSummary(total)}</Typography>;
}
