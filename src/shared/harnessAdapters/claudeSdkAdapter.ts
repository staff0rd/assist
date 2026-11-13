import { spawnClaudeSdk } from "../../commands/sessions/daemon/spawnClaudeSdk";
import { claudeAdapter } from "./claudeAdapter";
import { claudeConnectorProbe } from "./claudeConnectorProbe";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import { harnessLabel } from "./harnessLabel";
import { buildSlashCommand } from "./buildSlashCommand";
import { launchSdkViaDaemon } from "./launchSdkViaDaemon";
import type { HarnessAdapter } from "./types";

export const claudeSdkAdapter: HarnessAdapter = {
	...claudeAdapter,
	kind: "claude-sdk",
	label: harnessLabel("claude-sdk"),
	capabilities: {
		...harnessCapabilityDeclarations["claude-sdk"],
		"connector.gmail.read": () => claudeConnectorProbe("Gmail"),
		"connector.slack.read": () => claudeConnectorProbe("Slack"),
	},
	detect: () => detectHarness("claude-sdk"),
	launchSkill: (skill, args, { conversationId, cwd, model }) =>
		launchSdkViaDaemon({
			prompt: buildSlashCommand(skill, args),
			cwd,
			conversationId,
			model,
		}),
	launchPrompt: (prompt, { conversationId, cwd, model }) =>
		launchSdkViaDaemon({ prompt, cwd, conversationId, model }),
	resume: (conversationId, nudge, { cwd }) =>
		launchSdkViaDaemon({ prompt: nudge, cwd, resumeId: conversationId }),
	interactive: ({
		sessionId,
		conversationId,
		resumeId,
		prompt,
		cwd,
		appendSystemPromptFile,
		model,
	}) =>
		spawnClaudeSdk({
			prompt,
			cwd,
			sessionId,
			claudeSessionId: conversationId,
			resumeId,
			appendSystemPromptFile,
			model,
		}),
	activityIdentity: (conversationId) => ({
		harness: "claude-sdk",
		claudeSessionId: conversationId,
	}),
};
