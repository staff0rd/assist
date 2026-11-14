import type { SwipeBackSources } from "./swipeBackDriver";

function isModalOpen(): boolean {
	return (
		document.querySelector(".MuiModal-root:not(.MuiModal-hidden)") !== null
	);
}

export function canStartSwipeBack({ state, target }: SwipeBackSources) {
	return (
		target.current !== null &&
		!state.transition &&
		!state.gesture &&
		!isModalOpen()
	);
}
