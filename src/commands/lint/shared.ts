import chalk from "chalk";

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

	if (!process.env.CLAUDECODE) {
		console.log(successMessage);
	}
	return true;
}
