import type { Command } from "commander";
import {
	check as refactorCheck,
	ignore as refactorIgnore,
} from "./commands/refactor";

export function registerRefactorCommands(program: Command): void {
	const refactorCommand = program
		.command("refactor")
		.description("Run refactoring checks for code quality");

	refactorCommand
		.command("check [pattern]")
		.description("Check for files that exceed the maximum line count")
		.option("--modified", "Check only staged and unstaged files")
		.option("--staged", "Check only staged files")
		.option("--unstaged", "Check only unstaged files")
		.option(
			"--max-lines <number>",
			"Maximum lines allowed per file (default: 100)",
			Number.parseInt,
		)
		.action(refactorCheck);

	refactorCommand
		.command("ignore <file>")
		.description("Add a file to the refactor ignore list")
		.action(refactorIgnore);
}
