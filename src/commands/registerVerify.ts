import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { registerVerifyChecks } from "./registerVerifyChecks";
import {
	init as verifyInit,
	list as verifyList,
	run as verifyRun,
} from "./verify";
import { verifyConfigHelp } from "./verify/verifyConfigHelp";

function runScope(scope: string | undefined, options: object): void {
	if (scope && scope !== "all") {
		console.error(`Unknown scope: "${scope}". Use "all" to run all checks.`);
		process.exit(1);
	}
	verifyRun({ ...options, all: scope === "all" });
}

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
		.action(runScope);

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

	registerVerifyChecks(verifyCommand);

	configHelp(verifyCommand, verifyConfigHelp);
}
