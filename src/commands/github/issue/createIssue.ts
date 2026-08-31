import { validateProposedContent } from "../../../shared/validateProposedContent";
import { applyCreatedIssueMetadata } from "./applyCreatedIssueMetadata";
import { issuePreviewMetadata } from "./issuePreviewMetadata";
import {
	type CreateIssueMetadata,
	resolveCreateIssueMetadata,
} from "./resolveCreateIssueMetadata";
import { reviewProposedIssue } from "./reviewProposedIssue";
import { runGhIssueCreate } from "./runGhIssueCreate";

type CreateIssueOptions = {
	title?: string;
	body?: string;
	repo?: string;
	type?: string;
	parent?: string;
	project?: string;
	status?: string;
	label?: string[];
};

const USAGE =
	"Usage: assist github issue create --title <title> --body <body> [-R <owner>/<repo>] [--type <name>] [--parent <issue>] [--project <number>] [--status <name>] [--label <name>]";

function preflight(
	options: CreateIssueOptions,
): CreateIssueMetadata | undefined {
	try {
		return resolveCreateIssueMetadata(options);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

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

	const resolved = preflight(options);

	await reviewProposedIssue(title, body, issuePreviewMetadata(resolved));

	const output = runGhIssueCreate(title, body, options.repo, resolved?.labels);
	console.log(output.trim());

	if (resolved) applyCreatedIssueMetadata(output, resolved);
}
