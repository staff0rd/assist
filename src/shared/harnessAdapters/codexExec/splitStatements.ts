import { applyNewline } from "./applyNewline";
import { MALFORMED, applyToken } from "./applyToken";
import { closeStatement } from "./closeStatement";
import { skipComment } from "./skipComment";
import type { SplitState } from "./SplitState";

const HEADER = /^(?:for|while|if)\s*\(/;

function step(state: SplitState, i: number): number {
	const c = state.src[i];
	if (c === "\n") applyNewline(state, i);
	if (/\s/.test(c)) return i + 1;
	const afterComment = skipComment(state.src, i);
	if (afterComment !== i) return afterComment;
	if (!state.open && c === ";") return i + 1;
	if (!state.open) {
		const header = HEADER.test(state.src.slice(i));
		state.open = { start: i, header, headerDone: false, body: "none" };
	}
	const next = applyToken(state, c, i);
	if (next !== MALFORMED) state.last = next - 1;
	return next;
}

export function splitStatements(src: string): SplitState["spans"] | null {
	const state: SplitState = { src, spans: [], depth: 0, last: -1, open: null };
	for (let i = 0; i < src.length;) {
		i = step(state, i);
		if (i === MALFORMED) return null;
	}
	if (state.depth) return null;
	closeStatement(state, state.last + 1);
	return state.spans;
}
