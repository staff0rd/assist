import { spawnPi as spawnPiPty } from "../../commands/sessions/daemon/spawnPi";
import { harnessLabel } from "./harnessLabel";
import { spawnPi } from "../spawnPi";
import { buildSlashCommand } from "./buildSlashCommand";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import { piExtensionProbe } from "./piExtensionProbe";
import { piToolOperations } from "./piToolOperations";
import { rejectConnectorRun } from "./rejectConnectorRun";
import type { HarnessAdapter } from "./types";

function cannotResume(): never {
	throw new Error("pi sessions cannot be resumed yet");
}

function noOneShot(): never {
	throw new Error("assist has no headless pi one-shot yet");
}

export const piAdapter: HarnessAdapter = {
	kind: "pi",
	label: harnessLabel("pi"),
	capabilities: {
		...harnessCapabilityDeclarations.pi,
		"intercept.command": piExtensionProbe,
		"intercept.fileRead": piExtensionProbe,
		"intercept.fileWrite": piExtensionProbe,
	},
	detect: () => detectHarness("pi"),
	conversation: {
		idName: "pi conversation id",
		findResumable: () => undefined,
		locate: () => Promise.resolve(null),
		current: () => undefined,
		boundId: () => undefined,
		toRef: (harnessSessionId, cwd) => ({ cwd, harnessSessionId }),
		relocate: cannotResume,
	},
	toolOperations: piToolOperations,
	launchSkill: (skill, args, { cwd, model }) =>
		spawnPi(buildSlashCommand(skill, args), { cwd, model }),
	launchPrompt: (prompt, { cwd, model }) => spawnPi(prompt, { cwd, model }),
	resume: cannotResume,
	interactive: ({ sessionId, resumeId, prompt, cwd, model }) =>
		resumeId ? cannotResume() : spawnPiPty({ prompt, cwd, sessionId, model }),
	oneShot: noOneShot,
	structured: noOneShot,
	connectorRun: rejectConnectorRun("pi"),
	activityIdentity: () => ({ harness: "pi" }),
};
