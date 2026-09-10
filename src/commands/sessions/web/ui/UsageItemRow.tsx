import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { formatTokens } from "../../../../shared/formatTokens";
import { formatActiveTime } from "../../../backlog/web/ui/components/formatActiveTime";
import type { UsageItemRow as UsageItemRowData } from "./fetchUsageItems";
import { formatRelativeTime } from "./formatRelativeTime";
import { contextColor } from "./statusColors";
import { UsageItemFigureCell } from "./UsageItemFigureCell";
import { UsageItemNameCell } from "./UsageItemNameCell";
import { usageItemPerPhase } from "./usageItemPerPhase";
import { usageItemPhaseNote } from "./usageItemPhaseNote";
import { UsageItemStatusCell } from "./UsageItemStatusCell";

const numericSx = {
	whiteSpace: "nowrap",
	fontVariantNumeric: "tabular-nums",
} as const;

export function UsageItemRow({
	row,
	repoLabel,
}: {
	row: UsageItemRowData;
	repoLabel: string;
}) {
	const perPhase = usageItemPerPhase(row);
	return (
		<TableRow hover>
			<UsageItemNameCell
				id={row.id}
				name={row.name}
				type={row.type}
				repoLabel={repoLabel}
			/>
			<UsageItemStatusCell status={row.status} />
			<UsageItemFigureCell
				total={String(row.phaseCount || row.recordedPhases)}
				perPhase={usageItemPhaseNote(row)}
				partial
			/>
			<UsageItemFigureCell
				total={formatActiveTime(row.activeMs)}
				perPhase={perPhase.active}
			/>
			<UsageItemFigureCell
				total={`↑ ${formatTokens(row.tokensUp)} ↓ ${formatTokens(row.tokensDown)}`}
				perPhase={perPhase.tokens}
			/>
			<TableCell align="right" sx={numericSx}>
				<Box component="span" sx={{ color: contextColor(row.peakContextPct) }}>
					{Math.round(row.peakContextPct)}%
				</Box>
			</TableCell>
			<TableCell align="right" sx={numericSx}>
				{row.lastPhaseAt ? formatRelativeTime(row.lastPhaseAt) : "—"}
			</TableCell>
		</TableRow>
	);
}
