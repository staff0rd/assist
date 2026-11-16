import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { fetchIssue } from "./fetchIssue";
import { pushIssueBody } from "./pushIssueBody";

export function pushUnchangedIssue(
	number: number,
	repo: string | undefined,
	target: string,
	fetchedAt: string,
	bodyPath: string,
	attachments: PreviewAttachment[] = [],
): void {
	if (fetchIssue(number, repo).updatedAt !== fetchedAt) {
		console.error(
			`${target} was updated on GitHub after it was fetched. Nothing was pushed; the markdown is at ${bodyPath}`,
		);
		process.exit(1);
	}

	pushIssueBody(number, repo, bodyPath, attachments);
	console.log(`Issue body updated on ${target}`);
}
