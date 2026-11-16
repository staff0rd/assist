import { readBodyArgument } from "../../prs/readBodyArgument";
import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { prepareIssueEdit } from "./prepareIssueEdit";
import { pushIssueBody } from "./pushIssueBody";

export async function attachIssueScreenshots(
	number: number,
	repo: string | undefined,
	body: string | undefined,
	screenshots: PreviewAttachment[],
): Promise<void> {
	const proposed = body ? await readBodyArgument(body) : undefined;
	const issue = prepareIssueEdit(number, repo, true, proposed);
	pushIssueBody(number, repo, issue.bodyPath, screenshots);
	console.log(`Screenshots attached to ${issue.target}`);
}
