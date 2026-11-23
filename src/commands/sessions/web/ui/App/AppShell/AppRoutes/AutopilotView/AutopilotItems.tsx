import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { DeliveredRow } from "./DeliveredRow";
import { ItemSection } from "./ItemSection";
import { RunningRow } from "./RunningRow";
import { splitAutopilotItems } from "./splitAutopilotItems";

export function AutopilotItems({
	items,
	cwd,
	busy,
	onStop,
	onOpen,
}: {
	items: AutopilotItemView[];
	cwd: string;
	busy: boolean;
	onStop: (itemId: number) => void;
	onOpen: (sessionId: string) => void;
}) {
	const { running, delivered } = splitAutopilotItems(items);
	return (
		<>
			<ItemSection
				title="Running"
				count={running.length}
				empty="No item is running."
			>
				{running.map((item) => (
					<RunningRow
						key={item.id}
						item={item}
						cwd={cwd}
						busy={busy}
						onStop={() => onStop(item.id)}
						onOpen={() => item.sessionId && onOpen(item.sessionId)}
					/>
				))}
			</ItemSection>
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
