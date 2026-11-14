import type { SwipeBackSources } from "./swipeBackDriver";
import type { SwipeLayers } from "./swipeFrame";

export function swipeBackStackLayers({
	state,
	pages,
	dim,
}: SwipeBackSources): SwipeLayers | null {
	const top = state.stack.at(-1);
	const moving = top && pages.current.get(top.key);
	if (!moving) return null;
	const beneath = state.stack.at(-2);
	return {
		moving,
		under: beneath && pages.current.get(beneath.key),
		dim: dim.current,
	};
}
