import { spawnCodexSdk } from "../../commands/sessions/daemon/sdk/codex/spawnCodexSdk";
import { codexSkillPrompt } from "../codexSkillPrompt";
import { codexAdapter } from "./codexAdapter";
import { launchSdkViaDaemon } from "./launchSdkViaDaemon";
import { codexHookProbe } from "./codexHookProbe";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import { harnessLabel } from "./harnessLabel";
import type { HarnessAdapter } from "./types";

export const codexSdkAdapter: HarnessAdapter = {
	...codexAdapter,
	kind: "codex-sdk",
	label: harnessLabel("codex-sdk"),
	capabilities: {
		...harnessCapabilityDeclarations["codex-sdk"],
		"intercept.command": codexHookProbe,
		"intercept.fileRead": codexHookProbe,
		"intercept.fileWrite": codexHookProbe,
	},
	detect: () => detectHarness("codex-sdk"),
	launchSkill: (skill, args, { cwd, allowEdits, model }) =>
		launchSdkViaDaemon({
			harness: "codex-sdk",
			prompt: codexSkillPrompt(skill, args ?? ""),
			cwd,
			allowEdits,
			model,
		}),
	launchPrompt: (prompt, { cwd, allowEdits, model }) =>
		launchSdkViaDaemon({
			harness: "codex-sdk",
			prompt: codexSkillPrompt(undefined, prompt),
			cwd,
			allowEdits,
			model,
		}),
	resume: (conversationId, nudge, { cwd, allowEdits }) =>
		launchSdkViaDaemon({
			harness: "codex-sdk",
			prompt: codexSkillPrompt(undefined, nudge),
			cwd,
			allowEdits,
			resumeId: conversationId,
		}),
	interactive: ({
		sessionId,
		resumeId,
		prompt,
		cwd,
		appendSystemPromptFile,
		model,
	}) =>
		spawnCodexSdk({
			prompt,
			cwd,
			sessionId,
			resumeId,
			appendSystemPromptFile,
			model,
		}),
	drivenSession: spawnCodexSdk,
	activityIdentity: (_conversationId, resumedId) =>
		resumedId
			? { harness: "codex-sdk", harnessSessionId: resumedId }
			: { harness: "codex-sdk" },
};
