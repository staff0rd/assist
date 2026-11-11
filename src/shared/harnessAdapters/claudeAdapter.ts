import { hasTranscriptOnDisk } from "../../commands/sessions/daemon/hasTranscriptOnDisk";
import { spawnClaude as spawnClaudePty } from "../../commands/sessions/daemon/spawnClaude";
import { findSessionJsonlPath } from "../../commands/sessions/shared/findSessionJsonlPath";
import { harnessLabel } from "./harnessLabel";
import { spawnClaude } from "../spawnClaude";
import { buildSlashCommand } from "./buildSlashCommand";
import { carryTranscriptToTree } from "./carryTranscriptToTree";
import { claudeConnectorProbe } from "./claudeConnectorProbe";
import { claudeInterruptedTasks } from "./claudeInterruptedTasks";
import { claudeConversationReader } from "./claudeConversationReader";
import { claudeConnectorRun } from "./claudeConnectorRun";
import { claudeOneShot } from "./claudeOneShot";
import { claudeStructuredRun } from "./claudeStructuredRun";
import { claudeToolOperations } from "./claudeToolOperations";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import type { HarnessAdapter } from "./types";

export const claudeAdapter: HarnessAdapter = {
	kind: "claude",
	label: harnessLabel("claude"),
	capabilities: {
		...harnessCapabilityDeclarations.claude,
		"connector.gmail.read": () => claudeConnectorProbe("Gmail"),
		"connector.slack.read": () => claudeConnectorProbe("Slack"),
	},
	detect: () => detectHarness("claude"),
	conversation: {
		idName: "claude session id",
		findResumable: (ref) =>
			hasTranscriptOnDisk(ref) ? ref.claudeSessionId : undefined,
		locate: findSessionJsonlPath,
		current: () => process.env.CLAUDE_CODE_SESSION_ID || undefined,
		boundId: ({ claudeSessionId }) => claudeSessionId,
		toRef: (claudeSessionId, cwd) => ({ cwd, claudeSessionId }),
		relocate: carryTranscriptToTree,
		reader: claudeConversationReader,
		interruptedTasks: claudeInterruptedTasks,
	},
	toolOperations: claudeToolOperations,
	launchSkill: (skill, args, { conversationId, allowEdits, model }) =>
		spawnClaude(buildSlashCommand(skill, args), {
			allowEdits: allowEdits ?? true,
			sessionId: conversationId,
			model,
		}),
	launchPrompt: (prompt, { conversationId, allowEdits, model }) =>
		spawnClaude(prompt, {
			allowEdits: allowEdits ?? true,
			sessionId: conversationId,
			model,
		}),
	resume: (conversationId, nudge, { allowEdits }) =>
		spawnClaude(nudge, {
			allowEdits: allowEdits ?? true,
			resumeSessionId: conversationId,
		}),
	interactive: ({
		sessionId,
		conversationId,
		resumeId,
		prompt,
		cwd,
		appendSystemPromptFile,
		auto,
		model,
	}) =>
		spawnClaudePty({
			prompt,
			cwd,
			sessionId,
			resumeSessionId: resumeId,
			claudeSessionId: conversationId,
			appendSystemPromptFile,
			auto,
			model,
		}),
	oneShot: claudeOneShot,
	structured: claudeStructuredRun,
	connectorRun: claudeConnectorRun,
	activityIdentity: (conversationId) => ({ claudeSessionId: conversationId }),
};
