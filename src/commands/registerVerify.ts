import type { Command } from "commander";
import {
	hardcodedColors as verifyHardcodedColors,
	init as verifyInit,
	list as verifyList,
	run as verifyRun,
} from "./verify";

export function registerVerify(program: Command): void {
	const verifyCommand = program
		.command("verify")
		.description("Run all verify:* commands in parallel")
		.argument(
			"[scope]",
			'Use "all" to run all checks, ignoring diff-based filters',
		)
		.option("--timer", "Show timing information for each task as they complete")
		.action((scope, options) => {
			if (scope && scope !== "all") {
				console.error(
					`Unknown scope: "${scope}". Use "all" to run all checks.`,
				);
				process.exit(1);
			}
			verifyRun({ ...options, all: scope === "all" });
		});

	verifyCommand
		.command("list")
		.description("List configured verify commands")
		.action(verifyList);

	verifyCommand
		.command("init")
		.description("Add verify scripts to a project")
		.action(verifyInit);

	verifyCommand
		.command("hardcoded-colors")
		.description("Check for hardcoded hex colors in src/")
		.action(verifyHardcodedColors);
}
