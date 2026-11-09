import { hasCodexRolloutSync } from "../../commands/sessions/shared/codex/hasCodexRolloutSync";
import { harnessLabel } from "../harnessLabel";
import { spawnCodex } from "../spawnCodex";
import { buildSlashCommand } from "./buildSlashCommand";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import type { HarnessAdapter } from "./types";

export const codexAdapter: HarnessAdapter = {
	kind: "codex",
	label: harnessLabel("codex"),
	capabilities: harnessCapabilityDeclarations.codex,
	detect: () => detectHarness("codex"),
	conversation: {
		idName: "Codex conversation id",
		findResumable: ({ harnessSessionId }) =>
			harnessSessionId && hasCodexRolloutSync(harnessSessionId)
				? harnessSessionId
				: undefined,
	},
	launchSkill: (skill, args, { cwd }) =>
		spawnCodex(buildSlashCommand(skill, args), {
			cwd,
			sandbox: "workspace-write",
		}),
	resume: (conversationId, nudge, { cwd }) =>
		spawnCodex(nudge, {
			cwd,
			sandbox: "workspace-write",
			resumeSessionId: conversationId,
		}),
	activityIdentity: (_conversationId, resumedId) =>
		resumedId
			? { harness: "codex", harnessSessionId: resumedId }
			: { harness: "codex" },
};
