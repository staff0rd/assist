import { execFileSync } from "node:child_process";
import { cachedCommentUrl } from "./cachedCommentUrl";

export function commentUrl(
	org: string,
	repo: string,
	prNumber: number,
	commentId: number,
): string | undefined {
	const cached = cachedCommentUrl({ org, repo, prNumber }, commentId);
	if (cached) return cached;
	try {
		const comment = JSON.parse(
			execFileSync(
				"gh",
				["api", `repos/${org}/${repo}/pulls/comments/${commentId}`],
				{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
			),
		) as { html_url?: string };
		return comment.html_url || undefined;
	} catch {
		return undefined;
	}
}
