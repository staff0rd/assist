import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildReviewPaths } from "./buildReviewPaths";

describe("buildReviewPaths", () => {
	it("builds paths under the home dir namespaced by repo basename", () => {
		const paths = buildReviewPaths("/home/user/git/assist", "feature-x-abc123");
		const expectedDir = join(
			homedir(),
			".assist",
			"reviews",
			"assist",
			"feature-x-abc123",
		);

		expect(paths.reviewDir).toBe(expectedDir);
		expect(paths.requestPath).toBe(join(expectedDir, "request.md"));
		expect(paths.claudePath).toBe(join(expectedDir, "claude.md"));
		expect(paths.codexPath).toBe(join(expectedDir, "codex.md"));
		expect(paths.synthesisPath).toBe(join(expectedDir, "synthesis.md"));
	});

	it("does not write inside the repo tree", () => {
		const paths = buildReviewPaths("/home/user/git/assist", "branch-sha");

		expect(paths.reviewDir.startsWith("/home/user/git/assist")).toBe(false);
		expect(paths.reviewDir.startsWith(join(homedir(), ".assist"))).toBe(true);
	});

	it("namespaces reviews from different repos with the same key separately", () => {
		const key = "main-deadbeef";
		const repoA = buildReviewPaths("/home/user/git/repo-a", key);
		const repoB = buildReviewPaths("/home/user/git/repo-b", key);

		expect(repoA.reviewDir).not.toBe(repoB.reviewDir);
		expect(repoA.reviewDir).toBe(
			join(homedir(), ".assist", "reviews", "repo-a", key),
		);
		expect(repoB.reviewDir).toBe(
			join(homedir(), ".assist", "reviews", "repo-b", key),
		);
	});
});
