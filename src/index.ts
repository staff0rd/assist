#!/usr/bin/env node
import { Command } from "commander";
import { commit } from "./commands/commit";
import { diff as devlogDiff } from "./commands/devlog/devlog";
import { lint } from "./commands/lint/lint";
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
	.option("--timer", "Show timing information for each task as they complete")
	.action((options) => verify(options));

program
	.command("lint")
	.description("Run lint checks for conventions not enforced by biomejs")
	.action(lint);

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

const devlogCommand = program
	.command("devlog")
	.description("Development log utilities");

devlogCommand
	.command("diff")
	.description("Group git commits by date")
	.option(
		"--days <number>",
		"Number of days to show (default: 30)",
		Number.parseInt,
	)
	.action(devlogDiff);

program.parse();
