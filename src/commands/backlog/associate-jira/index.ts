import chalk from "chalk";
import { eq } from "drizzle-orm";
import { items } from "../../../shared/db/schema";
import { fetchIssue } from "../../jira/fetchIssue";
import { findOneItem } from "../shared";

const JIRA_KEY_PATTERN = /^[A-Z]+-\d+$/;

type AssociateJiraOptions = {
	clear?: boolean;
};

export async function associateJira(
	id: string,
	key: string | undefined,
	options: AssociateJiraOptions,
): Promise<void> {
	const found = await findOneItem(id);
	if (!found) {
		process.exitCode = 1;
		return;
	}

	const { orm } = found;
	const itemId = found.item.id;

	if (options.clear) {
		await orm.update(items).set({ jiraKey: null }).where(eq(items.id, itemId));
		console.log(chalk.green(`Cleared Jira association on item #${itemId}.`));
		return;
	}

	if (!key) {
		console.log(chalk.red("Provide a Jira key, or use --clear to remove one."));
		process.exitCode = 1;
		return;
	}

	if (!JIRA_KEY_PATTERN.test(key)) {
		console.log(
			chalk.red(`Malformed Jira key "${key}". Expected a key like PROJ-123.`),
		);
		process.exitCode = 1;
		return;
	}

	const parsed = fetchIssue(key, "summary");
	const fields = parsed?.fields as Record<string, unknown> | undefined;
	const summary = fields?.summary as string | undefined;

	await orm.update(items).set({ jiraKey: key }).where(eq(items.id, itemId));

	console.log(
		chalk.green(`Associated ${key} with item #${itemId}.`),
		summary ? chalk.dim(`(${summary})`) : "",
	);
}
