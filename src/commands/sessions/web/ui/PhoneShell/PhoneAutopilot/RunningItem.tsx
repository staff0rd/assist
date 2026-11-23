import Box from "@mui/material/Box";
import { formatItemId } from "../../../../../backlog/formatItemId";
import type { AutopilotItemView } from "../../../autopilot/AutopilotItemView";
import { phaseProgress } from "../../App/AppShell/AppRoutes/AutopilotView/phaseProgress";
import { remainingPhasesText } from "../../App/AppShell/AppRoutes/AutopilotView/remainingPhasesText";
import type { PhoneItemHandlers } from "./PhoneItemHandlers";
import { PhoneItemRow } from "./PhoneItemRow";
import { phoneItemSx as sx } from "./phoneItemSx";
import { phoneLiveButtons } from "./phoneLiveButtons";

export function RunningItem({
	item,
	handlers: { busy, onItem, onStop, onOpen },
}: {
	item: AutopilotItemView;
	handlers: PhoneItemHandlers;
}) {
	const label = `phase ${item.phase} of ${item.totalPhases}`;
	const sessionId = item.sessionId;
	return (
		<PhoneItemRow
			dot="primary.main"
			ring
			title={item.name}
			meta={
				<>
					<Box component="span" sx={sx.id}>
						{formatItemId(item.id)}
					</Box>
					<span>{label}</span>
					<Box
						component="span"
						role="progressbar"
						aria-label={label}
						aria-valuenow={Math.round(phaseProgress(item))}
						sx={sx.bar}
					>
						<Box component="i" sx={sx.fill(phaseProgress(item))} />
					</Box>
				</>
			}
			line={item.why ?? "No why line recorded."}
			kv={
				item.remaining.length > 0
					? { key: "next", value: remainingPhasesText(item.remaining) }
					: undefined
			}
			onTap={() => onItem(item.id)}
			actions={phoneLiveButtons({
				busy,
				onStop: () => onStop(item.id),
				onOpen: sessionId ? () => onOpen(sessionId) : undefined,
			})}
		/>
	);
}
