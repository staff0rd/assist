import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { getPinStatePath } from "./getRestrictedDir";
import { sweepRestrictedDir } from "./sweepRestrictedDir";

type PinState = { pin: string; file: string; line: number; text: string };

function readPinState(pin: string): PinState | undefined {
	const path = getPinStatePath(pin);
	if (!existsSync(path)) return undefined;
	try {
		const state: PinState = JSON.parse(readFileSync(path, "utf8"));
		if (state.pin !== pin) return undefined;
		return state;
	} catch {
		return undefined;
	}
}

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

	const indentSource = lines[index] ?? "";
	const indent = indentSource.match(/^\s*/)?.[0] ?? "";
	lines.splice(index, 0, `${indent}// ${state.text}`);
	writeFileSync(state.file, lines.join("\n"));

	unlinkSync(getPinStatePath(pin));

	console.log(
		chalk.green(`Inserted "// ${state.text}" at ${state.file}:${state.line}`),
	);
}
