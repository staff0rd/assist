import type { ActiveTokens } from "../../designSystem/DesignTokens";
import { canStartSwipeBack } from "./canStartSwipeBack";
import type { NavStackState } from "./nextNavStack";
import { releaseSwipeBack } from "./releaseSwipeBack";
import type { SwipeBackTarget } from "../useEdgeSwipeBack";
import { swipeBackStackLayers } from "./swipeBackStackLayers";
import { applySwipeFrame, type SwipeLayers } from "./swipeFrame";

export type SwipeBackSources = {
	state: NavStackState;
	setGesture: (gesture: NavStackState["gesture"]) => void;
	pages: { current: Map<string, HTMLElement> };
	dim: { current: HTMLElement | null };
	target: SwipeBackTarget;
	motion: ActiveTokens["motion"];
};

function blurFocused() {
	const el = document.activeElement;
	if (el instanceof HTMLElement && el !== document.body) el.blur();
}

export function swipeBackDriver(latest: () => SwipeBackSources) {
	let layers: SwipeLayers | null = null;
	let settling = false;
	const progressOf = (dx: number) =>
		layers ? Math.min(1, dx / (layers.moving.offsetWidth || 1)) : 0;
	return {
		canStart: () => !settling && canStartSwipeBack(latest()),
		onStart: () => {
			layers = swipeBackStackLayers(latest());
			if (!layers) return;
			blurFocused();
			latest().setGesture("tracking");
		},
		onMove: (dx: number) => {
			if (layers)
				applySwipeFrame(layers, progressOf(dx), latest().motion.push.parallax);
		},
		onEnd: (dx: number, velocity: number) => {
			const current = layers;
			if (!current) return;
			const progress = progressOf(dx);
			layers = null;
			settling = true;
			void releaseSwipeBack(current, progress, velocity, latest).then(() => {
				settling = false;
			});
		},
	};
}
