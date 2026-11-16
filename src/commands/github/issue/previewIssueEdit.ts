import { readBodyArgument } from "../../prs/readBodyArgument";
import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { prepareIssueEdit } from "./prepareIssueEdit";
import { pushUnchangedIssue } from "./pushUnchangedIssue";
import { reviewProposedIssueEdit } from "./reviewProposedIssueEdit";
import { validateIssueBody } from "./validateIssueBody";

export async function previewIssueEdit(
	number: number,
	repo: string | undefined,
	fresh: boolean | undefined,
	body: string | undefined,
	screenshots: PreviewAttachment[] = [],
	title?: string,
): Promise<void> {
	if (title !== undefined) validateIssueBody(title, "");
	const proposed = body ? await readBodyArgument(body) : undefined;
	const issue = prepareIssueEdit(number, repo, fresh, proposed);
	const heading =
		title === undefined ? issue.title : `${issue.title} → ${title}`;
	const edited = await reviewProposedIssueEdit(
		`Edit ${issue.target}: ${heading}`,
		issue.body,
		{ path: issue.bodyPath, save: issue.save },
		screenshots,
	);
	validateIssueBody(title ?? issue.title, edited.body);

	pushUnchangedIssue(
		number,
		repo,
		issue.target,
		issue.updatedAt,
		issue.bodyPath,
		edited.screenshots,
		title === undefined
			? undefined
			: { title, bodyChanged: edited.body !== issue.fetchedBody },
	);
}
