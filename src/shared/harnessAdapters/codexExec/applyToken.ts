import { applyBracket } from "./applyBracket";
import { closeStatement } from "./closeStatement";
import { markBody } from "./markBody";
import { skipQuoted } from "./skipQuoted";
import type { SplitState } from "./SplitState";

export const MALFORMED = -1;

export function applyToken(state: SplitState, c: string, i: number): number {
	if (c === '"' || c === "'" || c === "`") {
		markBody(state, c);
		return skipQuoted(state.src, i);
	}
	if ("()[]{}".includes(c))
		return applyBracket(state, c, i) ? i + 1 : MALFORMED;
	if (c === ";" && !state.depth) closeStatement(state, i + 1);
	else markBody(state, c);
	return i + 1;
}
