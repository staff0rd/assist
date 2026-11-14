import type { SwipeBackSources } from "./swipeBackDriver";
import { clearSwipeFrame, type SwipeLayers } from "./swipeFrame";

export function finishSwipeBack(
	layers: SwipeLayers,
	complete: boolean,
	{ target, setGesture }: SwipeBackSources,
) {
	const back = target.current;
	if (!complete || !back) {
		clearSwipeFrame(layers);
		setGesture(undefined);
		return;
	}
	if (layers.under) layers.under.style.transform = "";
	if (layers.dim) layers.dim.style.opacity = "";
	setGesture("done");
	back();
}
