import { spawnCodex as spawnCodexPty } from "../../commands/sessions/daemon/spawnCodex";
import { findCodexRolloutPath } from "../../commands/sessions/shared/codex/findCodexRolloutPath";
import { hasCodexRolloutSync } from "../../commands/sessions/shared/codex/hasCodexRolloutSync";
import { harnessLabel } from "../harnessLabel";
import { spawnCodex } from "../spawnCodex";
import { codexOneShot } from "./codexOneShot";
import { codexStructuredRun } from "./codexStructuredRun";
import { offerCodexInstall } from "./offerCodexInstall";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import { rejectConnectorRun } from "./rejectConnectorRun";
import type { HarnessAdapter } from "./types";

const sandbox = (allowEdits: boolean | undefined) =>
	allowEdits === false ? "read-only" : "workspace-write";

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
		locate: findCodexRolloutPath,
	},
	launchSkill: (skill, args, { cwd, allowEdits }) =>
		spawnCodex(args ?? "", { cwd, sandbox: sandbox(allowEdits), skill }),
	launchPrompt: (prompt, { cwd, allowEdits }) =>
		spawnCodex(prompt, { cwd, sandbox: sandbox(allowEdits) }),
	resume: (conversationId, nudge, { cwd, allowEdits }) =>
		spawnCodex(nudge, {
			cwd,
			sandbox: sandbox(allowEdits),
			resumeSessionId: conversationId,
		}),
	interactive: ({ sessionId, prompt, cwd }) =>
		spawnCodexPty({ prompt, cwd, sessionId }),
	oneShot: codexOneShot,
	structured: codexStructuredRun,
	connectorRun: rejectConnectorRun("Codex"),
	offerInstall: offerCodexInstall,
	activityIdentity: (_conversationId, resumedId) =>
		resumedId
			? { harness: "codex", harnessSessionId: resumedId }
			: { harness: "codex" },
};
