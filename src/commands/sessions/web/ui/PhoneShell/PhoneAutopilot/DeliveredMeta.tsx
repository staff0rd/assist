import Box from "@mui/material/Box";
import { formatItemId } from "../../../../../backlog/formatItemId";
import type { AutopilotItemView } from "../../../autopilot/AutopilotItemView";
import { deliveredPill } from "../../App/AppShell/AppRoutes/AutopilotView/deliveredPill";
import { diffSize } from "../../App/AppShell/AppRoutes/AutopilotView/diffSize";
import { statusPillSx } from "../../designSystem/statusPillSx";
import { phoneItemSx as sx } from "./phoneItemSx";

export function DeliveredMeta({
	item,
	stalled,
}: {
	item: AutopilotItemView;
	stalled: boolean;
}) {
	const pill = deliveredPill(item);
	return (
		<>
			<Box component="span" sx={sx.id}>
				{formatItemId(item.id)}
			</Box>
			<Box
				component="span"
				sx={statusPillSx(stalled ? "warning.main" : pill.color)}
			>
				{pill.label}
			</Box>
			<span>{diffSize(item)}</span>
		</>
	);
}
