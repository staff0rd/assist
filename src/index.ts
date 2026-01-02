#!/usr/bin/env node
import { execSync } from "node:child_process";
import { Command } from "commander";
import { commit } from "./commands/commit";
import { init as deployInit } from "./commands/deploy/init";
import {
	diff as devlogDiff,
	next as devlogNext,
	skip as devlogSkip,
	version as devlogVersion,
} from "./commands/devlog";
import { init } from "./commands/init";
import { init as lintInit } from "./commands/lint/init";
import { lint } from "./commands/lint/lint";
import { newProject } from "./commands/new/newProject";
import {
	check as refactorCheck,
	ignore as refactorIgnore,
} from "./commands/refactor";
import { sync } from "./commands/sync";
import {
	hardcodedColors as verifyHardcodedColors,
	init as verifyInit,
	run as verifyRun,
} from "./commands/verify";
import { init as vscodeInit } from "./commands/vscode";

const program = new Command();

program.name("assist").description("CLI application").version("1.0.0");

program
	.command("sync")
	.description("Copy command files to ~/.claude/commands")
	.action(sync);

program
	.command("init")
	.description("Initialize VS Code and verify configurations")
	.action(init);

program
	.command("commit <message>")
	.description("Create a git commit with validation")
	.action(commit);

program
	.command("update")
	.description("Update claude-code to the latest version")
	.action(() => {
		console.log("Updating claude-code...");
		execSync("npm install -g @anthropic-ai/claude-code", { stdio: "inherit" });
	});

program
	.command("new")
	.description("Initialize a new Vite React TypeScript project")
	.action(newProject);

const verifyCommand = program
	.command("verify")
	.description("Run all verify:* scripts from package.json in parallel")
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

const lintCommand = program
	.command("lint")
	.description("Run lint checks for conventions not enforced by biomejs")
	.action(lint);

lintCommand
	.command("init")
	.description("Initialize Biome with standard linter config")
	.action(lintInit);

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
	.option("--since <date>", "Only show commits since this date (YYYY-MM-DD)")
	.option("-r, --reverse", "Show earliest commits first")
	.option("-v, --verbose", "Show file names for each commit")
	.action(devlogDiff);

devlogCommand
	.command("version")
	.description("Show current repo name and version info")
	.action(devlogVersion);

devlogCommand
	.command("next")
	.description("Show commits for the day after the last versioned entry")
	.option("-v, --verbose", "Show file names for each commit")
	.action(devlogNext);

devlogCommand
	.command("skip <date>")
	.description("Add a date (YYYY-MM-DD) to the skip list")
	.action(devlogSkip);

const vscodeCommand = program
	.command("vscode")
	.description("VS Code configuration utilities");

vscodeCommand
	.command("init")
	.description("Add VS Code configuration files")
	.action(vscodeInit);

const deployCommand = program
	.command("deploy")
	.description("Netlify deployment utilities");

deployCommand
	.command("init")
	.description("Initialize Netlify project and configure deployment")
	.action(deployInit);

program.parse();
