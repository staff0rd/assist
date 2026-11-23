import Box from "@mui/material/Box";
import type { AutopilotItemView } from "../../../autopilot/AutopilotItemView";
import { PhoneSectionHeader } from "../PhoneSectionHeader";
import type { PhoneItemHandlers } from "./PhoneItemHandlers";
import { phoneItemSx as sx } from "./phoneItemSx";
import { DeliveredItem } from "./DeliveredItem";

export function PhoneDeliveredSection({
	delivered,
	handlers,
}: {
	delivered: AutopilotItemView[];
	handlers: PhoneItemHandlers;
}) {
	return (
		<section aria-label="Delivered">
			<PhoneSectionHeader label="Delivered" count={delivered.length} />
			{delivered.map((item) => (
				<DeliveredItem key={item.id} item={item} handlers={handlers} />
			))}
			{delivered.length === 0 && (
				<Box sx={sx.empty}>Nothing delivered yet.</Box>
			)}
		</section>
	);
}
