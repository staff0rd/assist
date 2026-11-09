import { harnessLabel } from "../harnessLabel";
import { spawnPi } from "../spawnPi";
import { buildSlashCommand } from "./buildSlashCommand";
import { detectHarness } from "./detectHarness";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import type { HarnessAdapter } from "./types";

function cannotResume(): never {
	throw new Error("pi sessions cannot be resumed yet");
}

export const piAdapter: HarnessAdapter = {
	kind: "pi",
	label: harnessLabel("pi"),
	capabilities: harnessCapabilityDeclarations.pi,
	detect: () => detectHarness("pi"),
	conversation: {
		idName: "pi conversation id",
		findResumable: () => undefined,
	},
	launchSkill: (skill, args, { cwd }) =>
		spawnPi(buildSlashCommand(skill, args), { cwd }),
	resume: cannotResume,
	activityIdentity: () => ({ harness: "pi" }),
};
