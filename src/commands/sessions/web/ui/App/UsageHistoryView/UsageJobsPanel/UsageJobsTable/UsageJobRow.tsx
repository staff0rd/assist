import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { formatTokens } from "../../../../../../../../shared/formatTokens";
import { formatActiveTime } from "../../../../../../../backlog/web/ui/components/formatActiveTime";
import { formatRelativeTime } from "../../../../formatRelativeTime";
import type { UsageJobRow as UsageJobRowData } from "../../fetchUsageJobs";
import { UsageJobNoteCell } from "./UsageJobRow/UsageJobNoteCell";
import { UsageJobOutcomeCell } from "./UsageJobRow/UsageJobOutcomeCell";
import { usageJobDetail } from "./UsageJobRow/usageJobDetail";

const numericSx = {
	whiteSpace: "nowrap",
	fontVariantNumeric: "tabular-nums",
} as const;

const jobLabels: Record<string, string> = {
	"inbox-scan": "Inbox scan",
	review: "PR review",
};

const capitalise = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1);

export function UsageJobRow({ row }: { row: UsageJobRowData }) {
	return (
		<TableRow hover>
			<UsageJobNoteCell
				value={jobLabels[row.kind] ?? row.kind}
				note={usageJobDetail(row)}
			/>
			<TableCell sx={{ color: "text.secondary" }}>
				{capitalise(row.trigger)}
			</TableCell>
			<TableCell sx={{ fontFamily: "fontFamilyMono", fontSize: "0.75rem" }}>
				{row.model ?? "—"}
			</TableCell>
			<UsageJobNoteCell
				value={formatRelativeTime(row.startedAt)}
				note={new Date(row.startedAt).toLocaleString()}
				nowrap
			/>
			<TableCell align="right" sx={numericSx}>
				{row.durationMs === null ? "—" : formatActiveTime(row.durationMs)}
			</TableCell>
			<TableCell align="right" sx={numericSx}>
				{`↑ ${formatTokens(row.inputTokens)} ↓ ${formatTokens(row.outputTokens)}`}
			</TableCell>
			<TableCell align="right" sx={{ ...numericSx, color: "text.secondary" }}>
				{`${formatTokens(row.cacheReadTokens)} / ${formatTokens(row.cacheWriteTokens)}`}
			</TableCell>
			<TableCell align="right" sx={numericSx}>
				{row.costUsd === null ? "—" : `$${row.costUsd.toFixed(2)}`}
			</TableCell>
			<UsageJobOutcomeCell status={row.status} />
		</TableRow>
	);
}
