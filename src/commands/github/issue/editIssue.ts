import { parseScreenshotSpecs } from "../../prs/parseScreenshotSpecs";
import {
	parseEditIssueArgs,
	type EditIssueOptions,
} from "./parseEditIssueArgs";
import { inWebSession } from "../../sessions/shared/inWebSession";
import { attachIssueScreenshots } from "./attachIssueScreenshots";
import { fetchIssueToWorkingFile } from "./fetchIssueToWorkingFile";
import { previewIssueEdit } from "./previewIssueEdit";
import { setIssueParent } from "./setIssueParent";
import { viewIssue } from "./viewIssue";

export async function editIssue(
	numberArg: string,
	options: EditIssueOptions,
): Promise<void> {
	const number = parseEditIssueArgs(numberArg, options);

	const screenshots = parseScreenshotSpecs(options.screenshot);

	if (options.parent) {
		setIssueParent(number, options.repo, options.parent);
		return;
	}

	if (options.fetch) {
		fetchIssueToWorkingFile(number, options.repo);
		return;
	}

	if (!inWebSession()) {
		if (screenshots.length > 0) {
			await attachIssueScreenshots(
				number,
				options.repo,
				options.body,
				screenshots,
			);
			return;
		}
		viewIssue(number, options.repo);
		return;
	}

	await previewIssueEdit(
		number,
		options.repo,
		options.fresh,
		options.body,
		screenshots,
		options.title,
	);
}
