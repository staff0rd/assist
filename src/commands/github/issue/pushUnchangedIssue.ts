import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { fetchIssue } from "./fetchIssue";
import { pushIssueBody } from "./pushIssueBody";
import { pushIssueTitle } from "./pushIssueTitle";

type IssueRename = {
	title: string;
	bodyChanged: boolean;
};

export function pushUnchangedIssue(
	number: number,
	repo: string | undefined,
	target: string,
	fetchedAt: string,
	bodyPath: string,
	attachments: PreviewAttachment[] = [],
	rename?: IssueRename,
): void {
	if (fetchIssue(number, repo).updatedAt !== fetchedAt) {
		console.error(
			`${target} was updated on GitHub after it was fetched. Nothing was pushed; the markdown is at ${bodyPath}`,
		);
		process.exit(1);
	}

	if (rename && !rename.bodyChanged && attachments.length === 0) {
		pushIssueTitle(number, repo, rename.title);
		console.log(`Issue renamed on ${target}`);
		return;
	}

	pushIssueBody(number, repo, bodyPath, attachments, rename?.title);
	console.log(
		rename
			? `Issue renamed and body updated on ${target}`
			: `Issue body updated on ${target}`,
	);
}
