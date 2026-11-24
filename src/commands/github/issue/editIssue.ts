import { parseScreenshotSpecs } from "../../prs/parseScreenshotSpecs";
import {
	parseEditIssueArgs,
	type EditIssueOptions,
} from "./parseEditIssueArgs";
import { inWebSession } from "../../sessions/shared/inWebSession";
import { applyEditIssueMetadata } from "./applyEditIssueMetadata";
import { applyIssueEdit } from "./applyIssueEdit";
import { fetchIssueToWorkingFile } from "./fetchIssueToWorkingFile";
import { previewIssueEdit } from "./previewIssueEdit";
import { resolveEditIssueMetadata } from "./resolveEditIssueMetadata";
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

	const metadata = resolveEditIssueMetadata(number, options.repo, options);

	if (inWebSession()) {
		await previewIssueEdit(number, { ...options, screenshots, metadata });
		return;
	}

	const bodyGiven = metadata !== undefined && options.body !== undefined;
	if (screenshots.length > 0 || options.title !== undefined || bodyGiven) {
		await applyIssueEdit(
			number,
			options.repo,
			options.body,
			screenshots,
			options.title,
		);
	} else if (!metadata) {
		viewIssue(number, options.repo);
	}
	if (metadata) applyEditIssueMetadata(metadata);
}
