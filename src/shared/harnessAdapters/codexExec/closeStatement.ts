import type { SplitState } from "./SplitState";

export function closeStatement(state: SplitState, end: number) {
	if (state.open) state.spans.push({ start: state.open.start, end });
	state.open = null;
}
