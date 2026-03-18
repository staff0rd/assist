import chalk from "chalk";
import { adfToText } from "./adfToText";
import { fetchIssue } from "./fetchIssue";

export function viewIssue(issueKey: string): void {
	const parsed = fetchIssue(issueKey, "summary,description");
	const fields = parsed?.fields as Record<string, unknown> | undefined;
	const summary = fields?.summary as string | undefined;
	const description = fields?.description as
		| string
		| { type: string; content?: unknown[] }
		| undefined;

	if (summary) {
		console.log(chalk.bold(summary));
	}

	if (description) {
		if (summary) console.log();
		if (typeof description === "string") {
			console.log(description);
		} else if (description.type === "doc") {
			console.log(adfToText(description as Parameters<typeof adfToText>[0]));
		} else {
			console.log(JSON.stringify(description, null, 2));
		}
	}

	if (!summary && !description) {
		console.log(
			chalk.yellow(`No summary or description found on ${issueKey}.`),
		);
	}
}
