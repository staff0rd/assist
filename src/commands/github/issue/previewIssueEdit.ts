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
): Promise<void> {
	const proposed = body ? await readBodyArgument(body) : undefined;
	const issue = prepareIssueEdit(number, repo, fresh, proposed);
	const edited = await reviewProposedIssueEdit(
		`Edit ${issue.target}: ${issue.title}`,
		issue.body,
		{ path: issue.bodyPath, save: issue.save },
		screenshots,
	);
	validateIssueBody(issue.title, edited.body);

	pushUnchangedIssue(
		number,
		repo,
		issue.target,
		issue.updatedAt,
		issue.bodyPath,
		edited.screenshots,
	);
}
