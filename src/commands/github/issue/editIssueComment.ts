import { execFileSync } from "node:child_process";
import { validateProposedContent } from "../../../shared/validateProposedContent";
import { resolveIssueRepoTarget } from "./resolveIssueRepoTarget";
import { reviewProposedIssueComment } from "./reviewProposedIssueComment";
import { commentUrl } from "./commentUrl";

type EditIssueCommentOptions = {
	body?: string;
	repo?: string;
};

const USAGE =
	"Usage: assist github issue edit-comment <comment-id> --body <body> [-R <owner>/<repo>]";

export async function editIssueComment(
	commentIdArg: string,
	options: EditIssueCommentOptions,
): Promise<void> {
	const commentId = Number.parseInt(commentIdArg, 10);
	if (!Number.isInteger(commentId) || commentId <= 0 || !options.body) {
		console.error(USAGE);
		process.exit(1);
	}

	const { body } = options;
	const { owner, repo } = resolveIssueRepoTarget(options.repo);
	const target = `${owner}/${repo} comment ${commentId}`;

	validateProposedContent(
		{ subject: "Comment", context: "GitHub issues" },
		"",
		body,
	);

	const decision = await reviewProposedIssueComment(`Amend ${target}`, body);
	if (decision?.screenshots?.length) {
		console.error(
			`Screenshots cannot be uploaded to an amended comment; ${target} was left unchanged. Post them in a new comment with assist github issue comment --screenshot instead.`,
		);
		process.exit(1);
	}

	const args = [
		"api",
		"-X",
		"PATCH",
		`repos/${owner}/${repo}/issues/comments/${commentId}`,
		"--input",
		"-",
	];

	let raw: string;
	try {
		raw = execFileSync("gh", args, {
			input: JSON.stringify({ body }),
			encoding: "utf8",
		});
	} catch {
		process.exit(1);
	}

	console.log(`Comment updated: ${commentUrl(raw) ?? target}`);
}
