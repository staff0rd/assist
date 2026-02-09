import type { Command } from "commander";
import {
	check as refactorCheck,
	ignore as refactorIgnore,
	restructure as refactorRestructure,
} from "./refactor";

export function registerRefactor(program: Command): void {
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

	refactorCommand
		.command("restructure [pattern]")
		.description(
			"Analyze import graph and restructure tightly-coupled files into nested directories",
		)
		.option("--apply", "Execute the restructuring (default: dry-run)")
		.option(
			"--max-depth <number>",
			"Maximum nesting iterations (default: 3)",
			Number.parseInt,
		)
		.action(refactorRestructure);
}
