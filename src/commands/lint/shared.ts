import chalk from "chalk";
import { isAgentHarness } from "../../lib/isAgentHarness";

export type LintViolation = {
	filePath: string;
	line: number;
	content: string;
};

export function reportViolations(
	violations: LintViolation[],
	checkName: string,
	errorMessage: string,
	successMessage: string,
): boolean {
	if (violations.length > 0) {
		console.error(chalk.red(`\n${checkName} failed:\n`));
		console.error(chalk.red(`  ${errorMessage}\n`));
		for (const violation of violations) {
			console.error(chalk.red(`  ${violation.filePath}:${violation.line}`));
			console.error(chalk.gray(`    ${violation.content}\n`));
		}
		return false;
	}

	if (!isAgentHarness()) {
		console.log(successMessage);
	}
	return true;
}
