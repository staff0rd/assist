import { buildDiffLineIndex } from "./buildDiffLineIndex";
import { fetchPrDiff } from "./fetchPrDiff";
import type { LineBoundFinding } from "./partitionFindings";
import { partitionFindingsByDiff } from "./partitionFindingsByDiff";
import { warnOutOfDiff } from "./warnOutOfDiff";

type PrDiffRef = {
	prNumber: number;
	baseSha: string;
	headSha: string;
};

// Keeps only findings whose lines GitHub can actually anchor a comment on,
// warning about the rest so they are not silently dropped.
export function selectInDiffFindings(
	lineBound: LineBoundFinding[],
	prDiff: PrDiffRef,
): LineBoundFinding[] {
	const diff = fetchPrDiff(prDiff.prNumber, prDiff.baseSha, prDiff.headSha);
	const { inDiff, outOfDiff } = partitionFindingsByDiff(
		lineBound,
		buildDiffLineIndex(diff),
	);
	warnOutOfDiff(outOfDiff);
	return inDiff;
}
