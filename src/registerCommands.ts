import { execSync } from "node:child_process";
import type { Command } from "commander";
import { commit } from "./commands/commit";
import { init } from "./commands/init";
import { lint } from "./commands/lint/lint";
import { sync } from "./commands/sync";
import {
	hardcodedColors as verifyHardcodedColors,
	init as verifyInit,
	run as verifyRun,
} from "./commands/verify";
import { init as vscodeInit } from "./commands/vscode";
import { registerDevlogCommands } from "./registerDevlogCommands.js";
import { registerRefactorCommands } from "./registerRefactorCommands.js";

export function registerCommands(program: Command): void {
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
			execSync("npm install -g @anthropic-ai/claude-code", {
				stdio: "inherit",
			});
		});

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

	program
		.command("lint")
		.description("Run lint checks for conventions not enforced by biomejs")
		.action(lint);

	registerRefactorCommands(program);
	registerDevlogCommands(program);
	registerVscodeCommands(program);
}

function registerVscodeCommands(program: Command): void {
	const vscodeCommand = program
		.command("vscode")
		.description("VS Code configuration utilities");

	vscodeCommand
		.command("init")
		.description("Add VS Code configuration files")
		.action(vscodeInit);
}
