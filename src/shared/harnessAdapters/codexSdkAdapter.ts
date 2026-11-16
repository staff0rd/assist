import { spawnCodexSdk } from "../../commands/sessions/daemon/sdk/codex/spawnCodexSdk";
import { codexAdapter } from "./codexAdapter";
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
