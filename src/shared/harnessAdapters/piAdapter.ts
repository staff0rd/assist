import { spawnPi as spawnPiPty } from "../../commands/sessions/daemon/spawnPi";
import { harnessLabel } from "../harnessLabel";
import { spawnPi } from "../spawnPi";
import { buildSlashCommand } from "./buildSlashCommand";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
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
	capabilities: harnessCapabilityDeclarations.pi,
	detect: () => detectHarness("pi"),
	conversation: {
		idName: "pi conversation id",
		findResumable: () => undefined,
		locate: () => Promise.resolve(null),
	},
	launchSkill: (skill, args, { cwd }) =>
		spawnPi(buildSlashCommand(skill, args), { cwd }),
	launchPrompt: (prompt, { cwd }) => spawnPi(prompt, { cwd }),
	resume: cannotResume,
	interactive: ({ sessionId, prompt, cwd }) =>
		spawnPiPty({ prompt, cwd, sessionId }),
	oneShot: noOneShot,
	structured: noOneShot,
	activityIdentity: () => ({ harness: "pi" }),
};
