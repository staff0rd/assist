import type { BacklogItemSummary } from "../types";
import { canPlay } from "./canPlay";
import { PhaseMeter } from "./PhaseMeter";
import { PlayAction } from "./PlayAction";
import { StarAction } from "./StarAction";

export function CardActions({
	item,
	onReload,
	reorderable,
}: {
	item: BacklogItemSummary;
	onReload: () => Promise<void>;
	reorderable?: boolean;
}) {
	return (
		<>
			<PhaseMeter item={item} />
			<StarAction
				itemId={item.id}
				starred={item.starred}
				onToggled={onReload}
			/>
			{canPlay(item) && (
				<PlayAction
					itemId={item.id}
					origin={item.origin}
					compact={{
						currentPhase: item.currentPhase,
						totalPhases: item.totalPhases,
						onClosed: onReload,
					}}
					orderEnds={reorderable ? item : undefined}
				/>
			)}
		</>
	);
}
