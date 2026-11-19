import { execFileSync } from "node:child_process";
import { rejectHarnessNames } from "./rejectHarnessNames";
import { resolveCommentWithReply } from "./resolveCommentWithReply";
import { reviewProposedPrComment } from "./reviewProposedPrComment";
import { isGhNotInstalled } from "./shared";

function validateShaReferences(reason: string): void {
	// Match SHAs in markdown commit links: [7-char sha](https://github.com/owner/repo/commit/full-sha)
	const commitLinkPattern =
		/\[[0-9a-f]{7}\]\(https:\/\/(?:github\.com\/[^/]+\/[^/]+|dev\.azure\.com\/[^/]+\/[^/]+\/_git\/[^/]+)\/commit\/([0-9a-f]{40})\)/gi;

	const shas = Array.from(reason.matchAll(commitLinkPattern), (m) => m[1]);

	if (shas.length === 0) {
		return;
	}

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

export async function wontfix(
	commentId: number,
	reason: string,
): Promise<void> {
	rejectHarnessNames("Reason", reason);
	validateShaReferences(reason);

	await reviewProposedPrComment(
		`Won't fix comment #${commentId}`,
		reason,
		null,
	);

	try {
		resolveCommentWithReply(commentId, reason, "wontFix");
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
