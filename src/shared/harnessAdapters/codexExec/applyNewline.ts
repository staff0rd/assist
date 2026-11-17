import { closeStatement } from "./closeStatement";
import { continuesAcrossNewline } from "./continuesAcrossNewline";
import { skipSpace } from "./skipSpace";
import type { SplitState } from "./SplitState";

export function applyNewline(state: SplitState, i: number) {
	const open = state.open;
	if (!open || state.depth) return;
	if (open.header && open.body === "none") return;
	const next = skipSpace(state.src, i);
	if (!continuesAcrossNewline(state.src, state.last, next))
		closeStatement(state, state.last + 1);
}
