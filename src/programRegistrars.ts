import type { Command } from "commander";
import { registerNew } from "./commands/new/registerNew";
import { registerActivity } from "./commands/registerActivity";
import { registerAdvise } from "./commands/registerAdvise";
import { registerAsk } from "./commands/registerAsk";
import { registerAskQuestion } from "./commands/registerAskQuestion";
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
import { registerBrowser } from "./commands/registerBrowser";
import { registerExtension } from "./commands/registerExtension";
import { registerDb } from "./commands/registerDb";
import { registerDbMigration } from "./commands/registerDbMigration";
import { registerDeny } from "./commands/registerDeny";
import { registerDeploy } from "./commands/registerDeploy";
import { registerDevlog } from "./commands/registerDevlog";
import { registerDocs } from "./commands/registerDocs";
import { registerDotnet } from "./commands/registerDotnet";
import { registerEditHook } from "./commands/registerEditHook";
import { registerGithub } from "./commands/registerGithub";
import { registerInbox } from "./commands/registerInbox";
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
import { registerShow } from "./commands/registerShow";
import { registerSignal } from "./commands/registerSignal";
import { registerSlack } from "./commands/registerSlack";
import { registerSql } from "./commands/registerSql";
import { registerSync } from "./commands/registerSync";
import { registerTranscript } from "./commands/registerTranscript";
import { registerVerify } from "./commands/registerVerify";
import { registerWatch } from "./commands/registerWatch";
import { registerRoam } from "./commands/roam/registerRoam";
import { registerRun } from "./commands/run/registerRun";
import { registerDaemon } from "./commands/sessions/daemon/registerDaemon";
import { registerSessions } from "./commands/sessions/registerSessions";

export const programRegistrars: ((program: Command) => void)[] = [
	registerSync,
	registerRootCommands,
	registerCommit,
	registerConfig,
	registerRun,
	registerNew,
	registerActivity,
	registerAdvise,
	registerBackup,
	registerChart,
	registerDb,
	registerDbMigration,
	registerCliHook,
	registerCodeComment,
	registerCodexHook,
	registerPiHook,
	registerEditHook,
	registerGithub,
	registerInbox,
	registerJira,
	registerMermaid,
	registerMiro,
	registerPrs,
	registerReadTime,
	registerReleases,
	registerRoam,
	registerBacklog,
	registerBranch,
	registerList,
	registerVerify,
	registerRefactor,
	registerReview,
	registerRules,
	registerDevlog,
	registerDocs,
	registerDeploy,
	registerComplexity,
	registerDotnet,
	registerNews,
	registerNetcap,
	registerExtension,
	registerBrowser,
	registerLitellm,
	registerRavendb,
	registerSeq,
	registerShow,
	registerAsk,
	registerAskQuestion,
	registerSlack,
	registerSql,
	registerTranscript,
	registerWatch,
	registerSessions,
	registerDaemon,
	registerPrompts,
	registerDeny,
	registerLaunch,
	registerSignal,
];
