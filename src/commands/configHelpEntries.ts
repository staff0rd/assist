import type { ConfigHelpEntry } from "../shared/configHelp";
import { backlogConfigHelp } from "./backlog/backlogConfigHelp";
import { harnessConfigHelp } from "./backlog/harnessConfigHelp";
import { backupConfigHelp } from "./backup/backupConfigHelp";
import { branchConfigHelp } from "./branch/branchConfigHelp";
import { cliHookConfigHelp } from "./cliHook/cliHookConfigHelp";
import { complexityConfigHelp } from "./complexity/complexityConfigHelp";
import { configConfigHelp } from "./config/configConfigHelp";
import { denyConfigHelp } from "./deny/denyConfigHelp";
import { devlogConfigHelp } from "./devlog/devlogConfigHelp";
import { dotnetConfigHelp } from "./dotnet/dotnetConfigHelp";
import { jiraConfigHelp } from "./jira/jiraConfigHelp";
import { mermaidConfigHelp } from "./mermaid/mermaidConfigHelp";
import { miroConfigHelp } from "./miro/miroConfigHelp";
import { prsConfigHelp } from "./prs/prsConfigHelp";
import { ravendbConfigHelp } from "./ravendb/ravendbConfigHelp";
import { refactorConfigHelp } from "./refactor/refactorConfigHelp";
import { roamConfigHelp } from "./roam/roamConfigHelp";
import { rootConfigHelp } from "./rootConfigHelp";
import { runConfigHelp } from "./run/runConfigHelp";
import { seqConfigHelp } from "./seq/seqConfigHelp";
import { sessionsConfigHelp } from "./sessions/sessionsConfigHelp";
import { slackConfigHelp } from "./slack/slackConfigHelp";
import { sqlConfigHelp } from "./sql/sqlConfigHelp";
import { transcriptConfigHelp } from "./transcript/transcriptConfigHelp";
import { verifyConfigHelp } from "./verify/verifyConfigHelp";
import { voiceConfigHelp } from "./voice/voiceConfigHelp";

export const configHelpEntries: ConfigHelpEntry[] = [
	...Object.values(rootConfigHelp).flat(),
	...backlogConfigHelp,
	...backupConfigHelp,
	...branchConfigHelp,
	...cliHookConfigHelp,
	...complexityConfigHelp,
	...configConfigHelp,
	...denyConfigHelp,
	...devlogConfigHelp,
	...dotnetConfigHelp,
	...harnessConfigHelp,
	...jiraConfigHelp,
	...mermaidConfigHelp,
	...miroConfigHelp,
	...prsConfigHelp,
	...ravendbConfigHelp,
	...refactorConfigHelp,
	...roamConfigHelp,
	...runConfigHelp,
	...seqConfigHelp,
	...sessionsConfigHelp,
	...slackConfigHelp,
	...sqlConfigHelp,
	...transcriptConfigHelp,
	...verifyConfigHelp,
	...voiceConfigHelp,
];
