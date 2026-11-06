import type { LineBoundFinding, UnanchoredFinding } from "./partitionFindings";

export function withRejectedFindings(
	unanchored: UnanchoredFinding[],
	rejected: LineBoundFinding[],
): UnanchoredFinding[] {
	return [
		...unanchored,
		...rejected.map((finding): UnanchoredFinding => ({
			...finding,
			reason: "comment-rejected",
		})),
	];
}
