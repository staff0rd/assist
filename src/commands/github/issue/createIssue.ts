import { validateProposedContent } from "../../../shared/validateProposedContent";
import { appendScreenshots } from "../../prs/appendScreenshots";
import { parseScreenshotSpecs } from "../../prs/parseScreenshotSpecs";
import { applyCreatedIssueMetadata } from "./applyCreatedIssueMetadata";
import { issuePreviewMetadata } from "./issuePreviewMetadata";
import { reviewProposedIssue } from "./reviewProposedIssue";
import { runGhIssueCreate } from "./runGhIssueCreate";
import { preflightCreateIssue } from "./preflightCreateIssue";

type CreateIssueOptions = {
	title?: string;
	body?: string;
	repo?: string;
	type?: string;
	parent?: string;
	project?: string;
	status?: string;
	label?: string[];
	milestone?: string;
	screenshot?: string[];
};

const USAGE =
	"Usage: assist github issue create --title <title> --body <body> [-R <owner>/<repo>] [--type <name>] [--parent <issue>] [--project <number>] [--status <name>] [--label <name>] [--milestone <name>] [--screenshot '[Group/]Caption=path']";

export async function createIssue(options: CreateIssueOptions): Promise<void> {
	if (!options.title || !options.body) {
		console.error(USAGE);
		process.exit(1);
	}

	const { title, body } = options;
	validateProposedContent(
		{ subject: "Issue", context: "GitHub issues" },
		title,
		body,
	);

	const screenshots = parseScreenshotSpecs(options.screenshot);
	const resolved = preflightCreateIssue(options);

	const decision = await reviewProposedIssue(
		title,
		body,
		issuePreviewMetadata(resolved),
		screenshots,
	);

	const attachments = decision ? (decision.screenshots ?? []) : screenshots;
	const output = runGhIssueCreate(
		title,
		appendScreenshots(body, attachments),
		options.repo,
		resolved,
		attachments,
	);
	console.log(output.trim());

	if (resolved) applyCreatedIssueMetadata(output, resolved);
}
