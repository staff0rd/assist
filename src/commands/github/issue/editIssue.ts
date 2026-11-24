import { parseScreenshotSpecs } from "../../prs/parseScreenshotSpecs";
import {
	parseEditIssueArgs,
	type EditIssueOptions,
} from "./parseEditIssueArgs";
import { inWebSession } from "../../sessions/shared/inWebSession";
import { applyEditIssueParent } from "./applyEditIssueParent";
import { applyIssueEdit } from "./applyIssueEdit";
import { fetchIssueToWorkingFile } from "./fetchIssueToWorkingFile";
import { previewIssueEdit } from "./previewIssueEdit";
import { resolveEditIssueParent } from "./resolveEditIssueParent";
import { viewIssue } from "./viewIssue";

export async function editIssue(
	numberArg: string,
	options: EditIssueOptions,
): Promise<void> {
	const number = parseEditIssueArgs(numberArg, options);

	const screenshots = parseScreenshotSpecs(options.screenshot);

	if (options.fetch) {
		fetchIssueToWorkingFile(number, options.repo);
		return;
	}

	const parent = options.parent
		? resolveEditIssueParent(number, options.repo, options.parent)
		: undefined;

	if (inWebSession()) {
		await previewIssueEdit(number, { ...options, screenshots, parent });
		return;
	}

	const bodyGiven = parent !== undefined && options.body !== undefined;
	if (screenshots.length > 0 || options.title !== undefined || bodyGiven) {
		await applyIssueEdit(
			number,
			options.repo,
			options.body,
			screenshots,
			options.title,
		);
	} else if (!parent) {
		viewIssue(number, options.repo);
	}
	if (parent) applyEditIssueParent(parent);
}
