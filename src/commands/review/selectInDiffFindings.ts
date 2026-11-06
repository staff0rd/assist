import { buildDiffLineIndex } from "./buildDiffLineIndex";
import { fetchPrDiff } from "./fetchPrDiff";
import type { LineBoundFinding, UnanchoredFinding } from "./partitionFindings";
import { partitionFindingsByDiff } from "./partitionFindingsByDiff";
import { warnOutOfDiff } from "./warnOutOfDiff";

type PrDiffRef = {
	prNumber: number;
	baseSha: string;
	headSha: string;
};

type InDiffSelection = {
	inDiff: LineBoundFinding[];
	unanchored: UnanchoredFinding[];
};

export function selectInDiffFindings(
	lineBound: LineBoundFinding[],
	prDiff: PrDiffRef,
): InDiffSelection {
	const diff = fetchPrDiff(prDiff.prNumber, prDiff.baseSha, prDiff.headSha);
	const { inDiff, outOfDiff } = partitionFindingsByDiff(
		lineBound,
		buildDiffLineIndex(diff),
	);
	warnOutOfDiff(outOfDiff);
	return {
		inDiff,
		unanchored: outOfDiff.map((finding): UnanchoredFinding => ({
			...finding,
			reason: "out-of-diff",
		})),
	};
}
