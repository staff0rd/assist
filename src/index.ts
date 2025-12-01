#!/usr/bin/env node
import { Command } from "commander";
import { commit } from "./commands/commit";
import { lint } from "./commands/lint/lint";
import { refactor } from "./commands/refactor/refactor";
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

program
	.command("refactor")
	.description("Run refactoring checks for code quality")
	.action(refactor);

program.parse();
