import path from "node:path";
import chalk from "chalk";
import type { MaintainabilityGitState } from "./getMaintainabilityGitState";
import type { ResultEntry } from "./ResultEntry";

function suggestDestination(file: string, functionName: string): string {
	return path.join(path.dirname(file), `${functionName}.ts`);
}

function remediationLine(entry: ResultEntry): string {
	const { file, largestFunction } = entry;
	if (largestFunction === "" || largestFunction.startsWith("<"))
		return `  Move the largest responsibility out of ${chalk.bold(file)} into a new file with 'assist refactor extract'.`;
	const dest = suggestDestination(file, largestFunction);
	const command = `assist refactor extract ${file} ${largestFunction} ${dest} --apply`;
	return `  ${chalk.bold(file)} → extract '${largestFunction}' to a new file:\n    ${chalk.cyan(command)}`;
}

function cheatLine(
	entry: ResultEntry,
	gitState: MaintainabilityGitState,
): string {
	const shrank = gitState.shrunkFiles.has(path.resolve(entry.file));
	if (!shrank || gitState.newFileCreated) return "";
	return `\n    ${chalk.red("✗ You shrank existing lines in this file without creating a new file. That cannot clear the gate — extract a responsibility to a new file.")}`;
}

export function printMaintainabilityFailure(
	failing: ResultEntry[],
	gitState: MaintainabilityGitState,
): void {
	const blocks = failing
		.map((entry) => `${remediationLine(entry)}${cheatLine(entry, gitState)}`)
		.join("\n");
	console.error(
		chalk.red(
			`\nFail: ${failing.length} file(s) below threshold → extract a responsibility to a new file.\n\n${blocks}\n\n${chalk.bold("Diagnose and fix one file at a time.")} Only a new file (Write) or 'assist refactor extract' clears this gate — editing the existing lines does not.`,
		),
	);
}
