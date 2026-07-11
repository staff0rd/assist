import type { PhaseUsage } from "../types";
import { UsageSummary } from "./UsageSummary";

const usageSx = {
	color: "text.secondary",
	fontSize: "0.75rem",
	mb: 1,
	display: "block",
} as const;

/** Compact per-phase cost line: tokens up/down and active (non-waiting) time. */
export function PhaseUsageLine({ usage }: { usage: PhaseUsage }) {
	return <UsageSummary total={usage} sx={usageSx} />;
}
