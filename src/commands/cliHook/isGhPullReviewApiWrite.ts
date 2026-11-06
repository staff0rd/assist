import { isGhRestWrite } from "./isGhRestWrite";

const PULL_REVIEW_ENDPOINT =
	/repos\/[^/\s"'`]+\/[^/\s"'`]+\/pulls\/(?:\d+\/)?(?:comments|reviews)(?:$|[/?\s"'`)])/;

export function isGhPullReviewApiWrite(command: string): boolean {
	return isGhRestWrite(command, PULL_REVIEW_ENDPOINT);
}
