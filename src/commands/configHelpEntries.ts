import type { ConfigHelpEntry } from "../shared/configHelp";
import { adviceConfigHelp } from "./advise/adviceConfigHelp";
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
import { litellmConfigHelp } from "./litellm/litellmConfigHelp";
import { mermaidConfigHelp } from "./mermaid/mermaidConfigHelp";
import { miroConfigHelp } from "./miro/miroConfigHelp";
import { newsConfigHelp } from "./news/newsConfigHelp";
import { nextConfigHelp } from "./sessions/nextConfigHelp";
import { prsConfigHelp } from "./prs/prsConfigHelp";
import { ravendbConfigHelp } from "./ravendb/ravendbConfigHelp";
import { readTimeConfigHelp } from "./readTime/readTimeConfigHelp";
import { refactorConfigHelp } from "./refactor/refactorConfigHelp";
import { releasesConfigHelp } from "./releases/releasesConfigHelp";
import { reviewConfigHelp } from "./review/reviewConfigHelp";
import { roamConfigHelp } from "./roam/roamConfigHelp";
import { rootConfigHelp } from "./rootConfigHelp";
import { runConfigHelp } from "./run/runConfigHelp";
import { seqConfigHelp } from "./seq/seqConfigHelp";
import { nodesConfigHelp } from "./sessions/nodes/nodesConfigHelp";
import { sessionsConfigHelp } from "./sessions/sessionsConfigHelp";
import { webConfigHelp } from "./sessions/webConfigHelp";
import { slackConfigHelp } from "./slack/slackConfigHelp";
import { sqlConfigHelp } from "./sql/sqlConfigHelp";
import { transcriptConfigHelp } from "./transcript/transcriptConfigHelp";
import { verifyConfigHelp } from "./verify/verifyConfigHelp";

export const configHelpEntries: ConfigHelpEntry[] = [
	...Object.values(rootConfigHelp).flat(),
	...adviceConfigHelp,
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
	...litellmConfigHelp,
	...mermaidConfigHelp,
	...miroConfigHelp,
	...newsConfigHelp,
	...nextConfigHelp,
	...prsConfigHelp,
	...ravendbConfigHelp,
	...readTimeConfigHelp,
	...refactorConfigHelp,
	...releasesConfigHelp,
	...reviewConfigHelp,
	...roamConfigHelp,
	...runConfigHelp,
	...seqConfigHelp,
	...sessionsConfigHelp,
	...nodesConfigHelp,
	...webConfigHelp,
	...slackConfigHelp,
	...sqlConfigHelp,
	...transcriptConfigHelp,
	...verifyConfigHelp,
];
