#!/usr/bin/env node
import { Command } from "commander";
import packageJson from "../package.json";
import { coverage } from "./commands/coverage";
import { init } from "./commands/init";
import { init as lintInit } from "./commands/lint/init";
import { lint } from "./commands/lint/lint";
import { registerNew } from "./commands/new/registerNew";
import { notify } from "./commands/notify";
import { registerActivity } from "./commands/registerActivity";
import { registerBackup } from "./commands/registerBackup";
import { registerBacklog } from "./commands/registerBacklog";
import { registerBranch } from "./commands/registerBranch";
import { registerCliHook } from "./commands/registerCliHook";
import { registerCodeComment } from "./commands/registerCodeComment";
import { registerCodexHook } from "./commands/registerCodexHook";
import { registerCommit } from "./commands/registerCommit";
import { registerComplexity } from "./commands/registerComplexity";
import { registerConfig } from "./commands/registerConfig";
import { registerCriteriaExtension } from "./commands/registerCriteriaExtension";
import { registerDb } from "./commands/registerDb";
import { registerDbMigration } from "./commands/registerDbMigration";
import { registerDeny } from "./commands/registerDeny";
import { registerDeploy } from "./commands/registerDeploy";
import { registerDevlog } from "./commands/registerDevlog";
import { registerDotnet } from "./commands/registerDotnet";
import { registerEditHook } from "./commands/registerEditHook";
import { registerGithub } from "./commands/registerGithub";
import { registerHandover } from "./commands/registerHandover";
import { registerJira } from "./commands/registerJira";
import { registerLaunch } from "./commands/registerLaunch";
import { registerList } from "./commands/registerList";
import { registerMermaid } from "./commands/registerMermaid";
import { registerMiro } from "./commands/miro/registerMiro";
import { registerNetcap } from "./commands/registerNetcap";
import { registerNews } from "./commands/registerNews";
import { registerPiHook } from "./commands/registerPiHook";
import { registerPrompts } from "./commands/registerPrompts";
import { registerPrs } from "./commands/registerPrs";
import { registerRavendb } from "./commands/registerRavendb";
import { registerRefactor } from "./commands/registerRefactor";
import { registerReview } from "./commands/registerReview";
import { registerRules } from "./commands/registerRules";
import { registerSeq } from "./commands/registerSeq";
import { registerSignal } from "./commands/registerSignal";
import { registerSlack } from "./commands/registerSlack";
import { registerSql } from "./commands/registerSql";
import { registerSync } from "./commands/registerSync";
import { registerTranscript } from "./commands/registerTranscript";
import { registerVerify } from "./commands/registerVerify";
import { registerVoice } from "./commands/registerVoice";
import { registerWatch } from "./commands/registerWatch";
import { registerRoam } from "./commands/roam/registerRoam";
import { rootConfigHelp } from "./commands/rootConfigHelp";
import { registerRun } from "./commands/run/registerRun";
import { screenshot } from "./commands/screenshot";
import { registerDaemon } from "./commands/sessions/daemon/registerDaemon";
import { registerSessions } from "./commands/sessions/registerSessions";
import { web as sessionsWeb } from "./commands/sessions/web";
import { statusLine } from "./commands/statusLine";
import { update } from "./commands/update";
import { init as vscodeInit } from "./commands/vscode";
import { reportCliError } from "./reportCliError";
import { configHelp } from "./shared/configHelp";
import { closeDb } from "./shared/db/getDb";

const program = new Command();

program
	.name("assist")
	.description("CLI application")
	.version(packageJson.version)
	.option("--no-open", "Do not open a browser on startup")
	.action((options) => sessionsWeb({ port: "3100", open: options.open }));

registerSync(program);

program
	.command("init")
	.description("Initialize VS Code and verify configurations")
	.action(init);

registerCommit(program);

registerConfig(program);

registerRun(program);

registerNew(program);

const lintCommand = program
	.command("lint")
	.description("Run lint checks for conventions not enforced by oxlint")
	.option("-f, --fix", "Auto-fix violations where possible")
	.action(lint);

lintCommand
	.command("init")
	.description("Initialize oxlint with baseline linter config")
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

const notifyCommand = program
	.command("notify")
	.description(
		"Show notification from Claude Code hook (reads JSON from stdin)",
	)
	.action(notify);

configHelp(notifyCommand, rootConfigHelp.notify);

program
	.command("update")
	.description("Update assist to the latest version and sync commands")
	.action(update);

program
	.command("coverage")
	.description("Print global statement coverage percentage")
	.action(coverage);

const screenshotCommand = program
	.command("screenshot")
	.description("Capture a screenshot of a running application window")
	.argument("<process>", "Name of the running process (e.g. notepad, code)")
	.action(screenshot);

configHelp(screenshotCommand, rootConfigHelp.screenshot);

registerActivity(program);
registerBackup(program);
registerDb(program);
registerDbMigration(program);
registerCliHook(program);
registerCodeComment(program);
registerCodexHook(program);
registerPiHook(program);
registerEditHook(program);
registerGithub(program);
registerHandover(program);
registerJira(program);
registerMermaid(program);
registerMiro(program);
registerPrs(program);
registerRoam(program);
registerBacklog(program);
registerBranch(program);
registerList(program);
registerVerify(program);
registerRefactor(program);
registerReview(program);
registerRules(program);
registerDevlog(program);
registerDeploy(program);
registerComplexity(program);
registerDotnet(program);
registerNews(program);
registerNetcap(program);
registerCriteriaExtension(program);
registerRavendb(program);
registerSeq(program);
registerSlack(program);
registerSql(program);
registerTranscript(program);
registerVoice(program);
registerWatch(program);

registerSessions(program);
registerDaemon(program);
registerPrompts(program);
registerDeny(program);

registerLaunch(program);
registerSignal(program);

program
	.parseAsync()
	.catch(reportCliError)
	.finally(() => closeDb());
