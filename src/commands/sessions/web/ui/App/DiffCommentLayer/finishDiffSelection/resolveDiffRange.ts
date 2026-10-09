import {
	type ChangeData,
	computeNewLineNumber,
	computeOldLineNumber,
} from "react-diff-view";
import type { DiffChangeIndex } from "../buildChangeIndex";
import { diffRangeEndpoints } from "./resolveDiffRange/diffRangeEndpoints";
import {
	type DiffSide,
	resolveDiffSide,
} from "./resolveDiffRange/resolveDiffSide";
import { type SelectedChange, selectedChanges } from "../selectedChanges";
import { quoteOf } from "./resolveDiffRange/quoteOf";

type ResolvedDiffRange = {
	startLine: number;
	endLine: number;
	quote: string;
	changes: SelectedChange[];
};

function onSide(side: DiffSide | null): (change: ChangeData) => boolean {
	if (side === "old") return (change) => change.type !== "insert";
	if (side === "new") return (change) => change.type !== "delete";
	return () => true;
}

function lineOf(change: ChangeData): number {
	return change.type === "delete"
		? computeOldLineNumber(change)
		: computeNewLineNumber(change);
}

export function resolveDiffRange(
	range: Range,
	index: DiffChangeIndex,
): ResolvedDiffRange | null {
	const ends = diffRangeEndpoints(range, index);
	if (!ends) return null;

	const { start, end } = ends;
	const [from, to] = [start.position, end.position].sort((a, b) => a - b);
	const spanned = index.changes
		.slice(from, to + 1)
		.filter(onSide(resolveDiffSide(start, end)));
	const quoted = spanned.length > 0 ? spanned : [start.change];

	const quote = quoteOf(range, start, end, quoted);
	if (!quote.trim()) return null;

	return {
		startLine: lineOf(quoted[0]),
		endLine: lineOf(quoted[quoted.length - 1]),
		quote,
		changes: selectedChanges(quoted),
	};
}
