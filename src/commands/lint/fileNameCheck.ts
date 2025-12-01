import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

const EXTENSIONS = [".ts", ".tsx"];

type FileNameViolation = {
	filePath: string;
	fileName: string;
};

function findAllSourceFiles(dir: string): string[] {
	const results: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory() && entry.name !== "node_modules") {
			results.push(...findAllSourceFiles(fullPath));
		} else if (
			entry.isFile() &&
			EXTENSIONS.some((ext) => entry.name.endsWith(ext))
		) {
			results.push(fullPath);
		}
	}

	return results;
}

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
	const sourceFiles = findAllSourceFiles("src");
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
