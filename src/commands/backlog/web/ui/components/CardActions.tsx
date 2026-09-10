import type { BacklogItemSummary } from "../types";
import { canPlay } from "./canPlay";
import { PhaseMeter } from "./PhaseMeter";
import { PlayAction } from "./PlayAction";
import { StarAction } from "./StarAction";
import { SubtaskBadge } from "./SubtaskBadge";

export function CardActions({
	item,
	onReload,
}: {
	item: BacklogItemSummary;
	onReload: () => Promise<void>;
}) {
	return (
		<>
			<SubtaskBadge count={item.incompleteSubtasks} />
			<PhaseMeter item={item} />
			<StarAction
				itemId={item.id}
				starred={item.starred}
				onToggled={onReload}
			/>
			{canPlay(item) && <PlayAction itemId={item.id} compact />}
		</>
	);
}
