import type { Command } from "commander";
import {
	hardcodedColors as verifyHardcodedColors,
	init as verifyInit,
	run as verifyRun,
} from "./verify";

export function registerVerify(program: Command): void {
	const verifyCommand = program
		.command("verify")
		.description("Run all verify:* commands in parallel")
		.option("--timer", "Show timing information for each task as they complete")
		.action((options) => verifyRun(options));

	verifyCommand
		.command("init")
		.description("Add verify scripts to a project")
		.action(verifyInit);

	verifyCommand
		.command("hardcoded-colors")
		.description("Check for hardcoded hex colors in src/")
		.action(verifyHardcodedColors);
}
