import chalk from "chalk";
import { eq } from "drizzle-orm";
import { items } from "../../../shared/db/schema";
import { beginAssociation } from "../beginAssociation";
import { formatItemId } from "../formatItemId";
import { fetchGithubIssueTitle } from "./fetchGithubIssueTitle";
import { normalizeGithubIssue } from "./normalizeGithubIssue";

type AssociateGithubOptions = {
	clear?: boolean;
};

export async function associateGithub(
	id: string,
	issue: string | undefined,
	options: AssociateGithubOptions,
): Promise<void> {
	const target = await beginAssociation(
		id,
		options,
		{ githubIssue: null },
		"GitHub",
	);
	if (!target) return;

	const { orm, itemId } = target;

	if (!issue) {
		console.log(
			chalk.red("Provide a GitHub issue, or use --clear to remove one."),
		);
		process.exitCode = 1;
		return;
	}

	const normalized = normalizeGithubIssue(issue);
	if (!normalized) {
		console.log(
			chalk.red(
				`Malformed GitHub issue "${issue}". Expected owner/repo#number or a github.com issue URL.`,
			),
		);
		process.exitCode = 1;
		return;
	}

	const title = fetchGithubIssueTitle(normalized);

	await orm
		.update(items)
		.set({ githubIssue: normalized, jiraKey: null })
		.where(eq(items.id, itemId));

	console.log(
		chalk.green(`Associated ${normalized} with item ${formatItemId(itemId)}.`),
		title ? chalk.dim(`(${title})`) : "",
	);
}
