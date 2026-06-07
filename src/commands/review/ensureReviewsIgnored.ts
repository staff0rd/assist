import {
	appendFileSync,
	existsSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

const REVIEWS_ENTRY = ".assist/reviews";

function coversReviews(line: string): boolean {
	const pattern = line.trim().replace(/^\//, "").replace(/\/$/, "");
	return pattern === ".assist" || pattern === REVIEWS_ENTRY;
}

export function ensureReviewsIgnored(repoRoot: string): void {
	const gitignorePath = join(repoRoot, ".gitignore");
	if (!existsSync(gitignorePath)) {
		writeFileSync(gitignorePath, `${REVIEWS_ENTRY}\n`);
		console.log(`Created .gitignore with ${REVIEWS_ENTRY} entry.`);
		return;
	}
	const content = readFileSync(gitignorePath, "utf-8");
	if (content.split("\n").some(coversReviews)) return;
	const separator = content === "" || content.endsWith("\n") ? "" : "\n";
	appendFileSync(gitignorePath, `${separator}${REVIEWS_ENTRY}\n`);
	console.log(`Added ${REVIEWS_ENTRY} to .gitignore.`);
}
