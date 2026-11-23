import type { AutopilotStatus } from "../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "../../../autopilot/AutopilotItemView";
import { splitAutopilotItems } from "../../App/AppShell/AppRoutes/AutopilotView/splitAutopilotItems";
import { PhoneDeliveredSection } from "./PhoneDeliveredSection";
import type { PhoneItemHandlers } from "./PhoneItemHandlers";
import { PhoneRunningSection } from "./PhoneRunningSection";

export function PhoneAutopilotItems({
	status,
	items,
	handlers,
}: {
	status: AutopilotStatus;
	items: AutopilotItemView[];
	handlers: PhoneItemHandlers;
}) {
	const { running, delivered } = splitAutopilotItems(items);
	return (
		<>
			<PhoneRunningSection
				status={status}
				running={running}
				handlers={handlers}
			/>
			<PhoneDeliveredSection delivered={delivered} handlers={handlers} />
		</>
	);
}
