import { randomUUID } from "node:crypto";
import { stageScreenshots } from "../../prs/stageScreenshots";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";

type IssueWorkingCopy = {
	path: string;
	save: (edited: string) => void;
};

type ReviewedIssueEdit = {
	body: string;
	screenshots: PreviewAttachment[];
};

export async function reviewProposedIssueEdit(
	title: string,
	body: string,
	working: IssueWorkingCopy,
	screenshots: PreviewAttachment[] = [],
): Promise<ReviewedIssueEdit> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		return { body, screenshots };

	const decision = await awaitPreviewApproval(
		"GitHub issue edit preview",
		{
			sessionId,
			requestId: randomUUID(),
			title,
			body,
			prNumber: null,
			kind: "github-issue-edit",
			screenshots: screenshots.length
				? await stageScreenshots(screenshots)
				: undefined,
		},
		{
			saveEditedBody: working.save,
			rejectionAdvice: `Nothing was pushed. The pane's markdown, including any collapses already applied, is at ${working.path}. Revise that file in place — do not recompose the body from scratch — then re-run this command to preview the revision.`,
		},
	);

	return {
		body: decision.body ?? body,
		screenshots: decision.screenshots ?? [],
	};
}
