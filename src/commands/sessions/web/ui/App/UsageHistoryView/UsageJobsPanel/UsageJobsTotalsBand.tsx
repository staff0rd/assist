import Paper from "@mui/material/Paper";
import { formatTokens } from "../../../../../../../shared/formatTokens";
import { formatRelativeTime } from "../../../formatRelativeTime";
import type { UsageJobTotals } from "../fetchUsageJobs";
import { usageJobLabels } from "../usageJobLabels";
import { Stat } from "./UsageJobsTotalsBand/Stat";

const bandSx = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
	mb: 2,
	"& > *:not(:last-child)": { borderRight: 1, borderColor: "divider" },
} as const;
const shortKindLabels: Record<string, string> = {
	"inbox-scan": "inbox",
	review: "review",
};

function runsNote(runsByKind: UsageJobTotals["runsByKind"]): string {
	const parts = Object.entries(runsByKind).map(
		([kind, runs]) => `${runs} ${shortKindLabels[kind] ?? kind}`,
	);
	return parts.join(" · ") || "none";
}

function failureNote(lastFailure: UsageJobTotals["lastFailure"]): string {
	if (!lastFailure) return "none in 30 days";
	const label = (
		usageJobLabels[lastFailure.kind] ?? lastFailure.kind
	).toLowerCase();
	return `last: ${label}, ${formatRelativeTime(lastFailure.startedAt)}`;
}

export function UsageJobsTotalsBand({ totals }: { totals: UsageJobTotals }) {
	return (
		<Paper
			variant="outlined"
			component="section"
			aria-label="Job totals"
			sx={bandSx}
		>
			<Stat
				label="Runs, last 30 days"
				value={String(totals.runs)}
				note={runsNote(totals.runsByKind)}
			/>
			<Stat
				label="Tokens"
				value={`↑ ${formatTokens(totals.inputTokens)} ↓ ${formatTokens(totals.outputTokens)}`}
				note={`+ ${formatTokens(totals.cacheReadTokens)} cache read`}
			/>
			<Stat
				label="Cost"
				value={totals.costUsd === null ? "—" : `$${totals.costUsd.toFixed(2)}`}
				note="Runs that report cost only"
			/>
			<Stat
				label="Failed"
				value={String(totals.failed)}
				note={failureNote(totals.lastFailure)}
				alert={totals.failed > 0}
			/>
		</Paper>
	);
}
