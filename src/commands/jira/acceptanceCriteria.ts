import { execSync } from "node:child_process";
import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { adfToText } from "./adfToText";

const DEFAULT_AC_FIELD = "customfield_11937";

export function acceptanceCriteria(issueKey: string): void {
	const config = loadConfig();
	const field = config.jira?.acField ?? DEFAULT_AC_FIELD;

	let result: string;
	try {
		result = execSync(
			`acli jira workitem view ${issueKey} -f ${field} --json`,
			{ encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
		);
	} catch (error) {
		if (error instanceof Error && "stderr" in error) {
			const stderr = (error as { stderr: string }).stderr;
			if (stderr.includes("unauthorized")) {
				console.error(
					chalk.red("Jira authentication expired."),
					"Run",
					chalk.cyan("assist jira auth"),
					"to re-authenticate.",
				);
				process.exit(1);
			}
		}
		console.error(chalk.red(`Failed to fetch ${issueKey}.`));
		process.exit(1);
	}

	const parsed = JSON.parse(result);
	const acValue = parsed?.fields?.[field];

	if (!acValue) {
		console.log(chalk.yellow(`No acceptance criteria found on ${issueKey}.`));
		return;
	}

	if (typeof acValue === "string") {
		console.log(acValue);
		return;
	}

	if (acValue.type === "doc") {
		console.log(adfToText(acValue));
		return;
	}

	console.log(JSON.stringify(acValue, null, 2));
}
