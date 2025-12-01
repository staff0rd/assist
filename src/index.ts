#!/usr/bin/env node
import { Command } from "commander";
import { commit } from "./commands/commit.js";
import { sync } from "./commands/sync.js";
import { verify } from "./commands/verify.js";

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

program.parse();
