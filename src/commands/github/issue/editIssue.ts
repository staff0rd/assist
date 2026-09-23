import { inWebSession } from "../../sessions/shared/inWebSession";
import { prepareIssueEdit } from "./prepareIssueEdit";
import { pushUnchangedIssue } from "./pushUnchangedIssue";
import { reviewProposedIssueEdit } from "./reviewProposedIssueEdit";
import { setIssueParent } from "./setIssueParent";
import { validateIssueBody } from "./validateIssueBody";
import { viewIssue } from "./viewIssue";

type EditIssueOptions = {
	repo?: string;
	fresh?: boolean;
	parent?: string;
};

const USAGE =
	"Usage: assist github issue edit <number> [-R <owner>/<repo>] [--parent <issue>]";

export async function editIssue(
	numberArg: string,
	options: EditIssueOptions,
): Promise<void> {
	const number = Number.parseInt(numberArg, 10);
	if (!Number.isInteger(number) || number <= 0) {
		console.error(USAGE);
		process.exit(1);
	}

	if (options.parent) {
		setIssueParent(number, options.repo, options.parent);
		return;
	}

	if (!inWebSession()) {
		viewIssue(number, options.repo);
		return;
	}

	const issue = prepareIssueEdit(number, options.repo, options.fresh);
	const edited = await reviewProposedIssueEdit(
		`Edit ${issue.target}: ${issue.title}`,
		issue.body,
		{ path: issue.bodyPath, save: issue.save },
	);
	validateIssueBody(issue.title, edited);

	pushUnchangedIssue(
		number,
		options.repo,
		issue.target,
		issue.updatedAt,
		issue.bodyPath,
	);
}
