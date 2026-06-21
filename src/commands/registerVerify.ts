import type { Command } from "commander";
import {
	commentPolicy as verifyCommentPolicy,
	hardcodedColors as verifyHardcodedColors,
	init as verifyInit,
	list as verifyList,
	noVenv as verifyNoVenv,
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
		.option(
			"--measure",
			"Print a summary table of each command's status and duration after the run",
		)
		.option("--verbose", "Show all output (bypass CLAUDECODE suppression)")
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
		.option(
			"--package-json",
			"Write scripts to package.json instead of assist.yml",
		)
		.action(verifyInit);

	verifyCommand
		.command("hardcoded-colors")
		.description("Check for hardcoded hex colors in src/")
		.action(verifyHardcodedColors);

	verifyCommand
		.command("comment-policy")
		.description("Check for undocumented comments added on changed lines")
		.action(verifyCommentPolicy);

	verifyCommand
		.command("no-venv")
		.description("Check that no venv folders exist in the repo")
		.action(verifyNoVenv);
}
