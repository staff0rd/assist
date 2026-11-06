import { parseFindings } from "./parseFindings";
import {
	type LineBoundFinding,
	partitionFindings,
	type UnanchoredFinding,
} from "./partitionFindings";
import { selectInDiffFindings } from "./selectInDiffFindings";
import { warnUnlocated } from "./warnUnlocated";

type PrDiffRef = {
	prNumber: number;
	baseSha: string;
	headSha: string;
};

type PostableFindings = {
	inDiff: LineBoundFinding[];
	unanchored: UnanchoredFinding[];
};

export function selectPostableFindings(
	markdown: string,
	prInfo: PrDiffRef,
): PostableFindings {
	const findings = parseFindings(markdown);
	if (findings.length === 0) {
		console.log("Synthesis contains no findings; nothing to post.");
		return { inDiff: [], unanchored: [] };
	}
	const { lineBound, unlocated, alreadyRaised } = partitionFindings(findings);
	warnUnlocated(unlocated);
	if (alreadyRaised.length > 0) {
		console.log(
			`Skipped ${alreadyRaised.length} finding(s) already raised by prior comments.`,
		);
	}
	const carriedUnlocated = unlocated.map((finding): UnanchoredFinding => ({
		...finding,
		reason: "unlocated",
	}));
	if (lineBound.length === 0) {
		console.log("No line-bound findings to comment on.");
		return { inDiff: [], unanchored: carriedUnlocated };
	}
	const { inDiff, unanchored } = selectInDiffFindings(lineBound, prInfo);
	if (inDiff.length === 0)
		console.log(
			"No findings fall within the PR diff; no line comments to post.",
		);
	return { inDiff, unanchored: [...carriedUnlocated, ...unanchored] };
}
