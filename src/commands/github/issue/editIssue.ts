import { parseScreenshotSpecs } from "../../prs/parseScreenshotSpecs";
import { inWebSession } from "../../sessions/shared/inWebSession";
import { attachIssueScreenshots } from "./attachIssueScreenshots";
import { fetchIssueToWorkingFile } from "./fetchIssueToWorkingFile";
import { previewIssueEdit } from "./previewIssueEdit";
import { setIssueParent } from "./setIssueParent";
import { viewIssue } from "./viewIssue";

type EditIssueOptions = {
	repo?: string;
	fresh?: boolean;
	fetch?: boolean;
	body?: string;
	parent?: string;
	screenshot?: string[];
};

const USAGE =
	"Usage: assist github issue edit <number> [-R <owner>/<repo>] [--body <body>] [--fetch] [--parent <issue>] [--screenshot '[Group/]Caption=path']";

export async function editIssue(
	numberArg: string,
	options: EditIssueOptions,
): Promise<void> {
	const number = Number.parseInt(numberArg, 10);
	if (!Number.isInteger(number) || number <= 0) {
		console.error(USAGE);
		process.exit(1);
	}

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
	);
}
