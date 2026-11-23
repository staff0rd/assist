import Button from "@mui/material/Button";
import type { AutopilotItemView } from "../../../autopilot/AutopilotItemView";
import { deliveredLine } from "../../App/AppShell/AppRoutes/AutopilotView/deliveredLine";
import { DeliveredMeta } from "./DeliveredMeta";
import type { PhoneItemHandlers } from "./PhoneItemHandlers";
import { PhoneItemRow } from "./PhoneItemRow";
import { phoneItemButtonSx as buttonSx } from "./phoneItemButtonSx";

const dotColor = (item: AutopilotItemView, stalled: boolean) =>
	stalled
		? "warning.main"
		: item.status === "done"
			? "success.main"
			: "text.disabled";

export function DeliveredItem({
	item,
	handlers: { busy, onItem, onResume },
}: {
	item: AutopilotItemView;
	handlers: PhoneItemHandlers;
}) {
	const stalled = item.status !== "done" && item.status !== "wontdo";
	const resume = (
		<Button
			key="resume"
			variant="contained"
			disableElevation
			sx={buttonSx.primary}
			disabled={busy}
			onClick={() => onResume(item.id)}
		>
			Resume
		</Button>
	);
	return (
		<PhoneItemRow
			dot={dotColor(item, stalled)}
			title={item.name}
			wash={stalled}
			meta={<DeliveredMeta item={item} stalled={stalled} />}
			line={deliveredLine(item)}
			kv={item.result ? { key: "result", value: item.result } : undefined}
			onTap={() => onItem(item.id)}
			actions={stalled ? [resume] : undefined}
		/>
	);
}
