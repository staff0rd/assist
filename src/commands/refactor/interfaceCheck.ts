import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

const EXTENSIONS = [".ts", ".tsx"];

type InterfaceUsage = {
	filePath: string;
	line: number;
	content: string;
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

function checkForInterfaces(): InterfaceUsage[] {
	const sourceFiles = findAllSourceFiles("src");
	const interfacePattern = /^(\s*)(export\s+)?interface\s+\w+/;
	const usages: InterfaceUsage[] = [];

	for (const filePath of sourceFiles) {
		const content = fs.readFileSync(filePath, "utf-8");
		const lines = content.split("\n");

		for (let i = 0; i < lines.length; i++) {
			if (interfacePattern.test(lines[i])) {
				usages.push({
					filePath,
					line: i + 1,
					content: lines[i].trim(),
				});
			}
		}
	}

	return usages;
}

export function runInterfaceCheck(): boolean {
	const interfaceUsages = checkForInterfaces();
	if (interfaceUsages.length > 0) {
		console.error(chalk.red("\nInterface usage check failed:\n"));
		console.error(
			chalk.red("  Use 'type' instead of 'interface' for type definitions.\n"),
		);
		for (const usage of interfaceUsages) {
			console.error(chalk.red(`  ${usage.filePath}:${usage.line}`));
			console.error(chalk.gray(`    ${usage.content}\n`));
		}
		return false;
	}

	if (!process.env.CLAUDECODE) {
		console.log(
			"Interface check passed. No interface declarations found in src/.",
		);
	}
	return true;
}
