import fs from "node:fs";
import chalk from "chalk";

const REFACTOR_YML_PATH = "refactor.yml";

export function ignore(file: string): void {
	if (!fs.existsSync(file)) {
		console.error(chalk.red(`Error: File does not exist: ${file}`));
		process.exit(1);
	}

	const content = fs.readFileSync(file, "utf-8");
	const lineCount = content.split("\n").length;
	const maxLines = lineCount + 10;

	const entry = `- file: ${file}\n  maxLines: ${maxLines}\n`;

	if (fs.existsSync(REFACTOR_YML_PATH)) {
		const existing = fs.readFileSync(REFACTOR_YML_PATH, "utf-8");
		fs.writeFileSync(REFACTOR_YML_PATH, existing + entry);
	} else {
		fs.writeFileSync(REFACTOR_YML_PATH, entry);
	}

	console.log(
		chalk.green(
			`Added ${file} to refactor ignore list (max ${maxLines} lines)`,
		),
	);
}
