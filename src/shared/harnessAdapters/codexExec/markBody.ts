import type { SplitState } from "./SplitState";

export function markBody(state: SplitState, c: string) {
	const open = state.open;
	if (open?.headerDone && open.body === "none")
		open.body = c === "{" && state.depth === 0 ? "block" : "simple";
}
