#!/usr/bin/env node
import { Command } from "commander";
import packageJson from "../package.json";
import { commit } from "./commands/commit";
import { configGet, configList, configSet } from "./commands/config";
import { init } from "./commands/init";
import { init as lintInit } from "./commands/lint/init";
import { lint } from "./commands/lint/lint";
import { registerNew } from "./commands/new/registerNew";
import { notify } from "./commands/notify";
import { registerBacklog } from "./commands/registerBacklog";
import { registerComplexity } from "./commands/registerComplexity";
import { registerDeploy } from "./commands/registerDeploy";
import { registerDevlog } from "./commands/registerDevlog";
import { registerPrs } from "./commands/registerPrs";
import { registerRefactor } from "./commands/registerRefactor";
import { registerTranscript } from "./commands/registerTranscript";
import { registerVerify } from "./commands/registerVerify";
import { registerRoam } from "./commands/roam/registerRoam";
import { listRunConfigs, run, add as runAdd } from "./commands/run";
import { statusLine } from "./commands/statusLine";
import { sync } from "./commands/sync";
import { update } from "./commands/update";
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
	.command("list")
	.description("List configured run commands")
	.action(listRunConfigs);

runCommand
	.command("add")
	.description("Add a new run configuration to assist.yml")
	.allowUnknownOption()
	.allowExcessArguments()
	.action(() => runAdd());

registerNew(program);

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

program
	.command("update")
	.description("Update assist to the latest version and sync commands")
	.action(update);

registerPrs(program);
registerRoam(program);
registerBacklog(program);
registerVerify(program);
registerRefactor(program);
registerDevlog(program);
registerDeploy(program);
registerComplexity(program);
registerTranscript(program);

program.parse();
