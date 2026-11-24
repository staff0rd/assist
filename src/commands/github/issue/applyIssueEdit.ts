import { readBodyArgument } from "../../prs/readBodyArgument";
import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { fetchIssue } from "./fetchIssue";
import { prepareIssueEdit } from "./prepareIssueEdit";
import { pushIssueBody } from "./pushIssueBody";
import { pushIssueTitle } from "./pushIssueTitle";
import { slugFromUrl } from "./slugFromUrl";
import { validateIssueBody } from "./validateIssueBody";

export async function applyIssueEdit(
	number: number,
	repo: string | undefined,
	body: string | undefined,
	screenshots: PreviewAttachment[],
	title: string | undefined,
): Promise<void> {
	if (title !== undefined) validateIssueBody(title, "");

	if (title !== undefined && !body && screenshots.length === 0) {
		const target = `${repo ?? slugFromUrl(fetchIssue(number, repo).url)}#${number}`;
		pushIssueTitle(number, repo, title);
		console.log(`Issue renamed on ${target}`);
		return;
	}

	const proposed = body ? await readBodyArgument(body) : undefined;
	const issue = prepareIssueEdit(number, repo, true, proposed);
	pushIssueBody(number, repo, issue.bodyPath, screenshots, title);
	console.log(
		title !== undefined
			? `Issue renamed and body updated on ${issue.target}`
			: proposed !== undefined
				? `Issue body updated on ${issue.target}`
				: `Screenshots attached to ${issue.target}`,
	);
}
