import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { adfToText } from "./adfToText";
import { fetchIssue } from "./fetchIssue";

const DEFAULT_AC_FIELD = "customfield_11937";

export function acceptanceCriteria(issueKey: string): void {
	const config = loadConfig();
	const field = config.jira?.acField ?? DEFAULT_AC_FIELD;

	const parsed = fetchIssue(issueKey, field);
	const acValue = (parsed?.fields as Record<string, unknown> | undefined)?.[
		field
	];

	if (!acValue) {
		console.log(chalk.yellow(`No acceptance criteria found on ${issueKey}.`));
		return;
	}

	if (typeof acValue === "string") {
		console.log(acValue);
		return;
	}

	if ((acValue as { type?: string }).type === "doc") {
		console.log(adfToText(acValue as Parameters<typeof adfToText>[0]));
		return;
	}

	console.log(JSON.stringify(acValue, null, 2));
}
