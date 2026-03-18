import { execSync } from "node:child_process";
import chalk from "chalk";

export function fetchIssue(
	issueKey: string,
	fields: string,
): Record<string, unknown> {
	let result: string;
	try {
		result = execSync(
			`acli jira workitem view ${issueKey} -f ${fields} --json`,
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

	return JSON.parse(result);
}
