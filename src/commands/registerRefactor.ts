import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { check as refactorCheck } from "./refactor/check";
import { extract as refactorExtract } from "./refactor/extract";
import { ignore as refactorIgnore } from "./refactor/ignore";
import { refactorConfigHelp } from "./refactor/refactorConfigHelp";
import { rename as refactorRename } from "./refactor/rename";
import { renameSymbol as refactorRenameSymbol } from "./refactor/renameSymbol";
import { restructure as refactorRestructure } from "./refactor/restructure";

function registerCheck(parent: Command): void {
	parent
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
}

function registerRename(parent: Command): void {
	const renameCommand = parent
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
}

function registerRestructure(parent: Command): void {
	const restructureCommand = parent
		.command("restructure [root]")
		.description(
			"Place every file under root by its import graph: single-importer files nest under their importer, shared files sit at their importers' lowest common folder",
		)
		.option(
			"--apply",
			"Move files, rewrite their imports and vi.mock paths, and remove emptied folders (default: dry-run)",
		)
		.option(
			"--check",
			"List files that drift from the plan and exit non-zero if any do",
		)
		.action(refactorRestructure);

	configHelp(restructureCommand, refactorConfigHelp);
}

export function registerRefactor(program: Command): void {
	const refactorCommand = program
		.command("refactor")
		.description("Run refactoring checks for code quality");

	registerCheck(refactorCommand);

	refactorCommand
		.command("extract <file> <functionName> <destination>")
		.description(
			"Extract a function and its private dependencies to a new file",
		)
		.option("--apply", "Execute the extraction (default: dry-run)")
		.action(refactorExtract);

	refactorCommand
		.command("ignore <file>")
		.description("Add a file to the refactor ignore list")
		.action(refactorIgnore);

	registerRename(refactorCommand);
	registerRestructure(refactorCommand);
}
