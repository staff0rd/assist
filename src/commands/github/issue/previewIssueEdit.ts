import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { editIssuePreviewMetadata } from "./editIssuePreviewMetadata";
import { metadataFields } from "./metadataFields";
import { prepareIssueEdit } from "./prepareIssueEdit";
import { pushUnchangedIssue } from "./pushUnchangedIssue";
import { readProposedIssueBody } from "./readProposedIssueBody";
import type { EditIssueMetadata } from "./resolveEditIssueMetadata";
import { reviewProposedIssueEdit } from "./reviewProposedIssueEdit";
import { validateIssueBody } from "./validateIssueBody";

type IssueEditRequest = {
	repo?: string;
	fresh?: boolean;
	body?: string;
	screenshots?: PreviewAttachment[];
	title?: string;
	metadata?: EditIssueMetadata;
};

export async function previewIssueEdit(
	number: number,
	request: IssueEditRequest,
): Promise<void> {
	const { repo, title, metadata } = request;
	const proposed = await readProposedIssueBody(title, request.body);
	const issue = prepareIssueEdit(
		number,
		repo,
		request.fresh,
		proposed,
		metadataFields(metadata),
	);
	const heading =
		title === undefined ? issue.title : `${issue.title} → ${title}`;
	const edited = await reviewProposedIssueEdit(
		`Edit ${issue.target}: ${heading}`,
		issue.body,
		{ path: issue.bodyPath, save: issue.save },
		request.screenshots,
		editIssuePreviewMetadata(issue.current, metadata),
	);
	validateIssueBody(title ?? issue.title, edited.body);

	pushUnchangedIssue(
		number,
		repo,
		issue.target,
		issue.updatedAt,
		issue.bodyPath,
		edited.screenshots,
		{
			title,
			metadata,
			bodyChanged:
				(title === undefined && !metadata) || edited.body !== issue.fetchedBody,
		},
	);
}
