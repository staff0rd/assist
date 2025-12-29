import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { findSourceFiles } from "../../findSourceFiles";

type FileNameViolation = {
	filePath: string;
	fileName: string;
};

function hasClassOrComponent(content: string): boolean {
	const classPattern = /^(export\s+)?(abstract\s+)?class\s+\w+/m;
	const functionComponentPattern =
		/^(export\s+)?(default\s+)?function\s+[A-Z]\w*\s*\(/m;
	const arrowComponentPattern = /^(export\s+)?(const|let)\s+[A-Z]\w*\s*=.*=>/m;

	return (
		classPattern.test(content) ||
		functionComponentPattern.test(content) ||
		arrowComponentPattern.test(content)
	);
}

function checkFileNames(): FileNameViolation[] {
	const sourceFiles = findSourceFiles("src");
	const violations: FileNameViolation[] = [];

	for (const filePath of sourceFiles) {
		const fileName = path.basename(filePath);
		const nameWithoutExt = fileName.replace(/\.(ts|tsx)$/, "");

		if (/^[A-Z]/.test(nameWithoutExt)) {
			const content = fs.readFileSync(filePath, "utf-8");
			if (!hasClassOrComponent(content)) {
				violations.push({ filePath, fileName });
			}
		}
	}

	return violations;
}

export function runFileNameCheck(): boolean {
	const violations = checkFileNames();
	if (violations.length > 0) {
		console.error(chalk.red("\nFile name check failed:\n"));
		console.error(
			chalk.red(
				"  Files without classes or React components should not start with a capital letter.\n",
			),
		);
		for (const violation of violations) {
			console.error(chalk.red(`  ${violation.filePath}`));
			console.error(
				chalk.gray(
					`    Rename to: ${violation.fileName.charAt(0).toLowerCase()}${violation.fileName.slice(1)}\n`,
				),
			);
		}
		return false;
	}

	if (!process.env.CLAUDECODE) {
		console.log(
			"File name check passed. All PascalCase files contain classes or components.",
		);
	}
	return true;
}
