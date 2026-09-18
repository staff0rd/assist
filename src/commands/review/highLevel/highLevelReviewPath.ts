import { join } from "node:path";
import { getStoreDir } from "../../../shared/loadJson";

function slug(value: string): string {
	return value.replace(/[^\w.-]+/g, "-");
}

export function highLevelReviewPath(
	repo: string,
	headRef: string,
	headSha: string,
): string {
	return join(
		getStoreDir(),
		"high-level-reviews",
		slug(repo),
		`${slug(headRef)}-${headSha}.json`,
	);
}
