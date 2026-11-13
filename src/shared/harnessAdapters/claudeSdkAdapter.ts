import { spawnClaudeSdk } from "../../commands/sessions/daemon/spawnClaudeSdk";
import { claudeAdapter } from "./claudeAdapter";
import { claudeConnectorProbe } from "./claudeConnectorProbe";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import { harnessLabel } from "./harnessLabel";
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
	interactive: ({
		sessionId,
		conversationId,
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
			appendSystemPromptFile,
			model,
		}),
	activityIdentity: (conversationId) => ({
		harness: "claude-sdk",
		claudeSessionId: conversationId,
	}),
};
