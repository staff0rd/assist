import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { applyEditIssueParent } from "./applyEditIssueParent";
import { fetchIssue } from "./fetchIssue";
import { pushIssueBody } from "./pushIssueBody";
import { pushIssueTitle } from "./pushIssueTitle";
import type { EditIssueParent } from "./resolveEditIssueParent";

type IssueEditChanges = {
	title?: string;
	bodyChanged: boolean;
	parent?: EditIssueParent;
};

export function pushUnchangedIssue(
	number: number,
	repo: string | undefined,
	target: string,
	fetchedAt: string,
	bodyPath: string,
	attachments: PreviewAttachment[] = [],
	changes: IssueEditChanges = { bodyChanged: true },
): void {
	if (fetchIssue(number, repo).updatedAt !== fetchedAt) {
		console.error(
			`${target} was updated on GitHub after it was fetched. Nothing was pushed; the markdown is at ${bodyPath}`,
		);
		process.exit(1);
	}

	const { title, parent } = changes;
	const pushBody =
		changes.bodyChanged ||
		attachments.length > 0 ||
		(title === undefined && !parent);

	if (pushBody) {
		pushIssueBody(number, repo, bodyPath, attachments, title);
		console.log(
			title === undefined
				? `Issue body updated on ${target}`
				: `Issue renamed and body updated on ${target}`,
		);
	} else if (title !== undefined) {
		pushIssueTitle(number, repo, title);
		console.log(`Issue renamed on ${target}`);
	}

	if (parent) applyEditIssueParent(parent);
}
