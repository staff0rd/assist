#!/usr/bin/env node
import { Command } from "commander";
import { commit } from "./commands/commit";
import { lint } from "./commands/lint/lint";
import { next as refactorCheckNext } from "./commands/refactor/next";
import {
	check as refactorCheck,
	ignore as refactorIgnore,
} from "./commands/refactor/refactor";
import { sync } from "./commands/sync";
import { verify } from "./commands/verify";

const program = new Command();

program.name("assist").description("CLI application").version("1.0.0");

program
	.command("sync")
	.description("Copy command files to ~/.claude/commands")
	.action(sync);

program
	.command("commit <message>")
	.description("Create a git commit with validation")
	.action(commit);

program
	.command("verify")
	.description("Run all verify:* scripts from package.json in parallel")
	.action(verify);

program
	.command("lint")
	.description("Run lint checks for conventions not enforced by biomejs")
	.action(lint);

const refactorCommand = program
	.command("refactor")
	.description("Run refactoring checks for code quality");

const refactorCheckCommand = refactorCommand
	.command("check [pattern]")
	.description("Check for files that exceed 100 lines")
	.action(refactorCheck);

refactorCheckCommand
	.command("next")
	.description("Show the next file to refactor (largest violation)")
	.action(refactorCheckNext);

refactorCommand
	.command("ignore <file>")
	.description("Add a file to the refactor ignore list")
	.requiredOption("--reason <reason>", "Reason for ignoring the file")
	.action(refactorIgnore);

program.parse();
