import { animateSwipeTo } from "./animateSwipeTo";
import { finishSwipeBack } from "./finishSwipeBack";
import type { SwipeBackSources } from "./swipeBackDriver";
import { swipeCompletes } from "./swipeCompletes";
import type { SwipeLayers } from "./swipeFrame";

export async function releaseSwipeBack(
	layers: SwipeLayers,
	progress: number,
	velocity: number,
	latest: () => SwipeBackSources,
) {
	const complete = swipeCompletes(progress, velocity);
	await animateSwipeTo(
		layers,
		progress,
		complete ? 1 : 0,
		latest().motion.push,
	);
	finishSwipeBack(layers, complete, latest());
}
