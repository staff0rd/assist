import { join } from "node:path";
import { getStoreDir } from "../../../../shared/loadJson";

function slug(value: string): string {
	return value.replace(/[^\w.-]+/g, "-");
}

export function highLevelProgressPath(repo: string, prNumber: number): string {
	return join(
		getStoreDir(),
		"high-level-progress",
		slug(repo),
		`${prNumber}.json`,
	);
}
