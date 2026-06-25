import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import chalk from "chalk";
import { getPinStatePath, getRestrictedDir } from "./getRestrictedDir";
import { sweepRestrictedDir } from "./sweepRestrictedDir";
import { validateCommentText } from "./validateCommentText";

function generatePin(): string {
	return randomBytes(4).toString("hex");
}

export function codeCommentSet(file: string, line: string, text: string): void {
	const lineNumber = Number.parseInt(line, 10);
	if (!Number.isInteger(lineNumber) || lineNumber < 1) {
		console.error(chalk.red(`Invalid line number: ${line}`));
		process.exitCode = 1;
		return;
	}

	const validation = validateCommentText(text);
	if (!validation.ok) {
		console.error(chalk.red(`Refused: ${validation.reason}`));
		console.error(chalk.red("No pin issued."));
		process.exitCode = 1;
		return;
	}

	console.error(
		chalk.yellow.bold(
			"Think hard. Comments are a last resort, not a habit.\n" +
				"Almost every comment you reach for is a sign the code should be clearer instead.\n" +
				"Before you confirm this pin, ask whether a better name, a smaller function, or a\n" +
				"test would make the comment redundant. If you are still sure this one line earns\n" +
				"its keep, run the confirm step below.",
		),
	);

	const pin = generatePin();
	mkdirSync(getRestrictedDir(), { recursive: true });
	sweepRestrictedDir();
	writeFileSync(
		getPinStatePath(pin),
		JSON.stringify({ pin, file, line: lineNumber, text: validation.text }),
	);

	console.log(
		`${chalk.green(`Pin issued: ${pin}`)}\nTo insert "// ${validation.text}" at ${file}:${lineNumber}, run:\n${chalk.cyan(`  assist code-comment confirm ${pin}`)}`,
	);
}
