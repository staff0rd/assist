import fs from "node:fs";
import chalk from "chalk";
import { findSourceFiles } from "../../shared/findSourceFiles";

type ImportViolation = {
	filePath: string;
	line: number;
	content: string;
};

function checkForDynamicImports(filePath: string): ImportViolation[] {
	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	const violations: ImportViolation[] = [];

	const requirePattern = /\brequire\s*\(/;
	const dynamicImportPattern = /\bimport\s*\(/;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (requirePattern.test(line) || dynamicImportPattern.test(line)) {
			violations.push({
				filePath,
				line: i + 1,
				content: line.trim(),
			});
		}
	}

	return violations;
}

function checkStaticImports(): ImportViolation[] {
	const sourceFiles = findSourceFiles("src");
	const violations: ImportViolation[] = [];

	for (const filePath of sourceFiles) {
		violations.push(...checkForDynamicImports(filePath));
	}

	return violations;
}

export function runStaticImportCheck(): boolean {
	const violations = checkStaticImports();
	if (violations.length > 0) {
		console.error(chalk.red("\nStatic import check failed:\n"));
		console.error(
			chalk.red(
				"  Dynamic imports (require() and import()) are not allowed. Use static imports instead.\n",
			),
		);
		for (const violation of violations) {
			console.error(chalk.red(`  ${violation.filePath}:${violation.line}`));
			console.error(chalk.gray(`    ${violation.content}\n`));
		}
		return false;
	}

	if (!process.env.CLAUDECODE) {
		console.log("Static import check passed. No dynamic imports found.");
	}
	return true;
}
