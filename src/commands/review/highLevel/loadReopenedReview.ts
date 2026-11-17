import { loadHighLevelReview } from "./loadHighLevelReview";
import { loadHighLevelProgress } from "./progressStore/loadHighLevelProgress";
import type { HighLevelPreviewPayload } from "./types";

type ReopenedHead = {
	repo: string;
	prNumber: number;
	headRef: string;
	headSha: string;
};

export function loadReopenedReview(
	{ repo, prNumber, headRef, headSha }: ReopenedHead,
	force: boolean,
): Pick<HighLevelPreviewPayload, "saved" | "progress"> {
	const saved = force ? undefined : loadHighLevelReview(repo, headRef, headSha);
	const progress = loadHighLevelProgress(repo, prNumber, headSha);
	return {
		...(saved ? { saved } : {}),
		...(progress ? { progress } : {}),
	};
}
