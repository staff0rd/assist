import { hasTranscriptOnDisk } from "../../commands/sessions/daemon/hasTranscriptOnDisk";
import { harnessLabel } from "../harnessLabel";
import { spawnClaude } from "../spawnClaude";
import { buildSlashCommand } from "./buildSlashCommand";
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
	},
	launchSkill: (skill, args, { conversationId }) =>
		spawnClaude(buildSlashCommand(skill, args), {
			allowEdits: true,
			sessionId: conversationId,
		}),
	resume: (conversationId, nudge) =>
		spawnClaude(nudge, { allowEdits: true, resumeSessionId: conversationId }),
	activityIdentity: (conversationId) => ({ claudeSessionId: conversationId }),
};
