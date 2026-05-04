#!/usr/bin/env node
import { Command } from "commander";
import packageJson from "../package.json";
import { next as backlogNext } from "./commands/backlog";
import { launchMode } from "./commands/backlog/launchMode";
import { refine } from "./commands/backlog/refine";
import { writeSignal } from "./commands/backlog/writeSignal";
import { commit } from "./commands/commit";
import { coverage } from "./commands/coverage";
import { init } from "./commands/init";
import { init as lintInit } from "./commands/lint/init";
import { lint } from "./commands/lint/lint";
import { registerNew } from "./commands/new/registerNew";
import { notify } from "./commands/notify";
import { registerActivity } from "./commands/registerActivity";
import { registerBacklog } from "./commands/registerBacklog";
import { registerCliHook } from "./commands/registerCliHook";
import { registerComplexity } from "./commands/registerComplexity";
import { registerConfig } from "./commands/registerConfig";
import { registerDeny } from "./commands/registerDeny";
import { registerDeploy } from "./commands/registerDeploy";
import { registerDevlog } from "./commands/registerDevlog";
import { registerDotnet } from "./commands/registerDotnet";
import { registerJira } from "./commands/registerJira";
import { registerMermaid } from "./commands/registerMermaid";
import { registerNews } from "./commands/registerNews";
import { registerPrompts } from "./commands/registerPrompts";
import { registerPrs } from "./commands/registerPrs";
import { registerRavendb } from "./commands/registerRavendb";
import { registerRefactor } from "./commands/registerRefactor";
import { registerSeq } from "./commands/registerSeq";
import { registerSql } from "./commands/registerSql";
import { registerTranscript } from "./commands/registerTranscript";
import { registerVerify } from "./commands/registerVerify";
import { registerVoice } from "./commands/registerVoice";
import { registerRoam } from "./commands/roam/registerRoam";
import { registerRun } from "./commands/run/registerRun";
import { screenshot } from "./commands/screenshot";
import { registerSessions } from "./commands/sessions/registerSessions";
import { web as sessionsWeb } from "./commands/sessions/web";
import { statusLine } from "./commands/statusLine";
import { sync } from "./commands/sync";
import { update } from "./commands/update";
import { init as vscodeInit } from "./commands/vscode";

const program = new Command();

program
	.name("assist")
	.description("CLI application")
	.version(packageJson.version)
	.action(() => sessionsWeb({ port: "3100" }));

program
	.command("sync")
	.description("Copy command files to ~/.claude/commands")
	.option("-y, --yes", "Overwrite settings.json without prompting")
	.action((options) => sync(options));

program
	.command("init")
	.description("Initialize VS Code and verify configurations")
	.action(init);

program
	.command("commit")
	.description("Create a git commit with validation")
	.argument("<args...>", "status | <message> [files...]")
	.action(commit);

registerConfig(program);

registerRun(program);

registerNew(program);

const lintCommand = program
	.command("lint")
	.description("Run lint checks for conventions not enforced by biomejs")
	.option("-f, --fix", "Auto-fix violations where possible")
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

program
	.command("coverage")
	.description("Print global statement coverage percentage")
	.action(coverage);

program
	.command("screenshot")
	.description("Capture a screenshot of a running application window")
	.argument("<process>", "Name of the running process (e.g. notepad, code)")
	.action(screenshot);

registerActivity(program);
registerCliHook(program);
registerJira(program);
registerMermaid(program);
registerPrs(program);
registerRoam(program);
registerBacklog(program);
registerVerify(program);
registerRefactor(program);
registerDevlog(program);
registerDeploy(program);
registerComplexity(program);
registerDotnet(program);
registerNews(program);
registerRavendb(program);
registerSeq(program);
registerSql(program);
registerTranscript(program);
registerVoice(program);

registerSessions(program);
registerPrompts(program);
registerDeny(program);

program
	.command("next")
	.description("Alias for backlog next -w")
	.action(() => backlogNext({ allowEdits: true }));

program
	.command("draft")
	.alias("feat")
	.description("Launch Claude in /draft mode, chain into next on /next signal")
	.action(() => launchMode("draft"));

program
	.command("bug")
	.description("Launch Claude in /bug mode, chain into next on /next signal")
	.action(() => launchMode("bug"));

program
	.command("refine")
	.argument("[id]", "Backlog item ID")
	.description("Launch Claude in /refine mode to refine a backlog item")
	.action((id) => refine(id));

const signalCommand = program
	.command("signal")
	.description("Write an assist signal file");

signalCommand
	.command("next")
	.description("Write a next signal to chain into assist next")
	.action(() => {
		writeSignal("next");
		console.log("Signal written.");
	});

program.parse();
