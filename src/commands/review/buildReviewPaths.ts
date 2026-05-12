import { join } from "node:path";

export type ReviewPaths = {
	reviewDir: string;
	requestPath: string;
	claudePath: string;
	codexPath: string;
	synthesisPath: string;
};

export function buildReviewPaths(
	repoRoot: string,
	branch: string,
	shortSha: string,
): ReviewPaths {
	const reviewDir = join(
		repoRoot,
		".assist",
		"reviews",
		`${branch}-${shortSha}`,
	);
	return {
		reviewDir,
		requestPath: join(reviewDir, "request.md"),
		claudePath: join(reviewDir, "claude.md"),
		codexPath: join(reviewDir, "codex.md"),
		synthesisPath: join(reviewDir, "synthesis.md"),
	};
}
