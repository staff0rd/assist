import { execSync } from "node:child_process";
import chalk from "chalk";
import type { AssistConfig } from "./types";

export function warnIfUnexpectedBranch(config: AssistConfig): void {
	const expected = config.commit?.expectedBranch;
	if (!expected) return;
	const current = currentBranch();
	if (current === null || current === expected) return;

	const line = "─".repeat(64);
	console.warn(
		chalk.yellow.bold(
			[
				"",
				line,
				`⚠  On branch "${current}", but this repo expects "${expected}".`,
				`   Work committed here may be orphaned and never reach "${expected}".`,
				line,
				"",
			].join("\n"),
		),
	);
}

function currentBranch(): string | null {
	try {
		return execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf8",
		}).trim();
	} catch {
		return null;
	}
}
