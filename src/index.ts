#!/usr/bin/env node
import { Command } from "commander";
import packageJson from "../package.json";
import { registerNew } from "./commands/new/registerNew";
import { registerActivity } from "./commands/registerActivity";
import { registerAdvise } from "./commands/registerAdvise";
import { registerBackup } from "./commands/registerBackup";
import { registerChart } from "./commands/registerChart";
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
import { registerLitellm } from "./commands/registerLitellm";
import { registerMermaid } from "./commands/registerMermaid";
import { registerMiro } from "./commands/miro/registerMiro";
import { registerNetcap } from "./commands/registerNetcap";
import { registerNews } from "./commands/registerNews";
import { registerPiHook } from "./commands/registerPiHook";
import { registerPrompts } from "./commands/registerPrompts";
import { registerPrs } from "./commands/registerPrs";
import { registerReadTime } from "./commands/registerReadTime";
import { registerRavendb } from "./commands/registerRavendb";
import { registerReleases } from "./commands/registerReleases";
import { registerRootCommands } from "./commands/registerRootCommands";
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
import { registerRun } from "./commands/run/registerRun";
import { registerDaemon } from "./commands/sessions/daemon/registerDaemon";
import { registerSessions } from "./commands/sessions/registerSessions";
import { web as sessionsWeb } from "./commands/sessions/web";
import { reportCliError } from "./reportCliError";
import { closeDb } from "./shared/db/getDb";

const program = new Command();

program
	.name("assist")
	.description("CLI application")
	.version(packageJson.version)
	.option("--no-open", "Do not open a browser on startup")
	.action((options) => sessionsWeb({ port: "3100", open: options.open }));

registerSync(program);
registerRootCommands(program);

registerCommit(program);

registerConfig(program);

registerRun(program);

registerNew(program);

registerActivity(program);
registerAdvise(program);
registerBackup(program);
registerChart(program);
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
registerReadTime(program);
registerReleases(program);
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
registerLitellm(program);
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
