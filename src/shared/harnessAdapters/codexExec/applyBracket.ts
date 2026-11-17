import { closeStatement } from "./closeStatement";
import { markBody } from "./markBody";
import type { SplitState } from "./SplitState";

export function applyBracket(state: SplitState, c: string, i: number): boolean {
	if ("([{".includes(c)) {
		markBody(state, c);
		state.depth++;
		return true;
	}
	state.depth--;
	if (state.depth < 0) return false;
	const open = state.open;
	if (state.depth || !open) return true;
	if (open.header && !open.headerDone && c === ")") open.headerDone = true;
	else if (open.body === "block" && c === "}") closeStatement(state, i + 1);
	return true;
}
