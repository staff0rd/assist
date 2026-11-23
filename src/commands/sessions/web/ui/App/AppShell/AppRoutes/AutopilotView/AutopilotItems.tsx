import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { DeliveredRow } from "./DeliveredRow";
import { ItemSection } from "./ItemSection";
import { RunningSection } from "./RunningSection";
import { splitAutopilotItems } from "./splitAutopilotItems";

export function AutopilotItems({
	status,
	items,
	cwd,
	busy,
	onStop,
	onOpen,
}: {
	status: AutopilotStatus;
	items: AutopilotItemView[];
	cwd: string;
	busy: boolean;
	onStop: (itemId?: number) => void;
	onOpen: (sessionId: string) => void;
}) {
	const { running, delivered } = splitAutopilotItems(items);
	return (
		<>
			<RunningSection
				status={status}
				running={running}
				cwd={cwd}
				busy={busy}
				onStop={onStop}
				onOpen={onOpen}
			/>
			<ItemSection
				title="Delivered"
				count={delivered.length}
				empty="Nothing delivered yet."
			>
				{delivered.map((item) => (
					<DeliveredRow key={item.id} item={item} cwd={cwd} />
				))}
			</ItemSection>
		</>
	);
}
