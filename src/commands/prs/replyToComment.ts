import { execSync } from "node:child_process";

export function replyToComment(
	org: string,
	repo: string,
	prNumber: number,
	commentId: number,
	message: string,
): void {
	execSync(
		`gh api repos/${org}/${repo}/pulls/${prNumber}/comments -f body="${message.replace(/"/g, String.raw`\"`)}" -F in_reply_to=${commentId}`,
		{ stdio: ["inherit", "pipe", "inherit"] },
	);
}
