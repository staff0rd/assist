import { hasTranscriptOnDisk } from "../../commands/sessions/daemon/hasTranscriptOnDisk";
import { spawnClaude as spawnClaudePty } from "../../commands/sessions/daemon/spawnClaude";
import { findSessionJsonlPath } from "../../commands/sessions/shared/findSessionJsonlPath";
import { harnessLabel } from "../harnessLabel";
import { spawnClaude } from "../spawnClaude";
import { buildSlashCommand } from "./buildSlashCommand";
import { claudeOneShot } from "./claudeOneShot";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import type { HarnessAdapter } from "./types";

export const claudeAdapter: HarnessAdapter = {
	kind: "claude",
	label: harnessLabel("claude"),
	capabilities: harnessCapabilityDeclarations.claude,
	detect: () => detectHarness("claude"),
	conversation: {
		idName: "claude session id",
		findResumable: (ref) =>
			hasTranscriptOnDisk(ref) ? ref.claudeSessionId : undefined,
		locate: findSessionJsonlPath,
	},
	launchSkill: (skill, args, { conversationId, allowEdits }) =>
		spawnClaude(buildSlashCommand(skill, args), {
			allowEdits: allowEdits ?? true,
			sessionId: conversationId,
		}),
	launchPrompt: (prompt, { conversationId, allowEdits }) =>
		spawnClaude(prompt, {
			allowEdits: allowEdits ?? true,
			sessionId: conversationId,
		}),
	resume: (conversationId, nudge, { allowEdits }) =>
		spawnClaude(nudge, {
			allowEdits: allowEdits ?? true,
			resumeSessionId: conversationId,
		}),
	interactive: ({ sessionId, conversationId, prompt, cwd, design, auto }) =>
		spawnClaudePty({
			prompt,
			cwd,
			sessionId,
			claudeSessionId: conversationId,
			design,
			auto,
		}),
	oneShot: claudeOneShot,
	activityIdentity: (conversationId) => ({ claudeSessionId: conversationId }),
};
