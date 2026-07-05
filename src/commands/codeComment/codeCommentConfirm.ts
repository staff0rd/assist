import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { isYamlFile } from "../../shared/isYamlFile";
import { getPinStatePath } from "./getRestrictedDir";
import { sweepRestrictedDir } from "./sweepRestrictedDir";
import { readPinState } from "./readPinState";

export function codeCommentConfirm(pin: string): void {
	sweepRestrictedDir();
	const state = readPinState(pin);
	if (!state) {
		console.error(chalk.red(`No pending comment for pin: ${pin}`));
		process.exitCode = 1;
		return;
	}

	if (!existsSync(state.file)) {
		console.error(chalk.red(`Target file no longer exists: ${state.file}`));
		process.exitCode = 1;
		return;
	}

	const original = readFileSync(state.file, "utf8");
	const lines = original.split("\n");
	const index = state.line - 1;
	if (index > lines.length) {
		console.error(
			chalk.red(
				`Line ${state.line} is beyond the end of ${state.file} (${lines.length} lines).`,
			),
		);
		process.exitCode = 1;
		return;
	}

	const marker = isYamlFile(state.file) ? "#" : "//";
	const indentSource = lines[index] ?? "";
	const indent = indentSource.match(/^\s*/)?.[0] ?? "";
	lines.splice(index, 0, `${indent}${marker} ${state.text}`);
	writeFileSync(state.file, lines.join("\n"));

	unlinkSync(getPinStatePath(pin));

	console.log(
		chalk.green(
			`Inserted "${marker} ${state.text}" at ${state.file}:${state.line}`,
		),
	);
}
