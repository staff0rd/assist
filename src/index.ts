#!/usr/bin/env node
import { execSync } from "node:child_process";
import { Command } from "commander";
import packageJson from "../package.json";
import { commit } from "./commands/commit";
import { configGet, configList, configSet } from "./commands/config";
import { init } from "./commands/init";
import { init as lintInit } from "./commands/lint/init";
import { lint } from "./commands/lint/lint";
import { newProject } from "./commands/new/newProject";
import { notify } from "./commands/notify";
import { registerComplexity } from "./commands/registerComplexity";
import { registerDeploy } from "./commands/registerDeploy";
import { registerDevlog } from "./commands/registerDevlog";
import { registerPrs } from "./commands/registerPrs";
import { registerRefactor } from "./commands/registerRefactor";
import { registerTranscript } from "./commands/registerTranscript";
import { registerVerify } from "./commands/registerVerify";
import { run, add as runAdd } from "./commands/run";
import { statusLine } from "./commands/statusLine";
import { sync } from "./commands/sync";
import { init as vscodeInit } from "./commands/vscode";

const program = new Command();

program
	.name("assist")
	.description("CLI application")
	.version(packageJson.version);

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

const configCommand = program
	.command("config")
	.description("View and modify assist.yml configuration");

configCommand
	.command("set <key> <value>")
	.description("Set a config value (e.g. commit.push true)")
	.action(configSet);

configCommand
	.command("get <key>")
	.description("Get a config value")
	.action(configGet);

configCommand
	.command("list")
	.description("List all config values")
	.action(configList);

const runCommand = program
	.command("run")
	.description("Run a configured command from assist.yml")
	.argument("<name>", "Name of the configured command")
	.argument("[args...]", "Arguments to pass to the command")
	.allowUnknownOption()
	.action((name, args) => {
		run(name, args);
	});

runCommand
	.command("add")
	.description("Add a new run configuration to assist.yml")
	.allowUnknownOption()
	.allowExcessArguments()
	.action(() => runAdd());

program
	.command("new")
	.description("Initialize a new Vite React TypeScript project")
	.action(newProject);

const lintCommand = program
	.command("lint")
	.description("Run lint checks for conventions not enforced by biomejs")
	.action(lint);

lintCommand
	.command("init")
	.description("Initialize Biome with standard linter config")
	.action(lintInit);

const vscodeCommand = program
	.command("vscode")
	.description("VS Code configuration utilities");

vscodeCommand
	.command("init")
	.description("Add VS Code configuration files")
	.action(vscodeInit);

program
	.command("status-line")
	.description("Format Claude Code status line from JSON stdin")
	.action(statusLine);

program
	.command("notify")
	.description(
		"Show notification from Claude Code hook (reads JSON from stdin)",
	)
	.action(notify);

registerPrs(program);
registerVerify(program);
registerRefactor(program);
registerDevlog(program);
registerDeploy(program);
registerComplexity(program);
registerTranscript(program);

program.parse();
