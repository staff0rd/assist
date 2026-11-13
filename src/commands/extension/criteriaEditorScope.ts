import { isIssueBodyPage } from "./isIssueBodyPage";
import { isProjectPath } from "./isProjectPath";

const CREATE_ISSUE_DIALOG =
	'[role="dialog"][class*="CreateIssueDialogContainer"]';

/**
 * Where to look for issue body editors. A project board's create-issue dialog
 * opens without the `?pane=issue` URL, so on a project path only that dialog is
 * scanned, keeping draft-issue editors elsewhere on the board untouched.
 */
export function criteriaEditorScope(
	location: Pick<Location, "pathname" | "search">,
): ParentNode | undefined {
	if (isIssueBodyPage(location)) return document;
	if (!isProjectPath(location.pathname)) return undefined;
	return document.querySelector(CREATE_ISSUE_DIALOG) ?? undefined;
}
