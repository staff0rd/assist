import { execSync } from "node:child_process";
import { rejectHarnessAttribution } from "../../shared/rejectHarnessAttribution";
import { resolveCommentWithReply } from "./resolveCommentWithReply";
import { reviewProposedPrComment } from "./reviewProposedPrComment";
import { isGhNotInstalled } from "./shared";

function validateReason(reason: string): void {
	const lowerReason = reason.toLowerCase();
	if (lowerReason.includes("claude") || lowerReason.includes("opus")) {
		console.error('Error: Reason must not contain "claude" or "opus"');
		process.exit(1);
	}
	rejectHarnessAttribution("Reason", reason);
}

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
			execSync(`git cat-file -t ${sha}`, { stdio: "pipe" });
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
	validateReason(reason);
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
