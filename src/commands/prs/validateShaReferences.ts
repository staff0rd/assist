import { execFileSync } from "node:child_process";

export function validateShaReferences(text: string): void {
	// Match SHAs in markdown commit links: [7-char sha](https://github.com/owner/repo/commit/full-sha)
	const commitLinkPattern =
		/\[[0-9a-f]{7}\]\(https:\/\/(?:github\.com\/[^/]+\/[^/]+|dev\.azure\.com\/[^/]+\/[^/]+\/_git\/[^/]+)\/commit\/([0-9a-f]{40})\)/gi;

	const shas = Array.from(text.matchAll(commitLinkPattern), (m) => m[1]);

	const invalidShas: string[] = [];
	for (const sha of shas) {
		try {
			execFileSync("git", ["cat-file", "-t", sha], { stdio: "pipe" });
		} catch {
			invalidShas.push(sha);
		}
	}

	if (invalidShas.length > 0) {
		console.error(
			`Error: The following SHA references do not exist in git: ${invalidShas.join(", ")}`,
		);
		process.exit(1);
	}
}
