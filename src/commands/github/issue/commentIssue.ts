import { validateProposedContent } from "../../../shared/validateProposedContent";
import { appendScreenshots } from "../../prs/appendScreenshots";
import { attachArgs } from "../../prs/attachArgs";
import { parseScreenshotSpecs } from "../../prs/parseScreenshotSpecs";
import { runGhWithAttachments } from "../../prs/runGhWithAttachments";
import { reviewProposedIssueComment } from "./reviewProposedIssueComment";

type CommentIssueOptions = {
	body?: string;
	repo?: string;
	screenshot?: string[];
};

const USAGE =
	"Usage: assist github issue comment <number> --body <body> [-R <owner>/<repo>] [--screenshot '[Group/]Caption=path']";

export async function commentIssue(
	numberArg: string,
	options: CommentIssueOptions,
): Promise<void> {
	const number = Number.parseInt(numberArg, 10);
	if (!Number.isInteger(number) || number <= 0 || !options.body) {
		console.error(USAGE);
		process.exit(1);
	}

	const { body } = options;
	const target = options.repo
		? `${options.repo}#${number}`
		: `issue #${number}`;
	validateProposedContent(
		{ subject: "Comment", context: "GitHub issues" },
		"",
		body,
	);

	const screenshots = parseScreenshotSpecs(options.screenshot);
	const decision = await reviewProposedIssueComment(
		`Comment on ${target}`,
		body,
		screenshots,
	);
	const attachments = decision ? (decision.screenshots ?? []) : screenshots;

	const args = [
		"issue",
		"comment",
		String(number),
		"--body",
		appendScreenshots(body, attachments),
	];
	if (options.repo) args.push("--repo", options.repo);
	args.push(...attachArgs(attachments));

	const output = runGhWithAttachments(args, attachments).trim();
	if (output) console.log(output);
	console.log(`Comment posted to ${target}`);
}
