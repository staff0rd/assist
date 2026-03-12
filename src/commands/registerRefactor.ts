import type { Command } from "commander";
import {
	check as refactorCheck,
	ignore as refactorIgnore,
	rename as refactorRename,
	renameSymbol as refactorRenameSymbol,
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

	const renameCommand = refactorCommand
		.command("rename")
		.description("Rename files or symbols with automatic import updates");

	renameCommand
		.command("file <source> <destination>")
		.description("Rename/move a TypeScript file and update all imports")
		.option("--apply", "Execute the rename (default: dry-run)")
		.action(refactorRename);

	renameCommand
		.command("symbol <file> <oldName> <newName>")
		.description(
			"Rename a variable, function, class, or type across the project",
		)
		.option("--apply", "Execute the rename (default: dry-run)")
		.action(refactorRenameSymbol);

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
