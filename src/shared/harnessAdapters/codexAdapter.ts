import { spawnCodex as spawnCodexPty } from "../../commands/sessions/daemon/spawnCodex";
import { findCodexRolloutPath } from "../../commands/sessions/shared/codex/findCodexRolloutPath";
import { hasCodexRolloutSync } from "../../commands/sessions/shared/codex/hasCodexRolloutSync";
import { resolveCodexSessionId } from "../../commands/sessions/shared/codex/resolveCodexSessionId";
import { codexConversationReader } from "./codexConversationReader";
import { harnessLabel } from "../harnessLabel";
import { readCodexRulePerms } from "../readCodexRulePerms";
import { spawnCodex } from "../spawnCodex";
import { codexOneShot } from "./codexOneShot";
import { codexRelocate } from "./codexRelocate";
import { codexStructuredRun } from "./codexStructuredRun";
import { codexToolOperations } from "./codexToolOperations";
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
		current: () => process.env.CODEX_THREAD_ID || undefined,
		boundId: ({ harnessSessionId }) => harnessSessionId,
		toRef: (harnessSessionId, cwd) => ({ cwd, harnessSessionId }),
		discover: resolveCodexSessionId,
		relocate: codexRelocate,
		reader: codexConversationReader,
	},
	toolOperations: codexToolOperations,
	permissionRules: readCodexRulePerms,
	launchSkill: (skill, args, { cwd, allowEdits, model }) =>
		spawnCodex(args ?? "", {
			cwd,
			sandbox: sandbox(allowEdits),
			skill,
			model,
		}),
	launchPrompt: (prompt, { cwd, allowEdits, model }) =>
		spawnCodex(prompt, { cwd, sandbox: sandbox(allowEdits), model }),
	resume: (conversationId, nudge, { cwd, allowEdits }) =>
		spawnCodex(nudge, {
			cwd,
			sandbox: sandbox(allowEdits),
			resumeSessionId: conversationId,
		}),
	interactive: ({
		sessionId,
		resumeId,
		prompt,
		cwd,
		appendSystemPromptFile,
		model,
	}) =>
		spawnCodexPty({
			prompt,
			cwd,
			sessionId,
			resumeSessionId: resumeId,
			appendSystemPromptFile,
			model,
		}),
	oneShot: codexOneShot,
	structured: codexStructuredRun,
	connectorRun: rejectConnectorRun("Codex"),
	offerInstall: offerCodexInstall,
	activityIdentity: (_conversationId, resumedId) =>
		resumedId
			? { harness: "codex", harnessSessionId: resumedId }
			: { harness: "codex" },
};
